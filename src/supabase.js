import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

try {
  if (supabaseUrl && supabaseUrl !== 'your_supabase_url_here' && supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here') {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase Successfully Initialized! 🚀");
  } else {
    console.warn("⚠️ Supabase keys missing. Running in Mock Mode. Please setup .env.local");
  }
} catch (error) {
  console.error("Supabase Initialization Error", error);
}

export { supabase };
