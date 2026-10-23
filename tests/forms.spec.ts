import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { fillAbout, ipHeader, pdf, reset, state, tab } from './helpers';

/** Compares page positions, so a smooth scroll in progress cannot skew the result. */
async function expectAbove(a: Locator, b: Locator) {
  const top = (l: Locator) => l.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  expect(await top(a)).toBeLessThan(await top(b));
}

test.beforeEach(async ({ request, page }) => {
  await reset(request);
  await page.setExtraHTTPHeaders(ipHeader());
});

test('Work in the house: full application reaches storage and the house, with the confirmation shown @mobile', async ({ page, request }) => {
  await page.goto('/?form=work-in#leave-your-name');
  await fillAbout(page);
  await page.getByLabel('Role', { exact: true }).selectOption('photographer');
  await page.getByLabel('Current role and company').fill('Portrait photographer, Studio North');
  await page.getByLabel('Years in the field').selectOption('5_10');
  await page.getByLabel('Cities you can cover').fill('Toronto, Lagos');
  await page.getByLabel('Languages you speak').fill('English, Yoruba');
  await page.getByLabel('Earliest start date').fill('2027-01-15');
  await page.getByLabel('Arrangement').selectOption('contract');
  await page.getByRole('group', { name: 'Are you authorized to work in your country?' }).getByLabel('Yes').check();
  await page.getByLabel('Portfolio link (optional for operators)').fill('adaobi.photo');
  await page.locator('input[type="file"]').setInputFiles({ name: 'resume.pdf', mimeType: 'application/pdf', buffer: pdf() });
  await expect(page.getByText('resume.pdf')).toBeVisible();
  await page.getByLabel('Tell us about something you handled so well that nobody noticed.').fill('A client lost a bag before a shoot and I had a replacement ready.');
  await page.getByLabel('Tell us about a time you made someone feel truly recognised.').fill('I remembered a sitter’s late father’s watch and framed the portrait around it.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send to the house' }).click();

  await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeVisible();
  await expect(page.getByText('You can close this page.')).toBeVisible();
  await expect(page.locator('#apply-form')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeFocused();

  const s = await state(request);
  expect(s.applications).toHaveLength(1);
  const row = s.applications[0];
  expect(row.kind).toBe('work_in');
  expect(row.role).toBe('photographer');
  expect(row.is_test).toBe(true);
  expect(row.resume_path).toMatch(/^[0-9a-f-]{36}\.pdf$/);
  expect(s.objects).toContain(`resumes-test/${row.resume_path}`);
  expect(row.consent_at).toBeTruthy();
  expect(row.source_query).toBe('?form=work-in');
  expect(row.answers.handled).toContain('replacement');

  // One email: kind, role, name, city and a link. Never answers, never the resume.
  expect(s.emails).toHaveLength(1);
  const mail = s.emails[0];
  expect(mail.text).toContain('Kind: Work in the house');
  expect(mail.text).toContain('Role: Photographer');
  expect(mail.text).toContain('Name: Ada Obi');
  expect(mail.text).toContain('City: Toronto, Canada');
  expect(mail.text).toContain(row.id);
  expect(mail.text).not.toContain('replacement');
  expect(mail.text).not.toContain('.pdf');
  expect(mail.text).not.toContain('ada@example.com');
});

test('Work in the house: missing fields show plain errors inline and nothing is sent', async ({ page, request }) => {
  await page.goto('/#leave-your-name');
  await page.getByRole('button', { name: 'Send to the house' }).click();
  await expect(page.getByText('Please add your name.')).toBeVisible();
  await expect(page.getByText('Please choose a role.')).toBeVisible();
  await expect(page.getByText('Please attach your resume as a PDF.')).toBeVisible();
  await expect(page.getByText('Please confirm you have read the privacy notice.')).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeFocused();
  await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
  const describedBy = await page.getByLabel('Full name').getAttribute('aria-describedby');
  await expect(page.locator(`#${describedBy}`)).toHaveText('Please add your name.');
  expect((await state(request)).applications).toHaveLength(0);
});

test('portfolio is required for stylists and photographers, optional for operators', async ({ page }) => {
  await page.goto('/#leave-your-name');
  await page.getByLabel('Role', { exact: true }).selectOption('stylist');
  await page.getByRole('button', { name: 'Send to the house' }).click();
  await expect(page.getByText('Please add a link to your portfolio.')).toBeVisible();
  await page.getByLabel('Role', { exact: true }).selectOption('operator');
  await page.getByRole('button', { name: 'Send to the house' }).click();
  await expect(page.getByText('Please add a link to your portfolio.')).toHaveCount(0);
});

test('word counter counts live and stops at 100 words', async ({ page }) => {
  await page.goto('/#leave-your-name');
  const box = page.getByLabel('Tell us about something you handled so well that nobody noticed.');
  await box.fill('one two three');
  await expect(page.getByText('3 / 100')).toBeVisible();
  await box.fill(Array.from({ length: 130 }, (_, i) => `w${i}`).join(' '));
  await expect(page.getByText('100 / 100').first()).toBeVisible();
  expect((await box.inputValue()).trim().split(/\s+/)).toHaveLength(100);
  await box.press('End');
  await box.pressSequentially(' extra');
  expect((await box.inputValue()).trim().split(/\s+/)).toHaveLength(100);
});

