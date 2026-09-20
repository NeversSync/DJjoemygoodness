const { test, expect } = require('@playwright/test');

test.describe('selector dial', () => {
  test('navigates to the About section when ABOUT is clicked', async ({
    page,
  }) => {
    await page.goto('/');

    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeVisible();

    const landingDial = page.locator('#home').getByRole('link', {
      name: 'ABOUT',
    });
    await landingDial.click();

    await expect
      .poll(async () => {
        return aboutSection.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top > 0 && rect.top < window.innerHeight;
        });
      })
      .toBe(true);

    await expect(landingDial).toHaveClass(/active-link/);
  });

  test('navigates to Booking from the dial', async ({ page }) => {
    await page.goto('/');

    const bookingSection = page.locator('#booking');
    await page.locator('#home').getByRole('link', { name: 'BOOKING' }).click();

    await expect
      .poll(async () => {
        return bookingSection.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top > 0 && rect.top < window.innerHeight * 0.75;
        });
      })
      .toBe(true);
  });
});

test.describe('press package content', () => {
  test('music section surfaces the label and discography', async ({ page }) => {
    await page.goto('/');
    const music = page.locator('#music');
    await expect(music).toContainText('JoeMyGoodness');
    await expect(music).toContainText('AfterImage');
    await expect(music).toContainText('Dulcet Harmonics');
  });

  test('side projects feature Equilateral Expedition', async ({ page }) => {
    await page.goto('/');
    const sideProjects = page.locator('#side-projects');
    await expect(sideProjects).toContainText('Equilateral');
    await expect(sideProjects).toContainText('Test Automation');
  });
});
