// Prints a signed download link, valid for 10 minutes, for one application's resume.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run resume -- <application id>
import { createClient } from '@supabase/supabase-js';

const id = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(id ?? '')) {
  console.error('Usage: npm run resume -- <application id>');
  process.exit(1);
}
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.');
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await db.from('applications').select('resume_path, is_test').eq('id', id).single();
if (error || !data?.resume_path) {
  console.error('No resume for that application.');
  process.exit(1);
}
const bucket = data.is_test ? 'resumes-test' : 'resumes';
const { data: signed, error: signError } = await db.storage.from(bucket).createSignedUrl(data.resume_path, 600);
if (signError) {
  console.error('Could not sign the link.');
  process.exit(1);
}
console.log(signed.signedUrl);