test('Work with the house: full proposal is stored @mobile', async ({ page, request }) => {
  await page.goto('/?form=work-with#leave-your-name');
  await fillAbout(page);
  await page.getByLabel('Business name').fill('Obi Pressing');
  await page.getByLabel('Category').selectOption('tailor');
  await page.getByLabel('Cities served').fill('Lagos');
  await page.getByLabel('What you offer').fill('Alterations and pressing');
  await page.getByLabel('Capacity', { exact: true }).fill('60 pieces a month');
  await page.getByLabel('Years operating').selectOption('10_25');
  await page.getByLabel('Portfolio or website').fill('obipressing.ng');
  await page.getByLabel('Contact person and their role').fill('Ada Obi, owner');
  await page.getByRole('group', { name: 'Are you willing to sign a confidentiality agreement?' }).getByLabel('Yes').check();
  await page.getByLabel("A member's piece arrives with a fault on the morning of his wedding. What do you do?").fill('Fix it on site, then call.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send to the house' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeVisible();
  const s = await state(request);
  expect(s.applications[0]).toMatchObject({ kind: 'work_with', role: 'tailor', resume_path: null, is_test: true });
  expect(s.emails[0].text).toContain('Category: Tailor');
  expect(s.emails[0].text).not.toContain('Fix it on site');
});

test('Work with the house: "No" to the confidentiality agreement shows a polite message and blocks sending', async ({ page, request }) => {
  await page.goto('/?form=work-with#leave-your-name');
  const nda = page.getByRole('group', { name: 'Are you willing to sign a confidentiality agreement?' });
  await nda.getByLabel('No').check();
  await expect(page.getByText('The house works only with partners who sign a confidentiality agreement')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send to the house' })).toBeDisabled();
  await nda.getByLabel('Yes').check();
  await expect(page.getByRole('button', { name: 'Send to the house' })).toBeEnabled();

  // The server refuses it too.
  const res = await request.post('/api/apply', {
    headers: { 'x-real-ip': '10.9.9.9' },
    data: {
      kind: 'work_with',
      about: { fullName: 'A B', email: 'a@b.co', phone: '+1 416 555 0100', cityCountry: 'Lagos', link: 'ab.co' },
      details: { businessName: 'AB', category: 'courier', citiesServed: 'Lagos', offer: 'Delivery', capacity: '10', yearsOperating: '2_5', website: 'ab.co', contact: 'A B, owner', nda: 'no' },
      answers: { fault: 'Call.' },
      consent: true,
      turnstileToken: 'test-pass',
    },
  });
  expect(res.status()).toBe(422);
  expect((await res.json()).fields.nda).toContain('confidentiality agreement');
});

test('Back the house: request is stored, with the securities line above the button @mobile', async ({ page, request }) => {
  await page.goto('/?form=back#leave-your-name');
  const note = page.locator('.send').getByText('This page is not an offer to sell securities. Any investment is made only through private conversation and the documents that follow.');
  await expect(note).toBeVisible();
  const button = page.getByRole('button', { name: 'Request an introduction' });
  await expectAbove(note, button);
  await fillAbout(page);
  await page.getByLabel('Type', { exact: true }).selectOption('family_office');
  await page.getByLabel('Country of residence').fill('Canada');
  await page.getByRole('group', { name: 'Are you an accredited investor?' }).getByLabel('Yes').check();
  await expect(page.getByLabel('Typical cheque size').locator('option')).toHaveCount(6);
  await page.getByLabel('Typical cheque size').selectOption('100k_250k');
  await page.getByRole('checkbox').check();
  await button.click();
  await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeVisible();
  const s = await state(request);
  expect(s.applications[0]).toMatchObject({ kind: 'back', role: null });
  expect(s.applications[0].details.cheque).toBe('100k_250k');
});

test('vacancy line sits above the Work in the house submit button', async ({ page }) => {
  await page.goto('/#leave-your-name');
  const note = page.locator('.send').getByText('This is a current vacancy. We use software to organise applications and prepare a short summary of each. A person reads every application and makes every decision.');
  const button = page.getByRole('button', { name: 'Send to the house' });
  await expectAbove(note, button);
  await tab(page, 'Work with the house');
  await expect(page.locator('.send').getByText('This is a current vacancy.')).toHaveCount(0);
});

test('the consent line links to the privacy page', async ({ page }) => {
  await page.goto('/#leave-your-name');
  await expect(page.locator('.checkbox-row')).toHaveText(
    'I have read the privacy notice (opens in a new tab) and agree that the house may keep these details to consider my application.',
  );
  await expect(page.locator('.checkbox-row a')).toHaveAttribute('href', '/privacy');
});
