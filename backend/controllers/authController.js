const { supabase, supabaseAdmin } = require('../config/supabase');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  let createdAuthUserId = null;

  try {
    const {
      email,
      password,
      full_name,
      role,
      username,
      title,
      skills,
      hourly_rate,
      company_name
    } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure unique username
    let baseUsername = username || email.split('@')[0];
    let finalUsername = baseUsername;
    let counter = 1;

    while (true) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('username', finalUsername)
        .maybeSingle();
      if (!existingUser) break;
      finalUsername = `${baseUsername}${counter}`;
      counter++;
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role, username: finalUsername },
    });

    if (authError) throw authError;

    createdAuthUserId = authData.user.id;

    // Manually insert profile (skip trigger)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: createdAuthUserId,
        email,
        full_name,
        role,
        username: finalUsername,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      return res.status(500).json({ error: `Profile creation failed: ${profileError.message}` });
    }

    // Insert freelancer or client extra fields
    if (role === 'freelancer') {
      const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      const hourlyRateNum = hourly_rate ? parseFloat(hourly_rate) : null;

      const { error: freelancerError } = await supabaseAdmin
        .from('freelancer_profiles')
        .insert({
          user_id: createdAuthUserId,
          title: title || null,
          skills: skillsArray,
          hourly_rate: hourlyRateNum,
        });

      if (freelancerError) {
        console.warn('Freelancer profile insert warning:', freelancerError.message);
        // Not fatal – continue
      }
    } else if (role === 'client' && company_name) {
      const { error: clientError } = await supabaseAdmin
        .from('profiles')
        .update({ company_name })
        .eq('id', createdAuthUserId);

      if (clientError) {
        console.warn('Client company update warning:', clientError.message);
      }
    }

    // Create free subscription
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: createdAuthUserId, plan: 'free', status: 'active' });

    if (subError) {
      console.warn('Subscription insert warning:', subError.message);
    }

    const token = generateToken(createdAuthUserId);

    return res.status(201).json({
      token,
      user: {
        id: createdAuthUserId,
        email,
        full_name,
        role,
        username: finalUsername,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (createdAuthUserId) {
      await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId).catch(e => console.warn('Rollback failed:', e.message));
    }
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Login auth error:', authError);
      if (authError.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      if (authError.message.includes('Email not confirmed')) {
        await supabase.auth.resend({ email, type: 'signup' }).catch(() => {});
        return res.status(403).json({
          error: 'Please verify your email first. A new verification link has been sent.',
        });
      }
      return res.status(401).json({ error: 'Login failed. Please try again.' });
    }

    // Auto-recover missing profile
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (!profile) {
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || authData.user.email.split('@')[0],
          role: authData.user.user_metadata?.role || 'client',
          username: authData.user.user_metadata?.username || authData.user.email.split('@')[0],
          created_at: new Date().toISOString(),
        });

      if (createProfileError) {
        console.error('Profile recovery error:', createProfileError);
        throw createProfileError;
      }

      const { data: newProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      profile = newProfile;
    }

    if (profile.is_banned) {
      return res.status(403).json({
        error: 'Your account has been banned. Contact support for assistance.',
      });
    }

    const token = generateToken(profile.id);
    return res.json({ token, user: profile });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*, freelancer_profiles(*)')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    return res.json({
      ...profile,
      subscription: subscription || { plan: 'free', status: 'active' },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id;
    delete updates.role;
    delete updates.is_banned;
    delete updates.created_at;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ error: `Database error: ${error.message}` });
  }
};