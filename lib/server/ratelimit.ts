import 'server-only';
import { hashIp } from './crypto';
import { store } from './store';

export const LIMITS = { apply: 5, upload: 10 } as const;
const HOUR = 60 * 60 * 1000;

export function clientIp(req: Request) {
  return req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

/** Records this attempt and says whether it goes over the hourly limit for this IP. */
export async function overLimit(req: Request, scope: keyof typeof LIMITS) {
  const ipHash = hashIp(`${scope}:${clientIp(req)}`);
  const since = new Date(Date.now() - HOUR).toISOString();
  const s = store();
  const recent = await s.countEvents(ipHash, since);
  if (recent >= LIMITS[scope]) return true;
  await s.addEvent(ipHash);
  return false;
}
