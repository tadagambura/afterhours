import { todayKey } from '@/kit/dates';
import { persisted, uid } from '@/kit/store';
import type { Card, Deck, QuizRun } from '@/domain/play';
import raw from '@/content/decks.json';
import type { Content } from '@/domain/play';

export const content = raw as Content;

type PlayState = {
  favourites: string[];
  /** @deprecated: the 18+ check now lives in the kit (useAdultAccess). Kept so old saves load. */
  adult: boolean;
  /** Hide the 18+ decks from the deck list (discreet mode). */
  hideAdult: boolean;
  setHideAdult: (v: boolean) => void;
  progress: Record<string, number>; // deck → furthest card index reached
  completed: string[]; // deck ids finished at least once
  custom: Deck[];
  quizRuns: QuizRun[];
  players: string[];
  toggleFavourite: (cardId: string) => void;
  reach: (deckId: string, index: number, total: number) => boolean; // true when the deck was just completed
  addCustom: (name: string, cards: string[]) => string;
  removeCustom: (id: string) => void;
  saveQuiz: (r: Omit<QuizRun, 'day'>) => void;
  setPlayers: (p: string[]) => void;
};

export const usePlay = persisted<PlayState>('afterhours.play', 1, (set, get) => ({
  favourites: [],
  adult: false,
  hideAdult: false,
  setHideAdult: (hideAdult) => set({ hideAdult }),
  progress: {},
  completed: [],
  custom: [],
  quizRuns: [],
  players: ['', ''],
  toggleFavourite: (id) => set((s) => ({ favourites: s.favourites.includes(id) ? s.favourites.filter((x) => x !== id) : [...s.favourites, id] })),
  reach: (deckId, index, total) => {
    const s = get();
    const furthest = Math.max(s.progress[deckId] ?? 0, index);
    const justDone = index === total - 1 && !s.completed.includes(deckId);
    set({ progress: { ...s.progress, [deckId]: furthest }, completed: justDone ? [...s.completed, deckId] : s.completed });
    return justDone;
  },
  addCustom: (name, texts) => {
    const id = uid('d');
    const cards: Card[] = texts.map((text, i) => ({ id: `${id}-${i}`, text, kind: 'question' }));
    set((s) => ({ custom: [...s.custom, { id, name, description: 'Your own deck', audience: 'anyone', spice: 0, free: false, custom: true, cards }] }));
    return id;
  },
  removeCustom: (id) => set((s) => ({ custom: s.custom.filter((d) => d.id !== id) })),
  saveQuiz: (r) => set((s) => ({ quizRuns: [{ ...r, day: todayKey() }, ...s.quizRuns].slice(0, 50) })),
  setPlayers: (players) => set({ players }),
}));

export function allDecks(custom: Deck[]): Deck[] {
  return [...content.decks, ...custom];
}

/** Hearted cards. Cards from 18+ decks only appear when the person may open them right now. */
export function favouritesDeck(ids: string[], custom: Deck[], adultOk = false): Deck {
  const cards = allDecks(custom)
    .filter((d) => d.spice < 2 || adultOk)
    .flatMap((d) => d.cards)
    .filter((c) => ids.includes(c.id));
  return { id: 'favourites', name: 'Favourites', description: 'Cards you hearted', audience: 'anyone', spice: 0, free: true, custom: true, cards };
}
