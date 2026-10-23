import 'server-only';
import { composeNotification, type Note } from '../notification';
import { isTestData, isTestMode, requireEnv } from './env';
import { memory } from './store';

export const FROM = 'House of Menzura <notifications@houseofmenzura.com>';

export async function notifyHouse(n: Note) {
  const { subject, text } = composeNotification(n, {
    test: isTestData,
    supabaseUrl: process.env.SUPABASE_URL,
    tableId: process.env.SUPABASE_APPLICATIONS_TABLE_ID,
  });
  if (isTestMode) {
    memory().emails.push({ subject, text });
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${requireEnv('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [requireEnv('HOUSE_NOTIFY_EMAIL')], subject, text }),
  });
  if (!res.ok) throw new Error(`notify ${res.status}`);
}
