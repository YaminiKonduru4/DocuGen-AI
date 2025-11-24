import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
  process.exit(2);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  try {
    const random = crypto.randomBytes(4).toString('hex');
    const email = `test${random}@example.com`;
    const password = 'TestPass123!';
    console.log('Using test email:', email);

    console.log('\n-- Sign Up --');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
    if (signupError) console.error('SignUp error:', signupError);
    else console.log('SignUp result:', signupData);

    console.log('\n-- Sign In --');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) console.error('SignIn error:', signInError);
    else console.log('SignIn result:', signInData);

    const user = signInData?.user || signupData?.user;
    if (!user) {
      console.error('No user returned from signup/signin; aborting tests');
      process.exit(3);
    }

    console.log('\n-- Upsert Profile --');
    const profile = { id: user.id, email, full_name: 'Test User', updated_at: new Date().toISOString() };
    const { data: upsertData, error: upsertError } = await supabase.from('profiles').upsert(profile).select();
    if (upsertError) console.error('Upsert profile error:', upsertError);
    else console.log('Upsert profile result:', upsertData);

    console.log('\n-- Request Password Reset --');
    const { data: resetData, error: resetErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: process.env.VITE_PASSWORD_RESET_REDIRECT || 'http://localhost:5173' });
    if (resetErr) console.error('Password reset request error:', resetErr);
    else console.log('Password reset request result:', resetData);

    console.log('\nAll test steps finished. Check Supabase dashboard for created users/profiles and look for the reset email in the test inbox.');
    process.exit(0);
  } catch (e) {
    console.error('Error during test flow:', e);
    process.exit(1);
  }
})();
