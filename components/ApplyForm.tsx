'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormNav } from './FormNav';
import Received from './Received';
import Turnstile from './Turnstile';
import { ChoiceField, Checkbox, SelectField, TextareaField, TextField, UploadField } from './fields';
import { VACANCY_NOTE } from './RoleContent';
import {
  arrangementOptions,
  categoryOptions,
  chequeOptions,
  investorTypeOptions,
  roleOptions,
  tabs,
  yearsInFieldOptions,
  yearsOperatingOptions,
  yesNoOptions,
  type Kind,
  type TabKey,
} from '@/lib/options';
import { applicationSchema, fieldErrors, MAX_RESUME_BYTES, NDA_DECLINED, PDF_RULES, portfolioError } from '@/lib/schema';

export const SECURITIES_NOTE =
  'This page is not an offer to sell securities. Any investment is made only through private conversation and the documents that follow.';

type Values = Record<string, string>;
type Status = 'idle' | 'sending' | 'sent';

const ABOUT = ['fullName', 'email', 'phone', 'cityCountry', 'link', 'introducedBy'] as const;
const DETAILS: Record<Kind, string[]> = {
  work_in: ['role', 'currentRole', 'yearsInField', 'cities', 'languages', 'startDate', 'arrangement', 'authorized', 'portfolio'],
  work_with: ['businessName', 'category', 'citiesServed', 'offer', 'capacity', 'yearsOperating', 'website', 'contact', 'nda'],
  back: ['firm', 'investorType', 'countryOfResidence', 'accredited', 'cheque'],
};
const ANSWERS: Record<Kind, string[]> = {
  work_in: ['handled', 'recognised'],
  work_with: ['fault'],
  back: ['beyond', 'why'],
};
const PLACEHOLDER_RESUME = { path: '00000000-0000-0000-0000-000000000000.pdf', token: 'placeholder-token' };

const pick = (v: Values, keys: readonly string[]) => Object.fromEntries(keys.map((k) => [k, (v[k] ?? '').trim()]));

/** Reads the first bytes so a renamed file is caught before it is sent. */
async function checkFile(f: File): Promise<string | null> {
  const ext = f.name.split('.').pop()?.toLowerCase();
  if (ext !== 'pdf' || f.type !== 'application/pdf') return PDF_RULES.wrongType;
  if (f.size > MAX_RESUME_BYTES) return PDF_RULES.tooBig;
  const head = new Uint8Array(await f.slice(0, 4).arrayBuffer());
  if (String.fromCharCode(...head) !== '%PDF') return PDF_RULES.wrongType;
  return null;
}

export default function LeaveSection({ how, siteKey }: { how: React.ReactNode; siteKey: string | null }) {
  const [status, setStatus] = useState<Status>('idle');
  if (status === 'sent') return <Received />;
  return (
    <div className="leave">
      {how}
      <ApplyForm siteKey={siteKey} status={status} setStatus={setStatus} />
    </div>
  );
}

