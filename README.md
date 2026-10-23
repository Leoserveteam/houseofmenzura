# houseofmenzura.com

The page where Menzura recruits founding staff, partners and investors. Separate from the member site, menzura.co: this site links to menzura.co, and menzura.co never links back.

Design source: Figma file `fpm3gDDOUwOaMu07QbTH3b`, page "houseofmenzura.com" (desktop 161:1092, mobile 161:1094, role overlays 161:494/498/502, role sheets 157:372/509/634, confirmation 145:458/463, local components 140:3, build notes 145:468).

## Stack

- Next.js 15 (App Router, TypeScript), plain CSS with the Figma variables as tokens in `app/globals.css`, fonts through `next/font`
- zod schemas in `lib/schema.ts`, shared by the browser and the server
- Supabase (project `houseofmenzura`, ca-central-1) for data and resumes
- Resend for one notification email per submission
- Cloudflare Turnstile and a hidden honeypot field against spam
- Vercel Web Analytics (no cookies)

## Running it

```sh
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Local test mode (`HOM_TEST_MODE=1`) swaps Supabase, Resend and Turnstile for in-memory stand-ins. It cannot switch on inside a Vercel deployment, because `VERCEL_ENV` is always set there.

```sh
npm run typecheck
npm test              # builds, starts in test mode on :3200, runs Playwright on desktop and mobile
npm run check:roles   # fails if a published role version was edited
```

## Environment variables

| Name | Where | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | server | `https://lqmmpufyuonbtvhwoudx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Never sent to the browser. Also keys the upload tokens and the IP hash. |
| `SUPABASE_APPLICATIONS_TABLE_ID` | server, optional | `17637`, so the email link opens the applications table |
| `RESEND_API_KEY` | server | |
| `HOUSE_NOTIFY_EMAIL` | server | Where the notification goes |
| `TURNSTILE_SITE_KEY` | server, passed to the page as a prop | Outside production, Cloudflare's test keys are used when empty |
| `TURNSTILE_SECRET_KEY` | server | |
| `CRON_SECRET` | server | Vercel Cron sends it to the retention job |

## How a submission works

1. The browser validates the form with the shared zod schema and shows errors under each field.
2. For Work in the house, the browser checks the resume (`.pdf`, `application/pdf`, `%PDF` signature, 5 MB or less), then asks `POST /api/upload-url` for a signed upload URL. Only the size, type and extension are sent, never the file name. The server issues one random path (`<uuid>.pdf`) and an HMAC token for that path, valid for 5 minutes, and the browser uploads straight to the private bucket.
3. `POST /api/apply` checks, in order: honeypot (accepted quietly, nothing stored), forbidden fields, rate limit (5 per IP per hour), Turnstile, the zod schema (strict, unknown keys refused), then the upload token, the stored file size and the `%PDF` signature. A file that fails is deleted.
4. The row is written with the service role key. One email goes to `HOUSE_NOTIFY_EMAIL` with the kind, the role or category, the name, the city and a link to the record. It never contains answers and never carries the resume. Nothing is sent to the applicant; the confirmation on screen is the acknowledgement.
5. Logs carry only a submission ID and a status. Never form contents, never file names.

The house never asks for, and refuses if sent: date of birth, ID or passport numbers, bank details, salary history, health information, or Canadian work experience (`findForbiddenKey` in `lib/schema.ts`).

## Storage

Migration: `supabase/migrations/20261023000000_applications.sql`.

- `public.applications`: one row per submission (`kind`, `role`, `status`, `status_changed_at`, `about`, `details`, `answers`, `resume_path`, `consent_at`, `source_query`, `is_test`). A trigger keeps `status_changed_at` current.
- `public.submission_events`: salted hashes of IP addresses, for the hourly rate limit. Pruned daily.
- Row level security is on for both tables with no policies, and `anon` and `authenticated` have no grants, so only the server can read or write.
- Buckets `resumes` and `resumes-test`: private, PDF only, 5 MB. No public URLs. To open a resume, the house runs:

  ```sh
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run resume -- <application id>
  ```

  which prints a signed download link valid for 10 minutes.

Preview and local deployments write with `is_test = true` to `resumes-test`. Only the production deployment writes real rows to `resumes`.

Status changes (`new`, `in_review`, `declined`, `progressed`) are made in the Supabase table editor.

### Retention

**Written as a Vercel Cron job**, `GET /api/cron/retention`, daily at 03:00 UTC (`vercel.json`), protected by `CRON_SECRET`. It:

1. finds applications declined more than 12 months ago (by `status_changed_at`), deletes the resume file through the Storage API and clears `answers` and `resume_path`;
2. deletes uploaded resumes that were never attached to an application within a day;
3. deletes rate-limit events older than a day.

It uses the Storage API rather than SQL, because deleting rows from `storage.objects` would leave the files behind.

Note: Supabase's own signed upload URLs stay valid for two hours and cannot be shortened. The 5-minute limit is enforced by the server's upload token: a file uploaded with an expired token is never accepted, and the daily job deletes it.

## Role descriptions

Each published version lives in `content/roles/<role>/<YYYY-MM-DD>.ts` and is listed in `content/roles/index.ts`. The newest version is shown. To change a role, add a new dated file; never edit or delete a published one. `npm run check:roles` (run in CI) fails if a published file changes, so the repository keeps a three-year record.

## Pay

Pay ranges are not yet on the roles; this was left out for now by decision. Ontario will require a pay range on public postings once the house has 25 employees.

## Compliance lines

Shown exactly as written:

- Role dialogs, role pages and above the Work in the house submit button: "This is a current vacancy. We use software to organise applications and prepare a short summary of each. A person reads every application and makes every decision."
- Under the Back the house section and above its submit button: "This page is not an offer to sell securities. Any investment is made only through private conversation and the documents that follow."
- Consent checkbox: "I have read the privacy notice and agree that the house may keep these details to consider my application."

The privacy page at `/privacy` holds placeholder text marked "Awaiting legal review".

## Illustrations

Exported from the Figma image fills at 2x as WebP into `public/illustrations`, listed with alt text in `lib/illustrations.ts`. Set `ready: true` for each one once its file is in place.
