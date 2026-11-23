// AfterHours: decks, shuffles, quizzes and the wheel. Pure functions, no randomness hidden inside.

export type Card = { id: string; text: string; kind: 'question' | 'wyr' | 'finish' };
export type Deck = { id: string; name: string; description: string; audience: string; spice: 0 | 1 | 2; free: boolean; cards: Card[]; custom?: boolean };
export type QuizQuestion = { id: string; q: string; options: string[] };
export type Quiz = { id: string; name: string; description: string; questions: QuizQuestion[] };
export type Content = { version: number; reviewed: boolean; decks: Deck[]; quizzes: Quiz[] };

/** Small seeded PRNG (mulberry32) so a shuffle can be replayed and tested. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], seed: number): T[] {
  const r = rng(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const kindLabel = (k: Card['kind']) => (k === 'wyr' ? 'Would you rather' : k === 'finish' ? 'Finish the sentence' : 'Question');

/**
 * Decks a person can open right now. Explicit (spice 2) decks need Premium AND a passed 18+
 * check (`adultOk` comes from the kit's useAdultAccess). Flirty decks (spice 1) are free.
 */
export function canOpen(d: Deck, premium: boolean, adultOk: boolean): 'ok' | 'premium' | 'age' {
  if (!d.free && !premium && !d.custom) return 'premium';
  if (d.spice === 2 && !adultOk) return 'age';
  return 'ok';
}

/** "Tonight's card": one card from the free decks, the same all day, different tomorrow. */
export function cardOfTheDay(decks: Deck[], day: string): { deck: Deck; card: Card } {
  const free = decks.filter((d) => d.free && d.spice < 2);
  const all = free.flatMap((deck) => deck.cards.map((card) => ({ deck, card })));
  const seed = [...day].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return all[Math.floor(rng(seed)() * all.length)];
}

// ---------- Quizzes: answer privately, then compare ----------

export type QuizRun = { quizId: string; a: string; b: string; answersA: number[]; answersB: number[]; day: string };

export function quizScore(run: Pick<QuizRun, 'answersA' | 'answersB'>) {
  const n = Math.min(run.answersA.length, run.answersB.length);
  let matches = 0;
  for (let i = 0; i < n; i++) if (run.answersA[i] === run.answersB[i]) matches++;
  return { matches, total: n, pct: n ? Math.round((matches / n) * 100) : 0 };
}

export function verdict(pct: number): string {
  if (pct >= 88) return 'Basically one brain. Spooky.';
  if (pct >= 63) return 'Very in sync. A few surprises to talk about.';
  if (pct >= 38) return 'Half the same, half a mystery. Good chats ahead.';
  return 'Opposites attract? Lots to learn about each other.';
}

// ---------- The wheel ----------

export function wheelPick(n: number, r: number): { index: number; turns: number } {
  const index = Math.floor(r * n) % n;
  return { index, turns: 4 + Math.floor(r * 3) };
}

/** Degrees the wheel must rotate so the chosen segment ends under the pointer at the top. */
export function wheelAngle(n: number, index: number, turns: number): number {
  const seg = 360 / n;
  return turns * 360 + (360 - (index * seg + seg / 2));
}

export function playersError(names: string[]): string | null {
  const clean = names.map((x) => x.trim()).filter(Boolean);
  if (clean.length < 2) return 'Add at least two names.';
  if (clean.length > 8) return 'Up to 8 names fit on the wheel.';
  return null;
}
