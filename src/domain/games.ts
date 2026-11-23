// AfterHours mini games: pure rules, so they're easy to test and reuse when online play arrives.

export type Mark = 'X' | 'O' | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function tttWinner(b: Mark[]): { winner: Mark; line: number[] | null; draw: boolean } {
  for (const l of LINES) {
    const [a, c, d] = l;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line: l, draw: false };
  }
  return { winner: null, line: null, draw: b.every(Boolean) };
}

export function tttMove(b: Mark[], i: number, m: 'X' | 'O'): Mark[] | null {
  if (b[i] || tttWinner(b).winner || i < 0 || i > 8) return null;
  const n = [...b];
  n[i] = m;
  return n;
}

// ---------- Four in a row (7 columns × 6 rows), board[col][row], row 0 = bottom ----------
export const COLS = 7;
export const ROWS = 6;
export type Disc = 1 | 2 | 0;
export type C4 = Disc[][];

export const emptyC4 = (): C4 => Array.from({ length: COLS }, () => Array<Disc>(ROWS).fill(0));

export function drop(b: C4, col: number, p: 1 | 2): { board: C4; row: number } | null {
  if (col < 0 || col >= COLS) return null;
  const row = b[col].indexOf(0);
  if (row < 0) return null;
  const board = b.map((c) => [...c]);
  board[col][row] = p;
  return { board, row };
}

export function c4Winner(b: C4): { winner: Disc; cells: [number, number][] | null; draw: boolean } {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++) {
      const p = b[c][r];
      if (!p) continue;
      for (const [dc, dr] of dirs) {
        const cells: [number, number][] = [[c, r]];
        for (let k = 1; k < 4; k++) {
          const cc = c + dc * k;
          const rr = r + dr * k;
          if (cc < 0 || cc >= COLS || rr < 0 || rr >= ROWS || b[cc][rr] !== p) break;
          cells.push([cc, rr]);
        }
        if (cells.length === 4) return { winner: p, cells, draw: false };
      }
    }
  return { winner: 0, cells: null, draw: b.every((col) => col.every(Boolean)) };
}

// ---------- Shared calendar ----------
export type Plan = { id: string; title: string; day: string; time: string | null; who: 'both' | 'a' | 'b'; done: boolean };

export function upcoming(plans: Plan[], today: string): Plan[] {
  return plans.filter((p) => p.day >= today && !p.done).sort((a, b) => (a.day + (a.time ?? '')).localeCompare(b.day + (b.time ?? '')));
}

export function timeError(t: string): string | null {
  if (!t.trim()) return null;
  return /^([01]?\d|2[0-3]):[0-5]\d$/.test(t.trim()) ? null : 'Times look like 19:30.';
}
