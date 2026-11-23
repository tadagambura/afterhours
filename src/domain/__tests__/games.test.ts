import { c4Winner, drop, emptyC4, timeError, tttMove, tttWinner, upcoming, type Mark, type Plan } from '../games';

test('tic-tac-toe: wins, draws and illegal moves', () => {
  const b: Mark[] = ['X', 'X', null, 'O', 'O', null, null, null, null];
  expect(tttWinner(b).winner).toBeNull();
  const won = tttMove(b, 2, 'X')!;
  expect(tttWinner(won)).toEqual({ winner: 'X', line: [0, 1, 2], draw: false });
  expect(tttMove(won, 5, 'O')).toBeNull(); // game over
  expect(tttMove(b, 0, 'O')).toBeNull(); // taken
  const draw: Mark[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  expect(tttWinner(draw)).toEqual({ winner: null, line: null, draw: true });
});

test('four in a row: gravity, full columns, all four directions', () => {
  let b = emptyC4();
  for (let i = 0; i < 6; i++) b = drop(b, 0, 1)!.board;
  expect(drop(b, 0, 2)).toBeNull();
  let h = emptyC4();
  for (const c of [0, 1, 2, 3]) h = drop(h, c, 2)!.board;
  expect(c4Winner(h).winner).toBe(2);
  // diagonal up-right
  let d = emptyC4();
  const moves: [number, 1 | 2][] = [[0, 1], [1, 2], [1, 1], [2, 2], [2, 2], [2, 1], [3, 2], [3, 2], [3, 2], [3, 1]];
  for (const [c, p] of moves) d = drop(d, c, p)!.board;
  expect(c4Winner(d).winner).toBe(1);
  expect(c4Winner(emptyC4())).toEqual({ winner: 0, cells: null, draw: false });
});

test('calendar: upcoming plans in date and time order; times validated', () => {
  const p = (id: string, day: string, time: string | null, done = false): Plan => ({ id, title: id, day, time, who: 'both', done });
  expect(upcoming([p('b', '2026-12-01', '19:00'), p('a', '2026-12-01', '12:00'), p('old', '2026-11-01', null), p('d', '2026-12-02', null, true)], '2026-11-23').map((x) => x.id)).toEqual(['a', 'b']);
  expect(timeError('7pm')).toMatch(/19:30/);
  expect(timeError('19:30')).toBeNull();
  expect(timeError('')).toBeNull();
});
