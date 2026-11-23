// Captures the core screens for review: SCREENS=1 npx playwright test e2e/screens.spec.ts
import { test } from '@playwright/test';

const out = (n: string) => `../docs/pilots/screens/afterhours-${n}.png`;

test('screens', async ({ page }) => {
  test.skip(!process.env.SCREENS, 'set SCREENS=1 to capture');
  await page.goto('/');
  await page.getByTestId('intro').waitFor();
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  await page.screenshot({ path: out('1-decks'), fullPage: true });
  await page.getByTestId('deck-first-date').click();
  await page.getByTestId('card').waitFor();
  await page.screenshot({ path: out('2-card') });
  await page.goto('/wheel');
  await page.getByTestId('player-0').fill('Sam');
  await page.getByTestId('player-1').fill('Alex');
  await page.getByTestId('player-add').click();
  await page.getByTestId('player-2').fill('Jo');
  await page.getByTestId('wheel-spin').click();
  await page.getByTestId('wheel-result').waitFor({ timeout: 8000 });
  await page.waitForTimeout(2800);
  await page.screenshot({ path: out('3-wheel') });
});
