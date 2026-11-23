import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { useTheme } from '@/kit/theme';
import { Button, Muted, Screen, Strong } from '@/kit/ui';
import { tttMove, tttWinner, type Mark } from '@/domain/games';
import { useTogether } from '@/state/together';

export default function TicTacToe() {
  const { c, radius, font } = useTheme();
  const t = useTogether();
  const celebrate = useCelebrate();
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [starter, setStarter] = useState<'X' | 'O'>('X');
  const res = tttWinner(board);
  const name = (m: 'X' | 'O') => (m === 'X' ? t.names[0] : t.names[1]);

  const play = (i: number) => {
    const next = tttMove(board, i, turn);
    if (!next) return;
    setBoard(next);
    const r = tttWinner(next);
    if (r.winner) {
      t.win('ttt', name(r.winner as 'X' | 'O'));
      track('core_action_completed', { what: 'game_won', game: 'ttt' });
      celebrate({ scene: 'win', emoji: '🏆', title: `${name(r.winner as 'X' | 'O')} wins!`, body: 'Kaos hands over a tiny trophy.' });
    } else setTurn(turn === 'X' ? 'O' : 'X');
  };
  const again = () => {
    const s = starter === 'X' ? 'O' : 'X'; // loser-friendly: alternate who starts
    setStarter(s);
    setTurn(s);
    setBoard(Array(9).fill(null));
  };

  return (
    <Screen edges={[]} testID="ttt">
      <Strong testID="ttt-status">{res.winner ? `${name(res.winner as 'X' | 'O')} wins!` : res.draw ? "It's a draw." : `${name(turn)}'s turn (${turn})`}</Strong>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 300, alignSelf: 'center', gap: 6 }} accessibilityRole="grid">
        {board.map((m, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`Square ${i + 1}${m ? `, ${m}` : ', empty'}`}
            onPress={() => play(i)}
            testID={`ttt-${i}`}
            style={{ width: 96, height: 96, borderRadius: radius, alignItems: 'center', justifyContent: 'center', backgroundColor: res.line?.includes(i) ? c.accent : c.surface, borderWidth: 2, borderColor: c.border }}
          >
            <Text style={{ fontFamily: font.display, fontSize: 48, color: m === 'X' ? c.primary : c.text }}>{m ?? ''}</Text>
          </Pressable>
        ))}
      </View>
      {res.winner || res.draw ? <Button title="Play again" onPress={again} testID="ttt-again" /> : null}
      <Muted center>{`${t.names[0]} ${t.wins[`ttt:${t.names[0]}`] ?? 0} – ${t.wins[`ttt:${t.names[1]}`] ?? 0} ${t.names[1]}`}</Muted>
    </Screen>
  );
}
