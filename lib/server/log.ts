import 'server-only';

/** The only thing ever logged about a submission: its ID (when there is one) and what happened. Never contents or file names. */
export function logSubmission(status: string, id?: string) {
  console.log(JSON.stringify({ event: 'submission', id: id ?? null, status }));
}
