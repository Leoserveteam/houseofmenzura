import { expect, test } from '@playwright/test';

const selected = (page: import('@playwright/test').Page) => page.locator('[role="tab"][aria-selected="true"]');

test.describe('tab preselection from every entry point', () => {
  for (const [label, tab, section] of [
    ['Work in the house', 'Work in the house', '#work-in'],
    ['Work with the house', 'Work with the house', '#work-with'],
    ['Back the house', 'Back the house', '#back'],
  ] as const) {
    test(`nav link "${label}" scrolls to its section and selects the tab`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: label }).click();
      await expect(selected(page)).toHaveText(tab);
      await expect(page.locator(section)).toBeInViewport();
      await expect(page).toHaveURL(new RegExp(`${section}$`));
    });

    test(`door "${label}" scrolls to its section and selects the tab`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('navigation', { name: 'Three ways in' }).getByRole('link', { name: new RegExp(label) }).click();
      await expect(selected(page)).toHaveText(tab);
      await expect(page.locator(section)).toBeInViewport();
    });
  }

  for (const [button, tab] of [
    ['Apply for a founding role', 'Work in the house'],
    ['Propose a partnership', 'Work with the house'],
    ['Request an introduction', 'Back the house'],
  ] as const) {
    test(`section button "${button}" scrolls to the form with "${tab}" selected`, async ({ page }) => {
      await page.goto('/?form=back');
      await page.locator('main section').getByRole('link', { name: button }).click();
      await expect(selected(page)).toHaveText(tab);
      await expect(page.locator('#apply-form')).toBeInViewport();
    });
  }

  for (const [q, tab] of [
    ['work-in', 'Work in the house'],
    ['work-with', 'Work with the house'],
    ['back', 'Back the house'],
  ] as const) {
    test(`?form=${q} preselects "${tab}"`, async ({ page }) => {
      await page.goto(`/?form=${q}`);
      await expect(selected(page)).toHaveText(tab);
    });
    test(`#${q} preselects "${tab}"`, async ({ page }) => {
      await page.goto(`/#${q}`);
      await expect(selected(page)).toHaveText(tab);
    });
  }

  test('a ?role= link from a role page preselects the role', async ({ page }) => {
    await page.goto('/roles/stylist');
    await page.getByRole('link', { name: 'Apply for this role' }).click();
    await expect(selected(page)).toHaveText('Work in the house');
    await expect(page.getByLabel('Role', { exact: true })).toHaveValue('stylist');
  });

  test('header is pinned on scroll', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 4000);
    await expect(page.locator('header.header')).toBeInViewport();
    await expect(page.locator('header.header')).toHaveCSS('position', 'fixed');
  });

  test('menzura.co links open in a new tab', async ({ page }) => {
    await page.goto('/');
    for (const link of await page.locator('a[href="https://menzura.co"]').all()) await expect(link).toHaveAttribute('target', '_blank');
    expect(await page.locator('a[href="https://menzura.co"]').count()).toBe(2);
  });

  test('tabs keep About you when switching @mobile', async ({ page }) => {
    await page.goto('/#leave-your-name');
    await page.getByLabel('Full name').fill('Ada Obi');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByRole('tab', { name: 'Back the house' }).click();
    await page.getByRole('tab', { name: 'Work with the house' }).click();
    await expect(page.getByLabel('Full name')).toHaveValue('Ada Obi');
    await expect(page.getByLabel('Email')).toHaveValue('ada@example.com');
    await expect(page.getByLabel('Business name')).toBeVisible();
  });

  test('tabs can be changed with the arrow keys', async ({ page }) => {
    await page.goto('/#leave-your-name');
    await page.getByRole('tab', { name: 'Work in the house' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(selected(page)).toHaveText('Work with the house');
    await expect(page.getByRole('tab', { name: 'Work with the house' })).toBeFocused();
  });
});
