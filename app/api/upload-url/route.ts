import { NextResponse } from 'next/server';
import { PDF_RULES } from '@/lib/schema';
import { signUpload } from '@/lib/server/crypto';
import { resumeBucket } from '@/lib/server/env';
import { checkDeclaredFile } from '@/lib/server/pdf';
import { overLimit } from '@/lib/server/ratelimit';
import { store } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Issues a one-file upload URL at a random path. Only the size, type and extension are sent here, never the file name. */
export async function POST(req: Request) {
  let body: { size?: unknown; type?: unknown; ext?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const problem = checkDeclaredFile({ size: body.size, type: body.type, ext: body.ext });
  if (problem) return NextResponse.json({ ok: false, error: PDF_RULES[problem] }, { status: 422 });
  try {
    if (await overLimit(req, 'upload')) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    const path = `${crypto.randomUUID()}.pdf`;
    const uploadUrl = await store().createUploadUrl(resumeBucket, path);
    return NextResponse.json({ ok: true, path, token: signUpload(path), uploadUrl });
  } catch {
    return NextResponse.json({ ok: false, error: PDF_RULES.failed }, { status: 503 });
  }
}
