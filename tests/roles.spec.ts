import { expect, test } from '@playwright/test';
import { roleHistory, roles } from '../content/roles';

const VACANCY =
  'This is a current vacancy. We use software to organise applications and prepare a short summary of each. A person reads every application and makes every decision.';

test.describe('role dialogs', () => {
  for (const role of roles) {
    test(`${role.title}: opens, traps focus, closes with Escape and returns focus @mobile`, async ({ page }) => {
      await page.goto('/#work-in');
      const card = page.locator(`button.card[data-role="${role.slug}"]`);
      await card.click();
      const dialog = page.getByRole('dialog', { name: role.title });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText(VACANCY)).toBeVisible();
      await expect(dialog.getByText(role.whatYouWillDo[0])).toBeVisible();
      // Focus stays inside the modal dialog.
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(card).toBeFocused();
    });
  }

  test('clicking the backdrop closes the dialog', async ({ page }) => {
    await page.goto('/#work-in');
    const card = page.locator('button.card[data-role="operator"]');
    await card.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(40, 450);
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(card).toBeFocused();
  });

  test('the close button closes the dialog', async ({ page }) => {
    await page.goto('/#work-in');
    await page.locator('button.card[data-role="photographer"]').click();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  for (const role of roles) {
    test(`"Apply for this role" selects the tab, preselects ${role.slug} and scrolls to the form @mobile`, async ({ page }) => {
      await page.goto('/?form=back#work-in');
      await page.locator(`button.card[data-role="${role.slug}"]`).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Apply for this role' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveText('Work in the house');
      await expect(page.getByLabel('Role', { exact: true })).toHaveValue(role.slug);
      await expect(page.locator('#apply-form')).toBeInViewport();
    });
  }

  test('on mobile the role opens as a full-screen sheet @mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.goto('/#work-in');
    await page.locator('button.card[data-role="stylist"]').click();
    const panel = page.locator('dialog .role-panel');
    const box = await panel.boundingBox();
    const vp = page.viewportSize()!;
    expect(Math.round(box!.width)).toBe(vp.width);
    expect(box!.x).toBe(0);
  });
});

test.describe('role pages', () => {
  for (const role of roles) {
    test(`/roles/${role.slug} has the same content and the vacancy line`, async ({ page }) => {
      await page.goto(`/roles/${role.slug}`);
      await expect(page.getByRole('heading', { level: 2, name: role.title })).toBeVisible();
      await expect(page.getByText(role.lead)).toBeVisible();
      for (const b of [...role.whatYouWillDo, ...role.whatYouBring]) await expect(page.getByText(b, { exact: true })).toBeVisible();
      await expect(page.getByText(role.howItIsMeasured)).toBeVisible();
      await expect(page.getByText(VACANCY)).toBeVisible();
    });
  }

  test('unknown roles are not found', async ({ request }) => {
    expect((await request.get('/roles/chef')).status()).toBe(404);
  });

  test('every published version is kept and dated', () => {
    for (const [slug, versions] of Object.entries(roleHistory)) {
      expect(versions.length).toBeGreaterThan(0);
      const dates = versions.map((v) => v.publishedOn);
      expect(new Set(dates).size).toBe(dates.length);
      for (const v of versions) {
        expect(v.slug).toBe(slug);
        expect(v.publishedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
