const { supabaseAdmin } = require('../config/supabase');

exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can post jobs' });
    }

    // Check subscription limits
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan')
      .eq('user_id', req.user.id)
      .single();

    if (sub?.plan === 'free') {
      const { count } = await supabaseAdmin
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', req.user.id)
        .eq('status', 'open');

      if (count >= 3) {
        return res.status(403).json({ error: 'Free plan limited to 3 active jobs. Upgrade to Business Client.' });
      }
    }

    const jobData = { ...req.body, client_id: req.user.id, status: 'open' };
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;

    // Increment category count
    if (data.category_id) {
      await supabaseAdmin.rpc('increment_job_count', { category_id_param: data.category_id }).catch(() => null);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { category, search, budget_min, budget_max, skills, status = 'open', page = 1, limit = 10, client } = req.query;
    let query = supabaseAdmin
      .from('jobs')
      .select('*, profiles!client_id(full_name, avatar_url), categories(name, slug)', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category_id', category);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    if (budget_min) query = query.gte('budget_min', budget_min);
    if (budget_max) query = query.lte('budget_max', budget_max);
    if (skills) {
      const skillsArray = skills.split(',');
      query = query.contains('skills_required', skillsArray);
    }
    // ✅ Filter by client if requested
    if (client === 'true' && req.user) {
      query = query.eq('client_id', req.user.id);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    res.json({ jobs: data, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*, profiles!client_id(*), categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Job not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!job || job.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('client_id, category_id')
      .eq('id', id)
      .single();

    if (!job || job.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete job
    const { error } = await supabaseAdmin.from('jobs').delete().eq('id', id);
    if (error) throw error;

    // Decrement category count
    if (job.category_id) {
      await supabaseAdmin.rpc('decrement_job_count', { category_id_param: job.category_id }).catch(() => null);
    }

    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*, categories(name, slug)')
      .eq('client_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ jobs: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};