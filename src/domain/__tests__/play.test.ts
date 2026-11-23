import content from '../../content/decks.json';
import { canOpen, cardOfTheDay, playersError, quizScore, shuffle, verdict, wheelAngle, wheelPick, type Content, type Deck } from '../play';

const c = content as Content;

test('content pack shape: 9 decks of 40 and 2 quizzes of 8×4', () => {
  expect(c.decks).toHaveLength(9);
  for (const d of c.decks) {
    expect(d.cards).toHaveLength(40);
    expect(new Set(d.cards.map((x) => x.id)).size).toBe(40);
    for (const card of d.cards) expect(card.text.length).toBeLessThanOrEqual(140);
  }
  expect(c.quizzes.every((q) => q.questions.length === 8 && q.questions.every((x) => x.options.length === 4))).toBe(true);
  expect(c.decks.filter((d) => d.free).map((d) => d.id)).toEqual(['first-date', 'couples', 'friends', 'party']);
});

test('shuffle is a seeded permutation', () => {
  const xs = Array.from({ length: 40 }, (_, i) => i);
  const a = shuffle(xs, 42);
  expect(a).toEqual(shuffle(xs, 42));
  expect(a).not.toEqual(xs);
  expect([...a].sort((p, q) => p - q)).toEqual(xs);
});

test('deck access: premium decks and the 18+ deck', () => {
  const free = c.decks.find((d) => d.id === 'couples')!;
  const paid = c.decks.find((d) => d.id === 'deep-talk')!;
  const spicy = c.decks.find((d) => d.id === 'spicy')!;
  expect(canOpen(free, false, false)).toBe('ok');
  expect(canOpen(paid, false, false)).toBe('premium');
  expect(canOpen(paid, true, false)).toBe('ok');
  expect(canOpen(spicy, true, false)).toBe('age');
  expect(canOpen(spicy, true, true)).toBe('ok');
  const custom: Deck = { id: 'x', name: 'Ours', description: '', audience: 'couples', spice: 0, free: false, cards: [], custom: true };
  expect(canOpen(custom, false, false)).toBe('ok');
});

test("tonight's card is stable for a day and never from the spicy deck", () => {
  const a = cardOfTheDay(c.decks, '2026-11-23');
  expect(cardOfTheDay(c.decks, '2026-11-23').card.id).toBe(a.card.id);
  expect(a.deck.free).toBe(true);
  const days = Array.from({ length: 30 }, (_, i) => `2026-12-${String(i + 1).padStart(2, '0')}`);
  expect(new Set(days.map((d) => cardOfTheDay(c.decks, d).card.id)).size).toBeGreaterThan(20);
});

test('quiz scoring and verdicts', () => {
  expect(quizScore({ answersA: [0, 1, 2, 3, 0, 1, 2, 3], answersB: [0, 1, 2, 3, 3, 3, 3, 3] })).toEqual({ matches: 5, total: 8, pct: 63 });
  expect(verdict(100)).toMatch(/one brain/);
  expect(verdict(0)).toMatch(/Opposites/);
});

test('the wheel lands the chosen segment under the pointer', () => {
  const { index, turns } = wheelPick(4, 0.6);
  expect(index).toBe(2);
  const angle = wheelAngle(4, index, turns) % 360; // segment 2 spans 180–270°, centre 225°
  expect((angle + 225) % 360).toBe(0);
  expect(playersError(['Sam', ' '])).toMatch(/two/);
  expect(playersError(['Sam', 'Alex'])).toBeNull();
});
