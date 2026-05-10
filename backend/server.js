require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { supabaseAdmin } = require('./config/supabase');
const subscriptionController = require('./controllers/subscriptionController');


const app = express();

app.use(helmet());
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Stripe webhook needs raw body, so add it BEFORE express.json()
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), subscriptionController.webhook);

// Parse JSON for all other routes
app.use(express.json());
app.use(morgan('dev'));

// Stricter rate limit for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 login attempts per 15 mins in production
  message: { error: 'Too many login attempts. Try again later.' }
});

// General rate limiter for all other routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
});

// Apply rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', generalLimiter);

// Core routes
app.get('/api/jobs/categories', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/freelancers', async (req, res) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        freelancer_profiles (*)
      `, { count: 'exact' })
      .eq('role', 'freelancer')
      .eq('is_banned', false);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: freelancers, error, count } = await query.range(from, to);
    if (error) throw error;

    // For each freelancer, fetch additional stats (completed jobs count, avg rating)
    const freelancersWithStats = await Promise.all(
      freelancers.map(async (freelancer) => {
        // Get completed jobs count from contracts table
        const { count: completedJobs } = await supabaseAdmin
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', freelancer.id)
          .eq('status', 'completed');

        // Get average rating from reviews table (if you have one)
        // If not, default to 0
        let avgRating = 0;
        let reviewCount = 0;
        try {
          const { data: ratingData } = await supabaseAdmin
            .from('reviews')
            .select('rating')
            .eq('freelancer_id', freelancer.id);
          if (ratingData && ratingData.length > 0) {
            const sum = ratingData.reduce((acc, r) => acc + r.rating, 0);
            avgRating = parseFloat((sum / ratingData.length).toFixed(1));
            reviewCount = ratingData.length;
          }
        } catch (err) {
          console.warn('Reviews table not yet set up:', err.message);
        }

        return {
          ...freelancer,
          completed_jobs: completedJobs || 0,
          avg_rating: avgRating,
          review_count: reviewCount,
        };
      })
    );

    res.json({
      freelancers: freelancersWithStats,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Freelancers fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/freelancers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Get freelancer profile + freelancer_profiles
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, freelancer_profiles(*)')
      .eq('id', id)
      .eq('role', 'freelancer')
      .single();
    if (error) throw error;

    // Add completed jobs count (from contracts table)
    let completedJobs = 0;
    const { count, error: countError } = await supabaseAdmin
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('freelancer_id', id)
      .eq('status', 'completed');
    if (!countError && count) completedJobs = count;

    // Add average rating (if reviews table exists)
    let avgRating = 0;
    let reviewCount = 0;
    try {
      const { data: ratingData } = await supabaseAdmin
        .from('reviews')
        .select('rating')
        .eq('freelancer_id', id);
      if (ratingData && ratingData.length > 0) {
        const sum = ratingData.reduce((acc, r) => acc + r.rating, 0);
        avgRating = parseFloat((sum / ratingData.length).toFixed(1));
        reviewCount = ratingData.length;
      }
    } catch (err) {
      // reviews table not yet created – ignore
    }

    res.json({
      ...data,
      completed_jobs: completedJobs,
      avg_rating: avgRating,
      review_count: reviewCount,
    });
  } catch (error) {
    console.error('Freelancer detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

const { auth } = require('./middleware/auth');
app.put('/api/freelancer-profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can update this' });
    }

    const { title, hourly_rate, skills, experience_years, github_url, linkedin_url } = req.body;
    
    const updateData = {
      user_id: req.user.id,
      updated_at: new Date().toISOString()
    };
    if (title !== undefined) updateData.title = title;
    if (hourly_rate !== undefined) updateData.hourly_rate = hourly_rate;
    if (skills !== undefined) updateData.skills = skills;
    if (experience_years !== undefined) updateData.experience_years = experience_years;
    if (github_url !== undefined) updateData.github_url = github_url;
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url;

    // Use upsert with onConflict
    const { data, error } = await supabaseAdmin
      .from('freelancer_profiles')
      .upsert(updateData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Freelancer profile upsert error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Freelancer profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/saved-jobs', auth, async (req, res) => {
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
});

app.delete('/api/saved-jobs/:jobId', auth, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .delete()
      .eq('user_id', req.user.id)
      .eq('job_id', req.params.jobId);
    if (error) throw error;
    res.json({ message: 'Removed from saved jobs' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/admin', require('./routes/admin'));
//app.use('/api/upload', require('./routes/upload'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Upload profile image to Supabase Storage
app.post('/api/upload/avatar', auth, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only images are allowed' });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${req.user.id}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath);

    res.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/reviews/stats', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('rating');
    if (error) throw error;
    let avg = 0;
    if (data && data.length) {
      avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
    }
    res.json({ avg_rating: avg });
  } catch (error) {
    // If table doesn't exist, return empty stats
    res.json({ avg_rating: 0 });
  }
});

// Upload CV to Supabase Storage
app.post('/api/upload/cv', auth, upload.single('cv'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Only PDF and DOCX files are allowed' });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${req.user.id}_${Date.now()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('cvs')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabaseAdmin.storage
      .from('cvs')
      .getPublicUrl(filePath);

    res.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ error: error.message });
  }
});



app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));