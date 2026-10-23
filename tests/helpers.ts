import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const pdf = (extra = 0) =>
  Buffer.concat([Buffer.from('%PDF-1.4\n1 0 obj << >> endobj\ntrailer << >>\n'), Buffer.alloc(extra, 32), Buffer.from('\n%%EOF\n')]);

export const notPdf = () => Buffer.from('This is plain text pretending to be a PDF.');

export async function reset(request: APIRequestContext) {
  await request.delete('/api/test-state');
}

export async function state(request: APIRequestContext) {
  return (await request.get('/api/test-state')).json();
}

/** Each test gets its own address, so the hourly limit of one test never affects another. */
export const ipHeader = () => ({ 'x-real-ip': `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });

export async function fillAbout(page: Page) {
  await page.getByLabel('Full name').fill('Ada Obi');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Phone').fill('+1 416 555 0100');
  await page.getByLabel('City and country').fill('Toronto, Canada');
  await page.getByLabel('LinkedIn or website').fill('linkedin.com/in/adaobi');
}

export async function tab(page: Page, name: string) {
  await page.getByRole('tab', { name }).click();
  await expect(page.getByRole('tab', { name })).toHaveAttribute('aria-selected', 'true');
}

export const validAbout = {
  fullName: 'Ada Obi',
  email: 'ada@example.com',
  phone: '+1 416 555 0100',
  cityCountry: 'Toronto, Canada',
  link: 'linkedin.com/in/adaobi',
  introducedBy: '',
};
