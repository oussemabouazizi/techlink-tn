const { supabaseAdmin } = require('../config/supabase');

// Get freelancer profile (public)
exports.getFreelancerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, freelancer_profiles(*)')
      .eq('id', id)
      .eq('role', 'freelancer')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List freelancers (public, with pagination)
exports.listFreelancers = async (req, res) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    let query = supabaseAdmin
      .from('profiles')
      .select('*, freelancer_profiles(*)', { count: 'exact' })
      .eq('role', 'freelancer')
      .eq('is_banned', false);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    res.json({ freelancers: data, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update freelancer profile (authenticated)
exports.updateFreelancerProfile = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can update this' });
    }

    const { data, error } = await supabaseAdmin
      .from('freelancer_profiles')
      .upsert({ user_id: req.user.id, ...req.body })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Saved jobs
exports.saveJob = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('saved_jobs')
      .insert({ user_id: req.user.id, job_id: req.body.job_id })
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .delete()
      .eq('user_id', req.user.id)
      .eq('job_id', jobId);

    if (error) throw error;
    res.json({ message: 'Removed from saved jobs' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};