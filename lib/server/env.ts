import 'server-only';

/** VERCEL_ENV is production, preview or development on Vercel, and unset elsewhere. */
export const vercelEnv = process.env.VERCEL_ENV;
export const isProduction = vercelEnv === 'production';

/**
 * Local test mode swaps Supabase, Resend and Turnstile for in-memory stand-ins.
 * It can never switch on inside a Vercel deployment, because VERCEL_ENV is always set there.
 */
export const isTestMode = process.env.HOM_TEST_MODE === '1' && !vercelEnv;

/** Anything that is not the production deployment writes test rows to the test bucket. */
export const isTestData = !isProduction;
export const resumeBucket = isProduction ? 'resumes' : 'resumes-test';

// Cloudflare's published always-pass test keys, used only outside production.
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';
const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA';

export const turnstileSiteKey = () =>
  isTestMode ? null : process.env.TURNSTILE_SITE_KEY || (isProduction ? null : TURNSTILE_TEST_SITE_KEY);
export const turnstileSecret = () =>
  process.env.TURNSTILE_SECRET_KEY || (isProduction ? null : TURNSTILE_TEST_SECRET);

export function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}
