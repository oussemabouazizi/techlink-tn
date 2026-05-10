const { supabaseAdmin } = require('../config/supabase');

exports.getDashboardStats = async (req, res) => {
  try {
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalJobs } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    const { count: totalProposals } = await supabaseAdmin
      .from('proposals')
      .select('*', { count: 'exact', head: true });

    const { count: totalContracts } = await supabaseAdmin
      .from('contracts')
      .select('*', { count: 'exact', head: true });

    const { data: recentUsers } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentJobs } = await supabaseAdmin
      .from('jobs')
      .select('*, profiles!client_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      stats: { totalUsers, totalJobs, totalProposals, totalContracts },
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    let query = supabaseAdmin
      .from('profiles')
      .select('*, subscriptions(plan)', { count: 'exact' });

    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    if (role) query = query.eq('role', role);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({ users: data, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_banned } = req.body;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobsForModeration = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    let query = supabaseAdmin
      .from('jobs')
      .select('*, profiles!client_id(full_name, email)', { count: 'exact' });

    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({ jobs: data, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};