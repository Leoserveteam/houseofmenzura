import { NextResponse } from 'next/server';
import { applicationSchema, fieldErrors, findForbiddenKey, MAX_RESUME_BYTES, PDF_RULES } from '@/lib/schema';
import { verifyUpload } from '@/lib/server/crypto';
import { isTestData, resumeBucket } from '@/lib/server/env';
import { logSubmission } from '@/lib/server/log';
import { notifyHouse } from '@/lib/server/notify';
import { hasPdfSignature } from '@/lib/server/pdf';
import { overLimit } from '@/lib/server/ratelimit';
import { store } from '@/lib/server/store';
import { verifyTurnstile } from '@/lib/server/turnstile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body: object, status = 200) => NextResponse.json(body, { status });
const MAX_BODY = 64 * 1024;

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (!body || typeof body !== 'object') return json({ ok: false, error: 'bad_request' }, 400);

  // Honeypot: accept quietly so a bot learns nothing, and store nothing.
  const hp = (body as { fax?: unknown }).fax;
  if (typeof hp === 'string' && hp.trim()) {
    logSubmission('honeypot');
    return json({ ok: true });
  }

  if (findForbiddenKey(body)) {
    logSubmission('rejected_forbidden_field');
    return json({ ok: false, error: 'forbidden_field' }, 400);
  }

  try {
    if (await overLimit(req, 'apply')) {
      logSubmission('rate_limited');
      return json({ ok: false, error: 'rate_limited' }, 429);
    }
  } catch {
    logSubmission('rate_check_failed');
    return json({ ok: false, error: 'unavailable' }, 503);
  }

  if (!(await verifyTurnstile((body as { turnstileToken?: string }).turnstileToken, req))) {
    logSubmission('turnstile_failed');
    return json({ ok: false, error: 'verification' }, 403);
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    logSubmission('invalid');
    return json({ ok: false, error: 'invalid', fields: fieldErrors(parsed.error.issues) }, 422);
  }
  const app = parsed.data;
  const s = store();

  let resumePath: string | null = null;
  if (app.kind === 'work_in') {
    const { path, token } = app.resume;
    const fail = (msg: string) => json({ ok: false, error: 'invalid', fields: { resume: msg } }, 422);
    if (!verifyUpload(path, token)) {
      logSubmission('resume_token_invalid');
      return fail(PDF_RULES.failed);
    }
    const bytes = await s.getObject(resumeBucket, path);
    if (!bytes) {
      logSubmission('resume_missing');
      return fail(PDF_RULES.missing);
    }
    const problem = bytes.length > MAX_RESUME_BYTES ? PDF_RULES.tooBig : !hasPdfSignature(bytes) ? PDF_RULES.wrongType : null;
    if (problem) {
      await s.removeObjects(resumeBucket, [path]).catch(() => {});
      logSubmission('resume_rejected');
      return fail(problem);
    }
    resumePath = path;
  }

  const role = app.kind === 'work_in' ? app.details.role : app.kind === 'work_with' ? app.details.category : null;
  let id: string;
  try {
    id = await s.insertApplication({
      kind: app.kind,
      role,
      about: app.about,
      details: app.details,
      answers: app.answers,
      resume_path: resumePath,
      consent_at: new Date().toISOString(),
      source_query: app.sourceQuery?.slice(0, 300) || null,
      is_test: isTestData,
    });
  } catch {
    logSubmission('store_failed');
    return json({ ok: false, error: 'unavailable' }, 502);
  }

  try {
    await notifyHouse({ id, kind: app.kind, role, name: app.about.fullName, city: app.about.cityCountry });
    logSubmission('stored', id);
  } catch {
    logSubmission('stored_notify_failed', id);
  }
  return json({ ok: true });
}
