import { categoryOptions, kindLabel, labelFor, roleOptions, type Kind } from './options';

export type Note = { id: string; kind: Kind; role: string | null; name: string; city: string };

/** Opens the row in the Supabase table editor. */
export function recordLink(id: string, supabaseUrl = '', tableId?: string) {
  const ref = supabaseUrl.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] ?? 'project';
  const base = `https://supabase.com/dashboard/project/${ref}/editor${tableId ? `/${tableId}` : ''}`;
  return `${base}?filter=${encodeURIComponent(`id:eq:${id}`)}`;
}

/** One email to the house: kind, role or category, name, city and a link. Never answers, never the resume. */
export function composeNotification(n: Note, opts: { test: boolean; supabaseUrl?: string; tableId?: string }) {
  const what = n.kind === 'work_in' ? labelFor(roleOptions, n.role) : n.kind === 'work_with' ? labelFor(categoryOptions, n.role) : '';
  const subject = `${opts.test ? '[Test] ' : ''}New note: ${kindLabel[n.kind]}${what ? `, ${what}` : ''}`;
  const text = [
    'A new note has reached the house.',
    '',
    `Kind: ${kindLabel[n.kind]}`,
    ...(what ? [`${n.kind === 'work_in' ? 'Role' : 'Category'}: ${what}`] : []),
    `Name: ${n.name}`,
    `City: ${n.city}`,
    '',
    `Open the record: ${recordLink(n.id, opts.supabaseUrl, opts.tableId)}`,
  ].join('\n');
  return { subject, text };
}
