import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { composeNotification } from '../lib/notification';

const PAGES = ['/', '/roles/operator', '/roles/stylist', '/roles/photographer', '/privacy'];
const BANNED = ['luxury', 'exclusive', 'elite', 'VIP', 'premium', 'bespoke', 'AI-powered', 'subscription', 'plan', 'box', 'sale', 'discount'];
// Copied word for word from the Figma role description, which the house wrote.
const FIGMA_ALLOWED = ['Plan the quarterly dinners'];

function check(text: string) {
  let t = text;
  for (const a of FIGMA_ALLOWED) t = t.split(a).join('');
  expect(t, 'em dash').not.toContain('—');
  for (const w of BANNED) expect(t, `banned word "${w}"`).not.toMatch(new RegExp(`\\b${w.replace('-', '\\-')}\\b`, 'i'));
  expect(t).not.toMatch(/master tailor [A-Z]/); // never name the tailor
}

for (const path of PAGES) {
  test(`${path}: copy has no em dashes or banned words`, async ({ page }) => {
    await page.goto(path);
    const text = await page.evaluate(() => {
      const attrs = [...document.querySelectorAll('[alt],[aria-label],[placeholder],[title]')].map((e) =>
        ['alt', 'aria-label', 'placeholder', 'title'].map((a) => e.getAttribute(a) ?? '').join(' '),
      );
      return [document.title, document.body.innerText, ...attrs, document.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''].join('\n');
    });
    check(text);
  });

  test(`${path}: no WCAG 2.1 AA violations @mobile`, async ({ page }) => {
    await page.goto(path);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  });
}

test('all three form tabs and the role dialog pass WCAG 2.1 AA, and their copy is clean', async ({ page }) => {
  await page.goto('/#leave-your-name');
  for (const name of ['Work in the house', 'Work with the house', 'Back the house']) {
    await page.getByRole('tab', { name }).click();
    check(await page.locator('#apply-form').innerText());
    const r = await new AxeBuilder({ page }).include('#apply-form').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(r.violations.map((v) => v.id)).toEqual([]);
  }
  await page.goto('/#work-in');
  await page.locator('button.card[data-role="operator"]').click();
  const r = await new AxeBuilder({ page }).include('dialog').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
});

test('error messages and the confirmation copy are clean', async ({ page }) => {
  await page.goto('/#leave-your-name');
  await page.getByRole('button', { name: 'Send to the house' }).click();
  check(await page.locator('#apply-form').innerText());
});

test('touch targets are at least 44px @mobile', async ({ page }) => {
  await page.goto('/#leave-your-name');
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('a, button, input:not([type="hidden"]):not(.sr-only):not([name="fax"]), select, textarea, label.choice, label.checkbox-row')]
      .filter((e) => (e as HTMLElement).offsetParent !== null && !e.closest('.hp'))
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ e, r }) => {
        if (e.matches('input.radio, input.check')) return false; // their label row is the target
        if (e.matches('.checkbox-row a')) return false; // inline link inside a sentence
        return r.width > 0 && r.height < 44;
      })
      .map(({ e, r }) => `${e.tagName} ${(e.textContent || '').trim().slice(0, 30)} ${Math.round(r.height)}`),
  );
  expect(small).toEqual([]);
});

test('notification email carries no answers and no em dashes or banned words', () => {
  for (const kind of ['work_in', 'work_with', 'back'] as const) {
    const m = composeNotification({ id: 'abc', kind, role: kind === 'work_in' ? 'stylist' : kind === 'work_with' ? 'courier' : null, name: 'A', city: 'B' }, { test: false });
    check(`${m.subject}\n${m.text}`);
    expect(m.text).toContain('id%3Aeq%3Aabc');
  }
});
