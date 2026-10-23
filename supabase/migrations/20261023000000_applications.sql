-- houseofmenzura.com: applications, rate-limit events and private resume buckets.
-- Only the server writes, with the service role key. Row level security is on with no policies,
-- so the anon and authenticated roles can read or write nothing.

create type public.application_kind as enum ('work_in', 'work_with', 'back');
create type public.application_status as enum ('new', 'in_review', 'declined', 'progressed');

create table public.applications (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  kind              public.application_kind not null,
  role              text,
  status            public.application_status not null default 'new',
  status_changed_at timestamptz not null default now(),
  about             jsonb not null,
  details           jsonb not null default '{}'::jsonb,
  answers           jsonb not null default '{}'::jsonb,
  resume_path       text,
  consent_at        timestamptz not null,
  source_query      text,
  is_test           boolean not null default false,
  constraint role_matches_kind check (
       (kind = 'work_in'   and role in ('operator', 'stylist', 'photographer'))
    or (kind = 'work_with' and role in ('tailor', 'cloth', 'grooming', 'courier'))
    or (kind = 'back'      and role is null)),
  constraint resume_only_work_in check (resume_path is null or kind = 'work_in')
);

comment on table public.applications is 'Applications from houseofmenzura.com. Written only by the server.';
comment on column public.applications.role is 'work_in: operator, stylist or photographer. work_with: tailor, cloth, grooming or courier. back: null.';
comment on column public.applications.is_test is 'True for anything written by a preview or local deployment.';

create index applications_retention_idx on public.applications (status_changed_at) where status = 'declined';
create index applications_created_idx on public.applications (created_at desc);
create index applications_resume_path_idx on public.applications (resume_path) where resume_path is not null;

create function public.touch_status_changed_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end $$;

create trigger applications_status_changed
  before update of status on public.applications
  for each row execute function public.touch_status_changed_at();

alter table public.applications enable row level security;
revoke all on public.applications from anon, authenticated;

-- Rate limit: 5 submissions per IP per hour. Stores a salted SHA-256 of the IP, never the IP.
create table public.submission_events (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index submission_events_lookup_idx on public.submission_events (ip_hash, created_at);
alter table public.submission_events enable row level security;
revoke all on public.submission_events from anon, authenticated;

-- Private buckets: PDF only, 5 MB. No storage.objects policies, so only signed URLs issued by the server work.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('resumes',      'resumes',      false, 5242880, array['application/pdf']),
  ('resumes-test', 'resumes-test', false, 5242880, array['application/pdf']);
