const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Admin client – bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Public client – respects RLS
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase, supabaseAdmin };