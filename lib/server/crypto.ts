import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { isTestMode, requireEnv } from './env';

const secret = () => (isTestMode ? 'local-test-secret' : requireEnv('SUPABASE_SERVICE_ROLE_KEY'));
const key = (purpose: string) => createHmac('sha256', secret()).update(`houseofmenzura:${purpose}`).digest();

/** A salted hash, so the rate limit never stores an IP address. */
export const hashIp = (ip: string) => createHash('sha256').update(key('ip')).update(ip).digest('hex');

export const UPLOAD_WINDOW_MS = 5 * 60 * 1000;

export function signUpload(path: string, issuedAt = Date.now()) {
  const mac = createHmac('sha256', key('upload')).update(`${path}.${issuedAt}`).digest('base64url');
  return `${issuedAt}.${mac}`;
}

export function verifyUpload(path: string, token: string, now = Date.now()) {
  const [issued, mac] = token.split('.');
  const issuedAt = Number(issued);
  if (!issuedAt || !mac || now - issuedAt > UPLOAD_WINDOW_MS || issuedAt > now + 60_000) return false;
  const expected = Buffer.from(signUpload(path, issuedAt).split('.')[1]);
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
