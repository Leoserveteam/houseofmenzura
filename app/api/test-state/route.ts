import { NextResponse } from 'next/server';
import { isTestMode } from '@/lib/server/env';
import { memory } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Local test mode only: lets the Playwright suite read and reset the in-memory store. 404 everywhere else. */
export async function GET() {
  if (!isTestMode) return new NextResponse(null, { status: 404 });
  const m = memory();
  return NextResponse.json({
    applications: m.applications,
    objects: [...m.objects.keys()],
    emails: m.emails,
    events: m.events.length,
  });
}

export async function DELETE() {
  if (!isTestMode) return new NextResponse(null, { status: 404 });
  const m = memory();
  m.applications.length = 0;
  m.events.length = 0;
  m.emails.length = 0;
  m.objects.clear();
  return NextResponse.json({ ok: true });
}
