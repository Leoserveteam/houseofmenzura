import { expect, test } from '@playwright/test';
import { fillAbout, ipHeader, notPdf, pdf, reset, state, validAbout } from './helpers';

test.beforeEach(async ({ request, page }) => {
  await reset(request);
  await page.setExtraHTTPHeaders(ipHeader());
});

const back = (extra: Record<string, unknown> = {}) => ({
  kind: 'back',
  about: { ...validAbout },
  details: { investorType: 'angel', countryOfResidence: 'Canada', accredited: 'no', cheque: 'under_25k' },
  answers: {},
  consent: true,
  turnstileToken: 'test-pass',
  ...extra,
});

test.describe('resume file checks', () => {
  test('a non-PDF type is refused in the browser', async ({ page }) => {
    await page.goto('/#leave-your-name');
    await page.locator('input[type="file"]').setInputFiles({ name: 'resume.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.from('PK') });
    await expect(page.getByText('This file is not a PDF. Please choose a PDF.')).toBeVisible();
  });

  test('a file named .pdf without the %PDF signature is refused in the browser', async ({ page }) => {
    await page.goto('/#leave-your-name');
    await page.locator('input[type="file"]').setInputFiles({ name: 'resume.pdf', mimeType: 'application/pdf', buffer: notPdf() });
    await expect(page.getByText('This file is not a PDF. Please choose a PDF.')).toBeVisible();
  });

  test('a PDF over 5 MB is refused in the browser', async ({ page }) => {
    await page.goto('/#leave-your-name');
    await page.locator('input[type="file"]').setInputFiles({ name: 'big.pdf', mimeType: 'application/pdf', buffer: pdf(5 * 1024 * 1024) });
    await expect(page.getByText('This file is larger than 5 MB. Please choose a smaller PDF.')).toBeVisible();
  });

  test('the server refuses upload URLs for wrong types and sizes', async ({ request }) => {
    const h = { headers: ipHeader() };
    expect((await request.post('/api/upload-url', { ...h, data: { size: 1000, type: 'image/png', ext: 'png' } })).status()).toBe(422);
    expect((await request.post('/api/upload-url', { ...h, data: { size: 1000, type: 'application/pdf', ext: 'exe' } })).status()).toBe(422);
    expect((await request.post('/api/upload-url', { ...h, data: { size: 6 * 1024 * 1024, type: 'application/pdf', ext: 'pdf' } })).status()).toBe(422);
    const ok = await request.post('/api/upload-url', { ...h, data: { size: 1000, type: 'application/pdf', ext: 'pdf' } });
    expect(ok.status()).toBe(200);
    expect((await ok.json()).path).toMatch(/^[0-9a-f-]{36}\.pdf$/);
  });

  test('the server checks the %PDF signature of the stored file and deletes a fake', async ({ request }) => {
    const h = ipHeader();
    const up = await (await request.post('/api/upload-url', { headers: h, data: { size: 100, type: 'application/pdf', ext: 'pdf' } })).json();
    await request.put(up.uploadUrl, { headers: { 'content-type': 'application/pdf' }, data: notPdf() });
    const res = await request.post('/api/apply', {
      headers: h,
      data: {
        kind: 'work_in',
        about: validAbout,
        details: { role: 'operator', currentRole: 'Ops lead', yearsInField: '5_10', cities: 'Toronto', languages: 'English', startDate: '2027-01-01', arrangement: 'full_time', authorized: 'yes', portfolio: '' },
        answers: { handled: 'Something.', recognised: 'Someone.' },
        resume: { path: up.path, token: up.token },
        consent: true,
        turnstileToken: 'test-pass',
      },
    });
    expect(res.status()).toBe(422);
    expect((await res.json()).fields.resume).toBe('This file is not a PDF. Please choose a PDF.');
    const s = await state(request);
    expect(s.applications).toHaveLength(0);
    expect(s.objects).toHaveLength(0);
  });

  test('a resume path that the server did not issue is refused', async ({ request }) => {
    const res = await request.post('/api/apply', {
      headers: ipHeader(),
      data: {
        kind: 'work_in',
        about: validAbout,
        details: { role: 'operator', currentRole: 'Ops lead', yearsInField: '5_10', cities: 'Toronto', languages: 'English', startDate: '2027-01-01', arrangement: 'full_time', authorized: 'yes', portfolio: '' },
        answers: { handled: 'Something.', recognised: 'Someone.' },
        resume: { path: '11111111-1111-1111-1111-111111111111.pdf', token: '123.forged-token' },
        consent: true,
        turnstileToken: 'test-pass',
      },
    });
    expect(res.status()).toBe(422);
  });
});

test.describe('spam and abuse', () => {
  test('honeypot: a filled hidden field is accepted quietly and nothing is stored or sent', async ({ page, request }) => {
    await page.goto('/?form=back#leave-your-name');
    expect((await page.locator('input[name="fax"]').boundingBox())!.x).toBeLessThan(0);
    await fillAbout(page);
    await page.getByLabel('Type', { exact: true }).selectOption('angel');
    await page.getByLabel('Country of residence').fill('Canada');
    await page.getByRole('group', { name: 'Are you an accredited investor?' }).getByLabel('No').check();
    await page.getByLabel('Typical cheque size').selectOption('under_25k');
    await page.getByRole('checkbox').check();
    await page.locator('input[name="fax"]').fill('bot was here', { force: true });
    await page.getByRole('button', { name: 'Request an introduction' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeVisible();
    const s = await state(request);
    expect(s.applications).toHaveLength(0);
    expect(s.emails).toHaveLength(0);
  });

  test('honeypot field is not reachable by keyboard or screen reader', async ({ page }) => {
    await page.goto('/#leave-your-name');
    await expect(page.locator('input[name="fax"]')).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('.hp')).toHaveAttribute('aria-hidden', 'true');
  });

  test('a failed Turnstile check is refused', async ({ request }) => {
    const res = await request.post('/api/apply', { headers: ipHeader(), data: back({ turnstileToken: 'bad' }) });
    expect(res.status()).toBe(403);
    expect((await state(request)).applications).toHaveLength(0);
  });

  test('rate limit: the sixth submission from one address within an hour is refused', async ({ request }) => {
    const headers = ipHeader();
    for (let i = 0; i < 5; i++) expect((await request.post('/api/apply', { headers, data: back() })).status()).toBe(200);
    expect((await request.post('/api/apply', { headers, data: back() })).status()).toBe(429);
    expect((await request.post('/api/apply', { headers: ipHeader(), data: back() })).status()).toBe(200);
    expect((await state(request)).applications).toHaveLength(6);
  });

  for (const key of ['dateOfBirth', 'passportNumber', 'bankAccount', 'salaryHistory', 'healthInfo', 'canadianExperience', 'sin']) {
    test(`a submission carrying "${key}" is refused`, async ({ request }) => {
      const data = back();
      (data.about as Record<string, unknown>)[key] = 'x';
      const res = await request.post('/api/apply', { headers: ipHeader(), data });
      expect(res.status()).toBe(400);
      expect((await state(request)).applications).toHaveLength(0);
    });
  }

  test('unknown fields are refused by the strict schema', async ({ request }) => {
    const res = await request.post('/api/apply', { headers: ipHeader(), data: back({ notes: 'x' }) });
    expect(res.status()).toBe(422);
  });

  test('the retention job needs its secret', async ({ request }) => {
    expect((await request.get('/api/cron/retention')).status()).toBe(401);
  });
});
