import { expect, test, type Page } from '@playwright/test';

async function finishIntro(page: Page) {
  await expect(page.getByTestId('intro')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  await expect(page.getByTestId('decks')).toBeVisible();
}

test('first open → free deck → next cards → favourite → persists', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await finishIntro(page);
  await expect(page.getByTestId('tonight')).toBeVisible();
  await page.getByTestId('deck-couples').click();
  await expect(page.getByTestId('play-count')).toHaveText('1 of 40');
  const first = await page.getByTestId('card-text').textContent();
  await page.getByTestId('card-next').click();
  await expect(page.getByTestId('play-count')).toHaveText('2 of 40');
  await expect(page.getByTestId('card-text')).not.toHaveText(first ?? '');
  await page.getByTestId('card-fav').click();
  const fav = await page.getByTestId('card-text').textContent();

  await page.goto('/');
  await page.getByTestId('deck-favourites').click();
  await expect(page.getByTestId('play-count')).toHaveText('1 of 1');
  await expect(page.getByTestId('card-text')).toHaveText(fav ?? '');
  await page.reload();
  await expect(page.getByTestId('card-text')).toHaveText(fav ?? '');
  expect(errors).toEqual([]);
});

test('premium decks open the paywall; the spicy deck asks for 18+ once premium', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('deck-deep-talk').click();
  await expect(page.getByTestId('paywall')).toBeVisible();
  await expect(page.getByText(/Test mode: no real purchase|Premium is coming soon/)).toBeVisible();
});

test('wheel: two names, spin, and the wheel has spoken', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.goto('/wheel');
  await expect(page.getByTestId('wheel-spin')).toBeDisabled();
  await page.getByTestId('player-0').fill('Sam');
  await page.getByTestId('player-1').fill('Alex');
  await page.getByTestId('wheel-spin').click();
  await expect(page.getByTestId('wheel-result')).toHaveText(/^(Sam|Alex)$/, { timeout: 8000 });
  await page.reload();
  await expect(page.getByTestId('player-0')).toHaveValue('Sam');
});

test('quiz: both answer privately, then the reveal scores matches', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.goto('/quizzes');
  await page.getByTestId('quiz-in-sync').click();
  await page.getByTestId('quiz-a').fill('Sam');
  await page.getByTestId('quiz-b').fill('Alex');
  await page.getByTestId('quiz-start').click();
  for (let i = 0; i < 8; i++) await page.getByTestId(`opt-${i % 4}`).click();
  await page.getByTestId('quiz-pass').click();
  for (let i = 0; i < 8; i++) await page.getByTestId(`opt-${i < 6 ? i % 4 : 3 - (i % 4)}`).click();
  await expect(page.getByTestId('quiz-score')).toHaveText('6 of 8');
  await page.goto('/quizzes');
  await expect(page.getByText('6/8')).toBeVisible();
});

test('custom deck: create, play, and it persists', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('custom-new').click();
  await page.getByTestId('deck-name').fill('Anniversary');
  for (const q of ['Best trip together?', 'Song that is ours?', 'Where next year?']) {
    await page.getByTestId('card-input').fill(q);
    await page.getByTestId('card-add').click();
  }
  await page.getByTestId('deck-save').click();
  await expect(page.getByTestId('play-count')).toHaveText('1 of 3');
  await page.goto('/');
  await expect(page.getByTestId('deck-Anniversary')).toContainText('Anniversary (3)');
});

test('Together: tic-tac-toe and four in a row on one phone, wins tallied; calendar plans persist', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByRole('tab', { name: /Together/ }).click();
  await page.getByTestId('name-a').fill('Sam');
  await page.getByTestId('name-b').fill('Alex');
  await page.getByTestId('game-ttt').click();
  for (const i of [0, 3, 1, 4, 2]) await page.getByTestId(`ttt-${i}`).click();
  await expect(page.getByTestId('ttt-status')).toHaveText('Sam wins!');
  await page.goBack();
  await page.getByTestId('game-c4').click();
  for (const col of [0, 1, 0, 1, 0, 1, 0]) await page.getByTestId(`c4-col-${col}`).click();
  await expect(page.getByTestId('c4-status')).toHaveText('Sam wins!');
  await page.goBack();
  await expect(page.getByTestId('tally-ttt')).toHaveText('Sam 1 – 0 Alex');
  await expect(page.getByTestId('tally-c4')).toHaveText('Sam 1 – 0 Alex');
  await page.getByTestId('plan-add').click();
  await page.getByTestId('plan-title').fill('Date night: tapas');
  await page.getByTestId('plan-time').fill('7pm');
  await expect(page.getByTestId('plan-save')).toBeDisabled();
  await page.getByTestId('plan-time').fill('19:30');
  await page.getByTestId('plan-save').click();
  await page.reload();
  await page.getByRole('tab', { name: /Together/ }).click();
  await expect(page.getByTestId('plan-Date night: tapas')).toContainText('19:30');
});

test('learning cards: 20 free, sourced, readable, the 21st is Premium', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByRole('tab', { name: /Quizzes/ }).click();
  await expect(page.getByTestId('cards-progress')).toContainText('0 of 30 cards read · 20 free');
  await page.getByTestId('card-c01').click();
  await expect(page.getByTestId('card-sheet')).toContainText('Source:');
  const quiz = page.getByTestId('card-quiz-0');
  if (await quiz.count()) await quiz.click();
  else await page.getByTestId('card-done').click();
  await page.getByTestId('sheet-close').click();
  await expect(page.getByTestId('cards-progress')).toContainText('1 of 30');
  await page.getByTestId('card-c21').click();
  await expect(page.getByTestId('paywall')).toBeVisible();
});
