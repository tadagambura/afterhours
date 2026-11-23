import { persisted, uid } from '@/kit/store';
import type { Plan } from '@/domain/games';

type TogetherState = {
  names: [string, string];
  wins: Record<string, number>; // "game:name" → wins
  plans: Plan[];
  setNames: (n: [string, string]) => void;
  win: (game: string, name: string) => void;
  addPlan: (p: Omit<Plan, 'id' | 'done'>) => void;
  togglePlan: (id: string) => void;
  removePlan: (id: string) => void;
};

export const useTogether = persisted<TogetherState>('afterhours.together', 1, (set) => ({
  names: ['You', 'Them'],
  wins: {},
  plans: [],
  setNames: (names) => set({ names }),
  win: (game, name) => set((s) => ({ wins: { ...s.wins, [`${game}:${name}`]: (s.wins[`${game}:${name}`] ?? 0) + 1 } })),
  addPlan: (p) => set((s) => ({ plans: [...s.plans, { ...p, id: uid('pl'), done: false }] })),
  togglePlan: (id) => set((s) => ({ plans: s.plans.map((p) => (p.id === id ? { ...p, done: !p.done } : p)) })),
  removePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
}));
