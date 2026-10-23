import 'server-only';
import { isTestMode, turnstileSecret } from './env';
import { clientIp } from './ratelimit';

export async function verifyTurnstile(token: string | undefined, req: Request) {
  if (isTestMode) return token === 'test-pass';
  const secret = turnstileSecret();
  if (!secret || !token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: clientIp(req) }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
