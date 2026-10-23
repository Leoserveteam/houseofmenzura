import { NextResponse } from 'next/server';
import { safeEqual } from '@/lib/server/crypto';
import { isTestMode } from '@/lib/server/env';
import { supabaseAdmin, store } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DAY = 24 * 60 * 60 * 1000;

/**
 * Runs daily from Vercel Cron (see vercel.json).
 * 1. Declined for more than 12 months: delete the resume file and clear the free-text answers.
 * 2. Uploaded resumes never attached to an application within a day: delete.
 * 3. Rate-limit events older than a day: delete.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') ?? '';
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return new NextResponse(null, { status: 401 });
  if (isTestMode) return NextResponse.json({ ok: true, skipped: 'test mode' });

  const db = supabaseAdmin();
  const s = store();
  const cutoff = new Date();
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 12);

  const { data: due, error } = await db
    .from('applications')
    .select('id, resume_path, is_test')
    .eq('status', 'declined')
    .lt('status_changed_at', cutoff.toISOString())
    .or('resume_path.not.is.null,answers.neq.{}');
  if (error) return NextResponse.json({ ok: false, step: 'select' }, { status: 500 });

  let cleared = 0;
  for (const row of due ?? []) {
    if (row.resume_path) await s.removeObjects(row.is_test ? 'resumes-test' : 'resumes', [row.resume_path]);
    const { error: upd } = await db.from('applications').update({ resume_path: null, answers: {} }).eq('id', row.id);
    if (!upd) cleared += 1;
  }

  let orphans = 0;
  for (const bucket of ['resumes', 'resumes-test']) {
    const old = (await s.listObjects(bucket)).filter((o) => Date.now() - Date.parse(o.createdAt) > DAY);
    if (!old.length) continue;
    const keep = new Set<string>();
    for (let i = 0; i < old.length; i += 100) {
      const names = old.slice(i, i + 100).map((o) => o.name);
      const { data: used, error: usedError } = await db.from('applications').select('resume_path').in('resume_path', names);
      if (usedError) return NextResponse.json({ ok: false, step: 'orphans' }, { status: 500 });
      for (const u of used ?? []) keep.add(u.resume_path);
    }
    const remove = old.map((o) => o.name).filter((n) => !keep.has(n));
    await s.removeObjects(bucket, remove);
    orphans += remove.length;
  }

  await db.from('submission_events').delete().lt('created_at', new Date(Date.now() - DAY).toISOString());

  console.log(JSON.stringify({ event: 'retention', cleared, orphans }));
  return NextResponse.json({ ok: true, cleared, orphans });
}
