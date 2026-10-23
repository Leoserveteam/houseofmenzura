import { NextResponse } from 'next/server';
import { MAX_RESUME_BYTES } from '@/lib/schema';
import { isTestMode } from '@/lib/server/env';
import { memory } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Local test mode only: stands in for the Supabase signed upload URL. 404 everywhere else. */
export async function PUT(req: Request) {
  if (!isTestMode) return new NextResponse(null, { status: 404 });
  const u = new URL(req.url);
  const bytes = new Uint8Array(await req.arrayBuffer());
  // Mirrors the bucket's own 5 MB and PDF-only limits.
  if (bytes.length > MAX_RESUME_BYTES || req.headers.get('content-type') !== 'application/pdf')
    return NextResponse.json({ error: 'rejected' }, { status: 413 });
  memory().objects.set(`${u.searchParams.get('bucket')}/${u.searchParams.get('path')}`, { bytes, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
