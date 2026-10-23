import { z } from 'zod';
import {
  arrangementOptions,
  categoryOptions,
  chequeOptions,
  investorTypeOptions,
  roleOptions,
  values,
  yearsInFieldOptions,
  yearsOperatingOptions,
  yesNoOptions,
} from './options';

/** Shared by the browser and the server. Every message is shown under its field. */

export const MAX_WORDS = 100;
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Keeps the first `max` words, so typing or pasting can never go past the limit. */
export function limitWords(s: string, max = MAX_WORDS) {
  if (countWords(s) <= max) return s;
  const parts = s.split(/(\s+)/);
  let words = 0;
  let out = '';
  for (const p of parts) {
    if (!p) continue;
    if (/^\s+$/.test(p)) {
      out += p;
      continue;
    }
    if (words === max) break;
    words += 1;
    out += p;
  }
  return out.trimEnd();
}

const text = (min: number, max: number, empty: string, long = 'Please shorten this a little.') =>
  z.string({ error: empty }).trim().min(min, { error: empty }).max(max, { error: long });

const optionalText = (max: number) =>
  z.string().trim().max(max, { error: 'Please shorten this a little.' }).optional().or(z.literal(''));

const link = (empty: string) =>
  z
    .string({ error: empty })
    .trim()
    .min(1, { error: empty })
    .max(300, { error: 'Please shorten this link.' })
    .refine((v) => /^(https?:\/\/)?[^\s/]+\.[^\s]{2,}$/i.test(v), { error: 'Please enter a full link, like linkedin.com/in/yourname.' });

const choice = <T extends [string, ...string[]]>(vals: T, empty: string) =>
  z.enum(vals, { error: empty });

const answer = (empty: string) =>
  z
    .string({ error: empty })
    .trim()
    .min(1, { error: empty })
    .refine((v) => countWords(v) <= MAX_WORDS, { error: 'Please keep this to 100 words.' });

const optionalAnswer = z
  .string()
  .trim()
  .refine((v) => countWords(v) <= MAX_WORDS, { error: 'Please keep this to 100 words.' })
  .optional()
  .or(z.literal(''));

export const aboutSchema = z.strictObject({
  fullName: text(2, 120, 'Please add your name.'),
  email: z
    .string({ error: 'Please add your email.' })
    .trim()
    .min(1, { error: 'Please add your email.' })
    .max(200, { error: 'Please shorten this email.' })
    .pipe(z.email({ error: 'Please enter a valid email, like name@example.com.' })),
  phone: z
    .string({ error: 'Please add your phone number.' })
    .trim()
    .min(1, { error: 'Please add your phone number.' })
    .max(40, { error: 'Please shorten this phone number.' })
    .refine((v) => /^\+?[0-9 ().-]{6,}$/.test(v), { error: 'Please enter a phone number using digits, spaces and an optional +.' }),
  cityCountry: text(2, 120, 'Please add your city and country.'),
  link: link('Please add your LinkedIn or website.'),
  introducedBy: optionalText(120),
});

const yesNo = values(yesNoOptions);