function ApplyForm({ siteKey, status, setStatus }: { siteKey: string | null; status: Status; setStatus: (s: Status) => void }) {
  const nav = useFormNav();
  const [localTab, setLocalTab] = useState<TabKey>('work-in');
  const tab = nav?.tab ?? localTab;
  const setTab = nav?.setTab ?? setLocalTab;
  const kind = tabs.find((t) => t.key === tab)!.kind;

  const [values, setValues] = useState<Values>({});
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const set = (k: string) => (v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };
  const val = (k: string) => values[k] ?? '';

  // A role chosen from a role card or role page is preselected in the Role field.
  const request = nav?.request;
  useEffect(() => {
    if (!request?.role) return;
    setValues((s) => ({ ...s, role: request.role! }));
    setErrors((e) => ({ ...e, role: '' }));
    if (request.focusRole) setTimeout(() => document.getElementById('f-role')?.focus({ preventScroll: true }), 450);
  }, [request?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const ndaDeclined = kind === 'work_with' && val('nda') === 'no';

  async function onPickFile(f: File | null) {
    setFile(null);
    setErrors((e) => ({ ...e, resume: '' }));
    if (!f) return;
    const problem = await checkFile(f);
    if (problem) setErrors((e) => ({ ...e, resume: problem }));
    else setFile(f);
  }

  function buildPayload(resume = PLACEHOLDER_RESUME) {
    const about = pick(values, ABOUT);
    const details = pick(values, DETAILS[kind]);
    const answers = pick(values, ANSWERS[kind]);
    return {
      kind,
      about,
      details,
      answers,
      consent,
      ...(kind === 'work_in' ? { resume } : {}),
      turnstileToken: token || undefined,
      fax: values.fax || undefined,
      sourceQuery: location.search.slice(0, 300) || undefined,
    };
  }

  function focusFirstError() {
    requestAnimationFrame(() => {
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending' || ndaDeclined) return;
    setFormError('');
    const parsed = applicationSchema.safeParse(buildPayload());
    const errs = parsed.success ? {} : fieldErrors(parsed.error.issues);
    if (kind === 'work_in') {
      const p = portfolioError(val('role'), val('portfolio'));
      if (p && !errs.portfolio) errs.portfolio = p;
      if (!file && !errs.resume) errs.resume = errors.resume || PDF_RULES.missing;
    }
    delete errs.turnstileToken;
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError();
      return;
    }
    if (siteKey && !token) {
      setFormError('Please complete the check above the button, then send again.');
      return;
    }

    setStatus('sending');
    try {
      let resume = PLACEHOLDER_RESUME;
      if (kind === 'work_in' && file) {
        const r = await fetch('/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ size: file.size, type: file.type, ext: 'pdf' }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.uploadUrl) {
          setErrors((x) => ({ ...x, resume: data.error && data.error !== 'rate_limited' ? data.error : PDF_RULES.failed }));
          setStatus('idle');
          focusFirstError();
          return;
        }
        const put = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf', 'x-upsert': 'false' }, body: file });
        if (!put.ok) {
          setErrors((x) => ({ ...x, resume: PDF_RULES.failed }));
          setStatus('idle');
          focusFirstError();
          return;
        }
        resume = { path: data.path, token: data.token };
      }

      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(resume)),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('sent');
        return;
      }
      setStatus('idle');
      setResetKey((n) => n + 1);
      if (res.status === 422 && data.fields) {
        setErrors(data.fields);
        focusFirstError();
      } else if (res.status === 429) {
        setFormError('You have sent several notes in the last hour. Please try again later.');
      } else if (res.status === 403) {
        setFormError('We could not confirm this was sent by a person. Please try again.');
      } else {
        setFormError('Something went wrong sending this. Please try again in a moment.');
      }
    } catch {
      setStatus('idle');
      setResetKey((n) => n + 1);
      setFormError('Something went wrong sending this. Please try again in a moment.');
    }
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    const n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!n) return;
    e.preventDefault();
    const next = (i + n + tabs.length) % tabs.length;
    setTab(tabs[next].key);
    tabRefs.current[next]?.focus();
  }

  const t = (k: string) => ({ name: k, value: val(k), onChange: set(k), error: errors[k] });
  const submitLabel = kind === 'back' ? 'Request an introduction' : 'Send to the house';

  return (
    <form ref={formRef} className="form" id="apply-form" noValidate onSubmit={onSubmit} aria-label="Leave your name">
      <div className="tabs" role="tablist" aria-label="Who you are">
        {tabs.map((x, i) => (
          <button
            key={x.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${x.key}`}
            className="tab"
            aria-selected={tab === x.key}
            aria-controls="form-panel"
            tabIndex={tab === x.key ? 0 : -1}
            onClick={() => setTab(x.key)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div id="form-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="form" style={{ gap: 48 }}>
        <p className="t-meta muted">About four minutes. Every field is needed unless it says optional.</p>

        <fieldset className="group">
          <legend className="t-label" style={{ marginBottom: 32 }}>About you</legend>
          <TextField label="Full name" autoComplete="name" {...t('fullName')} />
          <TextField label="Email" type="email" autoComplete="email" {...t('email')} />
          <TextField label="Phone" type="tel" autoComplete="tel" {...t('phone')} />
          <TextField label="City and country" {...t('cityCountry')} />
          <TextField label="LinkedIn or website" inputMode="url" autoComplete="url" {...t('link')} />
          <TextField label="Who introduced you? (optional)" {...t('introducedBy')} />
        </fieldset>

        {kind === 'work_in' ? (
          <>
            <fieldset className="group">
              <legend className="t-label" style={{ marginBottom: 32 }}>The role</legend>
              <SelectField label="Role" placeholder="Operator, stylist or photographer" options={roleOptions} {...t('role')} />
              <TextField label="Current role and company" autoComplete="organization-title" {...t('currentRole')} />
              <SelectField label="Years in the field" placeholder="Choose a range" options={yearsInFieldOptions} {...t('yearsInField')} />
              <TextField label="Cities you can cover" {...t('cities')} />
              <TextField label="Languages you speak" {...t('languages')} />
              <TextField label="Earliest start date" type="date" placeholder="DD / MM / YYYY" {...t('startDate')} />
              <SelectField label="Arrangement" placeholder="Full time, part time or contract" options={arrangementOptions} {...t('arrangement')} />
              <ChoiceField label="Are you authorized to work in your country?" options={yesNoOptions} {...t('authorized')} />
              <TextField label="Portfolio link (optional for operators)" inputMode="url" {...t('portfolio')} />
              <UploadField
                name="resume"
                label="Resume"
                note="Please leave out your photo, date of birth and home address."
                file={file}
                onFile={onPickFile}
                error={errors.resume}
              />
            </fieldset>
            <fieldset className="group">
              <legend className="t-label" style={{ marginBottom: 32 }}>In your words</legend>
              <TextareaField label="Tell us about something you handled so well that nobody noticed." {...t('handled')} />
              <TextareaField label="Tell us about a time you made someone feel truly recognised." {...t('recognised')} />
            </fieldset>
          </>
        ) : null}

        {kind === 'work_with' ? (
          <>
            <fieldset className="group">
              <legend className="t-label" style={{ marginBottom: 32 }}>The business</legend>
              <TextField label="Business name" autoComplete="organization" {...t('businessName')} />
              <SelectField label="Category" placeholder="Tailor, cloth, grooming or courier" options={categoryOptions} {...t('category')} />
              <TextField label="Cities served" {...t('citiesServed')} />
              <TextField label="What you offer" {...t('offer')} />
              <TextField label="Capacity" placeholder="Pieces, appointments or deliveries a month" {...t('capacity')} />
              <SelectField label="Years operating" placeholder="Choose a range" options={yearsOperatingOptions} {...t('yearsOperating')} />
              <TextField label="Portfolio or website" inputMode="url" {...t('website')} />
              <TextField label="Contact person and their role" {...t('contact')} />
              <ChoiceField
                label="Are you willing to sign a confidentiality agreement?"
                options={yesNoOptions}
                {...t('nda')}
                error={ndaDeclined ? undefined : errors.nda}
              >
                {ndaDeclined ? (
                  <p className="notice" role="status">{NDA_DECLINED}</p>
                ) : null}
              </ChoiceField>
            </fieldset>
            <fieldset className="group">
              <legend className="t-label" style={{ marginBottom: 32 }}>In your words</legend>
              <TextareaField label="A member's piece arrives with a fault on the morning of his wedding. What do you do?" {...t('fault')} />
            </fieldset>
          </>
        ) : null}

        {kind === 'back' ? (
          <fieldset className="group">
            <legend className="t-label" style={{ marginBottom: 32 }}>Your interest</legend>
            <TextField label="Firm (optional)" autoComplete="organization" {...t('firm')} />
            <SelectField label="Type" placeholder="Angel, family office or strategic" options={investorTypeOptions} {...t('investorType')} />
            <TextField label="Country of residence" autoComplete="country-name" {...t('countryOfResidence')} />
            <ChoiceField label="Are you an accredited investor?" options={yesNoOptions} {...t('accredited')} />
            <SelectField label="Typical cheque size" placeholder="Choose a range" options={chequeOptions} {...t('cheque')} />
            <TextareaField label="What would you bring beyond capital? (optional)" optional {...t('beyond')} />
            <TextareaField label="Why this house? (optional)" optional {...t('why')} />
          </fieldset>
        ) : null}

        <div className="hp" aria-hidden="true">
          <label>
            Fax
            <input type="text" name="fax" tabIndex={-1} autoComplete="off" value={val('fax')} onChange={(e) => set('fax')(e.target.value)} />
          </label>
        </div>

        <div className="send">
          <Checkbox name="consent" checked={consent} onChange={(v) => { setConsent(v); setErrors((e) => ({ ...e, consent: '' })); }} error={errors.consent}>
            I have read the{' '}
            <a href="/privacy" target="_blank" rel="noopener">
              privacy notice<span className="sr-only"> (opens in a new tab)</span>
            </a>{' '}
            and agree that the house may keep these details to consider my application.
          </Checkbox>
          {kind === 'work_in' ? <p className="t-meta muted">{VACANCY_NOTE}</p> : null}
          {kind === 'back' ? <p className="t-meta muted">{SECURITIES_NOTE}</p> : null}
          <Turnstile siteKey={siteKey} onToken={setToken} resetKey={resetKey} />
          <button className="btn btn-solid" type="submit" disabled={status === 'sending' || ndaDeclined} aria-disabled={ndaDeclined || undefined}>
            {status === 'sending' ? 'Sending' : submitLabel}
          </button>
          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
          {kind === 'work_in' ? <p className="t-meta muted">Read by a person within a week. Never shared outside the house.</p> : null}
          {kind === 'work_with' ? <p className="t-meta muted">Read by a person within a week. Partners are never named publicly.</p> : null}
        </div>
      </div>
    </form>
  );
}
