import { createClient } from '@supabase/supabase-js';

// Access environment variables safely for Vite
// @ts-ignore
const getEnv = (key: string) => (import.meta.env && import.meta.env[key]) || "";

const supabaseUrl = getEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Database features will not work until .env is configured.");
}

// Initialize with valid credentials or fallbacks to prevent crash on load
// If keys are missing, API calls will simply fail with 400/404 errors, which are caught in the UI
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Let the client detect sessions in URL after OAuth / password-recovery redirects
      detectSessionInUrl: true
    }
  }
);