import { todayKey } from '@/kit/dates';
import { persisted, uid } from '@/kit/store';
import type { Card, Deck, QuizRun } from '@/domain/play';
import raw from '@/content/decks.json';
import type { Content } from '@/domain/play';

export const content = raw as Content;

type PlayState = {
  favourites: string[];
  adult: boolean;
  progress: Record<string, number>; // deck → furthest card index reached
  completed: string[]; // deck ids finished at least once
  custom: Deck[];
  quizRuns: QuizRun[];
  players: string[];
  toggleFavourite: (cardId: string) => void;
  confirmAdult: () => void;
  reach: (deckId: string, index: number, total: number) => boolean; // true when the deck was just completed
  addCustom: (name: string, cards: string[]) => string;
  removeCustom: (id: string) => void;
  saveQuiz: (r: Omit<QuizRun, 'day'>) => void;
  setPlayers: (p: string[]) => void;
};

export const usePlay = persisted<PlayState>('afterhours.play', 1, (set, get) => ({
  favourites: [],
  adult: false,
  progress: {},
  completed: [],
  custom: [],
  quizRuns: [],
  players: ['', ''],
  toggleFavourite: (id) => set((s) => ({ favourites: s.favourites.includes(id) ? s.favourites.filter((x) => x !== id) : [...s.favourites, id] })),
  confirmAdult: () => set({ adult: true }),
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

export function favouritesDeck(ids: string[], custom: Deck[]): Deck {
  const cards = allDecks(custom).flatMap((d) => d.cards).filter((c) => ids.includes(c.id));
  return { id: 'favourites', name: 'Favourites', description: 'Cards you hearted', audience: 'anyone', spice: 0, free: true, custom: true, cards };
}
