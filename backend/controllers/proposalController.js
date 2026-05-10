const { supabaseAdmin } = require('../config/supabase');

exports.createProposal = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can submit proposals' });
    }

    const { job_id, cover_letter, bid_amount, delivery_days } = req.body;

    // Check subscription limits
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan')
      .eq('user_id', req.user.id)
      .single();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabaseAdmin
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('freelancer_id', req.user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (sub?.plan === 'free' && count >= 3) {
      return res.status(403).json({ error: 'Free plan limited to 3 proposals/month. Upgrade to Pro Freelancer.' });
    }

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .insert({ job_id, freelancer_id: req.user.id, cover_letter, bid_amount, delivery_days })
      .select()
      .single();

    if (error) throw error;

    // Notify client about new proposal
    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('client_id, title')
      .eq('id', job_id)
      .single();

    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: job.client_id,
        type: 'proposal',
        title: 'New Proposal Received',
        body: `You received a new proposal for "${job.title}"`,
        data: { job_id, proposal_id: data.id },
      })
      .catch(() => null);

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyProposals = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('*, jobs(*)')
      .eq('freelancer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobProposals = async (req, res) => {
  try {
    const { job_id } = req.params;
    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('client_id')
      .eq('id', job_id)
      .single();

    if (!job || job.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('*, profiles!freelancer_id(full_name, avatar_url, freelancer_profiles(*))')
      .eq('job_id', job_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: proposal } = await supabaseAdmin
      .from('proposals')
      .select('*, jobs(client_id, title)')
      .eq('id', id)
      .single();

    if (!proposal || proposal.jobs.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (status === 'accepted') {
      // Create contract
      const { data: contract, error: contractError } = await supabaseAdmin
        .from('contracts')
        .insert({
          job_id: proposal.job_id,
          proposal_id: proposal.id,
          client_id: proposal.jobs.client_id,
          freelancer_id: proposal.freelancer_id,
          title: proposal.jobs.title,
          amount: proposal.bid_amount,
          status: 'active',
        })
        .select()
        .single();

      if (contractError) {
        console.warn('Contract creation failed:', contractError.message);
      }

      // Update job status
      await supabaseAdmin
        .from('jobs')
        .update({ status: 'in_progress', hired_freelancer_id: proposal.freelancer_id })
        .eq('id', proposal.job_id);

      // Reject all other proposals for this job
      await supabaseAdmin
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('job_id', proposal.job_id)
        .neq('id', id);

      // ✅ NEW: Notify the freelancer that their proposal was accepted
      if (contract && contract.id) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: proposal.freelancer_id,
            type: 'contract',
            title: 'Proposal Accepted! 🎉',
            body: `Your proposal for "${proposal.jobs.title}" has been accepted. The contract is now active.`,
            data: { contract_id: contract.id, job_id: proposal.job_id },
          })
          .catch(err => console.warn('Freelancer notification insert failed:', err.message));
      } else {
        // Even if contract creation failed, still notify about the acceptance (maybe just a fallback)
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: proposal.freelancer_id,
            type: 'proposal',
            title: 'Proposal Accepted',
            body: `Great news! Your proposal for "${proposal.jobs.title}" has been accepted. The client will contact you soon.`,
            data: { job_id: proposal.job_id },
          })
          .catch(() => null);
      }
    }

    // Optional: Also notify freelancer when proposal is rejected
    if (status === 'rejected') {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: proposal.freelancer_id,
          type: 'proposal',
          title: 'Proposal Update',
          body: `Your proposal for "${proposal.jobs.title}" was not selected this time. Keep applying!`,
          data: { job_id: proposal.job_id },
        })
        .catch(() => null);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};