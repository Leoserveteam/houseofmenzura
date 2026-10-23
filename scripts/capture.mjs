// Captures the running site for the Figma fidelity review.
// Usage: node scripts/capture.mjs <base url> <output dir>
// Needs the site running in local test mode (HOM_TEST_MODE=1) so the confirmation can be reached.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const [, , base = 'http://localhost:3100', out = 'design/build'] = process.argv;
mkdirSync(out, { recursive: true });

const sections = {
  header: 'header.header',
  hero: '#top',
  gives: 'section[aria-labelledby="gives-title"]',
  'work-in': '#work-in',
  'work-with': '#work-with',
  back: '#back',
  leave: '#leave-your-name',
  footer: 'footer',
};

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});

async function page(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce', extraHTTPHeaders: { 'x-real-ip': `10.1.${width}.${Math.floor(Math.random() * 250)}` } });
  const p = await ctx.newPage();
  return p;
}

async function settle(p) {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(300);
}

for (const [label, width, height] of [['d', 1440, 900], ['m', 390, 844]]) {
  const p = await page(width, height);
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await settle(p);
  // Load every lazy image before the full-page shot.
  await p.evaluate(async () => { for (const img of document.images) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  await p.screenshot({ path: `${out}/${label}-full.png`, fullPage: true });
  for (const [name, sel] of Object.entries(sections)) {
    const el = p.locator(sel).first();
    if (await el.count()) {
      if (name === 'header') await p.evaluate(() => window.scrollTo(0, 0));
      await el.screenshot({ path: `${out}/${label}-${name}.png` });
    }
  }

  // Three form tabs.
  for (const [key, tab] of [['work-in', 'Work in the house'], ['work-with', 'Work with the house'], ['back', 'Back the house']]) {
    await p.getByRole('tab', { name: tab }).click();
    await p.locator('#apply-form').screenshot({ path: `${out}/${label}-form-${key}.png` });
  }

  // Checkbox checked and a Yes/No selection.
  await p.getByRole('tab', { name: 'Work in the house' }).click();
  await p.getByRole('checkbox').check();
  await p.locator('.send .field').first().screenshot({ path: `${out}/${label}-state-checkbox.png` });
  const choice = p.getByRole('group', { name: 'Are you authorized to work in your country?' });
  await choice.getByLabel('Yes').check();
  await choice.screenshot({ path: `${out}/${label}-state-choice-yes.png` });
  await choice.getByLabel('No').check();
  await choice.screenshot({ path: `${out}/${label}-state-choice-no.png` });

  // Role dialog (desktop) or sheet (mobile), all three roles.
  for (const role of ['operator', 'stylist', 'photographer']) {
    await p.goto(base + '/#work-in', { waitUntil: 'networkidle' });
    await settle(p);
    await p.locator(`button.card[data-role="${role}"]`).click();
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/${label}-role-${role}.png` });
    await p.keyboard.press('Escape');
  }

  // Confirmation state: send a valid Back the house request.
  await p.goto(base + '/?form=back#leave-your-name', { waitUntil: 'networkidle' });
  await settle(p);
  await p.getByLabel('Full name').fill('Ada Obi');
  await p.getByLabel('Email').fill('ada@example.com');
  await p.getByLabel('Phone').fill('+1 416 555 0100');
  await p.getByLabel('City and country').fill('Toronto, Canada');
  await p.getByLabel('LinkedIn or website').fill('linkedin.com/in/adaobi');
  await p.getByLabel('Type', { exact: true }).selectOption('angel');
  await p.getByLabel('Country of residence').fill('Canada');
  await p.getByRole('group', { name: 'Are you an accredited investor?' }).getByLabel('No').check();
  await p.getByLabel('Typical cheque size').selectOption('under_25k');
  await p.getByRole('checkbox').check();
  await p.getByRole('button', { name: 'Request an introduction' }).click();
  await p.getByRole('heading', { name: 'Thank you.' }).waitFor();
  await p.waitForTimeout(200);
  await p.locator('#leave-your-name').screenshot({ path: `${out}/${label}-received.png` });
  await p.context().close();
}

await browser.close();
console.log(`captured into ${out}`);
