import { useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { useTheme } from '@/kit/theme';
import { Button, Field, H1, IconButton, Muted, Note, Row, Screen, Section, Segmented, Stack, Strong } from '@/kit/ui';
import { playersError, wheelAngle, wheelPick } from '@/domain/play';
import { content, usePlay } from '@/state/play';

const SIZE = 280;
const R = SIZE / 2;

function wedge(i: number, n: number) {
  const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
  const p = (a: number) => `${R + R * Math.cos(a)} ${R + R * Math.sin(a)}`;
  return `M ${R} ${R} L ${p(a0)} A ${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z`;
}

export default function Wheel() {
  const { c, font } = useTheme();
  const play = usePlay();
  const celebrate = useCelebrate();
  const [mode, setMode] = useState<'names' | 'decks'>('names');
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;
  const total = useRef(0);

  const names = play.players;
  const labels = mode === 'names' ? names.map((x) => x.trim()).filter(Boolean) : content.decks.filter((d) => d.free).map((d) => d.name);
  const err = mode === 'names' ? playersError(names) : null;
  // Fixed wheel colours (the same in light and dark mode) with a readable label colour for each.
  const colours = ['#7A2E6B', '#FF9F1C', '#F3E4EC', '#8FB3FF', '#6FD6A8', '#F48FB1', '#B39DDB', '#FFD180'];
  const ink = (i: number) => (i % colours.length === 0 ? '#FFFFFF' : '#22101E');

  const go = () => {
    if (err || spinning) return;
    const r = Math.random();
    const { index, turns } = wheelPick(labels.length, r);
    const target = wheelAngle(labels.length, index, turns);
    const from = total.current % 360;
    total.current = total.current - from + target + 360;
    setResult(null);
    setSpinning(true);
    Animated.timing(spin, { toValue: total.current, duration: 2600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      setSpinning(false);
      setResult(labels[index]);
      track('core_action_completed', { what: 'wheel_spin', mode, slices: labels.length });
      celebrate({ scene: 'wheel', emoji: '🎡', title: 'THE WHEEL HAS SPOKEN', body: labels[index] });
    });
  };

  const rotate = spin.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'], extrapolate: 'extend' });

  return (
    <Screen testID="wheel">
      <H1>The wheel</H1>
      <Segmented label="Spin for" options={[{ value: 'names', label: 'Who goes first' }, { value: 'decks', label: 'Which deck' }]} value={mode} onChange={(m) => { setMode(m); setResult(null); }} />
      <View style={{ alignItems: 'center', paddingVertical: 8 }}>
        <Text style={{ fontSize: 28, marginBottom: -10, zIndex: 2 }} accessibilityElementsHidden>🔻</Text>
        <Animated.View style={{ transform: [{ rotate }] }} accessible accessibilityLabel={`Wheel with ${labels.length} slices`}>
          <Svg width={SIZE} height={SIZE}>
            <G>
              {labels.length >= 2
                ? labels.map((l, i) => {
                    const mid = ((i + 0.5) / labels.length) * 2 * Math.PI - Math.PI / 2;
                    const tx = R + R * 0.6 * Math.cos(mid);
                    const ty = R + R * 0.6 * Math.sin(mid);
                    return (
                      <G key={i}>
                        <Path d={wedge(i, labels.length)} fill={colours[i % colours.length]} stroke={c.bg} strokeWidth={2} />
                        <SvgText x={tx} y={ty} fill={ink(i)} fontSize={15} fontWeight="700" textAnchor="middle" alignmentBaseline="middle" rotation={(mid * 180) / Math.PI} origin={`${tx}, ${ty}`}>
                          {l.length > 12 ? l.slice(0, 11) + '…' : l}
                        </SvgText>
                      </G>
                    );
                  })
                : null}
            </G>
          </Svg>
        </Animated.View>
      </View>
      {result ? (
        <Stack gap={2}>
          <Muted center>THE WHEEL HAS SPOKEN</Muted>
          <Text testID="wheel-result" style={{ fontFamily: font.display, fontSize: 30, color: c.primary, textAlign: 'center' }}>{result}</Text>
        </Stack>
      ) : null}
      <Button title={spinning ? 'Spinning…' : 'Spin!'} onPress={go} disabled={!!err || spinning} testID="wheel-spin" />
      {err ? <Note>{err}</Note> : null}

      {mode === 'names' ? (
        <Section title="Players">
          {names.map((n, i) => (
            <Row key={i} gap={6}>
              <View style={{ flex: 1 }}>
                <Field label={`Player ${i + 1}`} value={n} onChangeText={(t) => play.setPlayers(names.map((x, j) => (j === i ? t : x)))} maxLength={20} testID={`player-${i}`} />
              </View>
              {names.length > 2 ? <IconButton icon="close" label={`Remove player ${i + 1}`} onPress={() => play.setPlayers(names.filter((_, j) => j !== i))} /> : null}
            </Row>
          ))}
          {names.length < 8 ? <Button small variant="ghost" title="Add a player" icon="add" onPress={() => play.setPlayers([...names, ''])} testID="player-add" /> : null}
        </Section>
      ) : (
        <Strong center>Spinning between the free decks.</Strong>
      )}
    </Screen>
  );
}
