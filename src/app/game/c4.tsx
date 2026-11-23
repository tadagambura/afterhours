import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { useTheme } from '@/kit/theme';
import { Button, Muted, Screen, Strong } from '@/kit/ui';
import { c4Winner, COLS, drop, emptyC4, ROWS } from '@/domain/games';
import { useTogether } from '@/state/together';

const DISC = ['transparent', '#E53935', '#FBC02D'];

export default function FourInARow() {
  const { c, radius } = useTheme();
  const t = useTogether();
  const celebrate = useCelebrate();
  const [board, setBoard] = useState(emptyC4());
  const [turn, setTurn] = useState<1 | 2>(1);
  const res = c4Winner(board);
  const name = (p: 1 | 2) => t.names[p - 1];
  const win = new Set((res.cells ?? []).map(([cc, rr]) => `${cc}:${rr}`));

  const play = (col: number) => {
    if (res.winner || res.draw) return;
    const d = drop(board, col, turn);
    if (!d) return;
    setBoard(d.board);
    const r = c4Winner(d.board);
    if (r.winner) {
      t.win('c4', name(r.winner as 1 | 2));
      track('core_action_completed', { what: 'game_won', game: 'c4' });
      celebrate({ scene: 'win', emoji: '🏆', title: `${name(r.winner as 1 | 2)} wins!`, body: 'Four in a row. Kaos does a little drum roll.' });
    } else setTurn(turn === 1 ? 2 : 1);
  };

  return (
    <Screen edges={[]} testID="c4">
      <Strong testID="c4-status">{res.winner ? `${name(res.winner as 1 | 2)} wins!` : res.draw ? "It's a draw." : `${name(turn)}'s turn (${turn === 1 ? 'red' : 'yellow'})`}</Strong>
      <View style={{ flexDirection: 'row', gap: 4, alignSelf: 'center', backgroundColor: c.primary, padding: 6, borderRadius: radius }}>
        {Array.from({ length: COLS }, (_, col) => (
          <Pressable key={col} accessibilityRole="button" accessibilityLabel={`Drop in column ${col + 1}`} onPress={() => play(col)} testID={`c4-col-${col}`} style={{ gap: 4 }}>
            {Array.from({ length: ROWS }, (_, i) => {
              const row = ROWS - 1 - i;
              const v = board[col][row];
              return <View key={row} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: v ? DISC[v] : c.bg, borderWidth: win.has(`${col}:${row}`) ? 3 : 0, borderColor: '#FFFFFF' }} />;
            })}
          </Pressable>
        ))}
      </View>
      {res.winner || res.draw ? <Button title="Play again" onPress={() => { setBoard(emptyC4()); setTurn(res.winner === 1 ? 2 : 1); }} testID="c4-again" /> : null}
      <Muted center>{`${t.names[0]} ${t.wins[`c4:${t.names[0]}`] ?? 0} – ${t.wins[`c4:${t.names[1]}`] ?? 0} ${t.names[1]}`}</Muted>
    </Screen>
  );
}