export const workInDetails = z
  .strictObject({
    role: choice(values(roleOptions), 'Please choose a role.'),
    currentRole: text(2, 160, 'Please add your current role and company.'),
    yearsInField: choice(values(yearsInFieldOptions), 'Please choose a range.'),
    cities: text(2, 200, 'Please add the cities you can cover.'),
    languages: text(2, 200, 'Please add the languages you speak.'),
    startDate: z
      .string({ error: 'Please add your earliest start date.' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Please add your earliest start date.' }),
    arrangement: choice(values(arrangementOptions), 'Please choose full time, part time or contract.'),
    authorized: choice(yesNo, 'Please choose yes or no.'),
    portfolio: z.string().trim().max(300, { error: 'Please shorten this link.' }).optional().or(z.literal('')),
  })
  .superRefine((d, ctx) => {
    const message = portfolioError(d.role, d.portfolio);
    if (message) ctx.addIssue({ code: 'custom', path: ['portfolio'], message });
  });

/** Portfolio is required for stylists and photographers, optional for operators. Also called on its own by the form, because zod skips refinements while other fields are invalid. */
export function portfolioError(role: string | undefined, portfolio: string | undefined) {
  const v = portfolio?.trim() ?? '';
  if ((role === 'stylist' || role === 'photographer') && !v) return 'Please add a link to your portfolio.';
  if (v && !/^(https?:\/\/)?[^\s/]+\.[^\s]{2,}$/i.test(v)) return 'Please enter a full link, like yourname.com.';
  return null;
}

export const workInAnswers = z.strictObject({
  handled: answer('Please answer in a few lines.'),
  recognised: answer('Please answer in a few lines.'),
});

export const NDA_DECLINED =
  'Thank you for telling us. The house works only with partners who sign a confidentiality agreement, so we cannot take this further for now.';

export const workWithDetails = z.strictObject({
  businessName: text(2, 160, 'Please add the name of your business.'),
  category: choice(values(categoryOptions), 'Please choose a category.'),
  citiesServed: text(2, 200, 'Please add the cities you serve.'),
  offer: text(2, 300, 'Please tell us what you offer.'),
  capacity: text(1, 120, 'Please tell us how much you can take on each month.'),
  yearsOperating: choice(values(yearsOperatingOptions), 'Please choose a range.'),
  website: link('Please add your portfolio or website.'),
  contact: text(2, 160, 'Please add a contact person and their role.'),
  nda: z.enum(yesNo, { error: 'Please choose yes or no.' }).refine((v) => v === 'yes', { error: NDA_DECLINED }),
});

export const workWithAnswers = z.strictObject({
  fault: answer('Please answer in a few lines.'),
});

export const backDetails = z.strictObject({
  firm: optionalText(160),
  investorType: choice(values(investorTypeOptions), 'Please choose angel, family office or strategic.'),
  countryOfResidence: text(2, 120, 'Please add your country of residence.'),
  accredited: choice(yesNo, 'Please choose yes or no.'),
  cheque: choice(values(chequeOptions), 'Please choose a range.'),
});

export const backAnswers = z.strictObject({
  beyond: optionalAnswer,
  why: optionalAnswer,
});

const consent = z.literal(true, { error: 'Please confirm you have read the privacy notice.' });

export const resumeRef = z.strictObject({
  path: z.string().regex(/^[0-9a-f-]{36}\.pdf$/),
  token: z.string().min(10).max(200),
});

const common = {
  about: aboutSchema,
  consent,
  turnstileToken: z.string().max(4096).optional(),
  /** Honeypot. People never see it; a value means a bot. */
  fax: z.string().max(200).optional(),
  sourceQuery: z.string().max(300).optional(),
};

export const applicationSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('work_in'), details: workInDetails, answers: workInAnswers, resume: resumeRef, ...common }),
  z.strictObject({ kind: z.literal('work_with'), details: workWithDetails, answers: workWithAnswers, ...common }),
  z.strictObject({ kind: z.literal('back'), details: backDetails, answers: backAnswers, ...common }),
]);

export type Application = z.infer<typeof applicationSchema>;

/**
 * The house never asks for these and refuses them if they arrive.
 * The strict schema already rejects unknown keys; this list makes the rule explicit and testable.
 */
const FORBIDDEN = /\b(birth|dob|age|passport|national id|id number|identity number|sin|ssn|social insurance|social security|driver|licen[cs]e number|bank|iban|swift|routing|account number|salary|compensation|pay history|health|medical|disability|disabilities|canadian (work )?experience)\b/;

/** Splits camelCase and snake_case keys into words, so "businessName" never reads as "ssn". */
const words = (k: string) => k.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join(' ');

export function findForbiddenKey(input: unknown, depth = 0): string | null {
  if (!input || typeof input !== 'object' || depth > 4) return null;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (FORBIDDEN.test(words(k))) return k;
    const nested = findForbiddenKey(v, depth + 1);
    if (nested) return nested;
  }
  return null;
}

/** Flattens zod issues to one plain message per field name (the last path segment). */
export function fieldErrors(issues: readonly { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[i.path.length - 1] ?? 'form');
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

export const PDF_RULES = {
  wrongType: 'This file is not a PDF. Please choose a PDF.',
  tooBig: 'This file is larger than 5 MB. Please choose a smaller PDF.',
  missing: 'Please attach your resume as a PDF.',
  failed: 'We could not upload this file. Please try again.',
};
