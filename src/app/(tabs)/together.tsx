import { router } from 'expo-router';
import { useState } from 'react';
import { addDays, formatDay, relativeDay, todayKey } from '@/kit/dates';
import { DateStepper } from '@/kit/inputs';
import { Button, Card, Chip, Field, H1, IconButton, Muted, Note, Row, Screen, Section, Sheet, Stack, Strong } from '@/kit/ui';
import { timeError, upcoming } from '@/domain/games';
import { useTogether } from '@/state/together';

const GAMES = [
  { id: 'ttt', name: 'Tic-tac-toe', emoji: '❌⭕' },
  { id: 'c4', name: 'Four in a row', emoji: '🔴🟡' },
];

export default function Together() {
  const t = useTogether();
  const today = todayKey();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(addDays(today, 1));
  const [time, setTime] = useState('');
  const [who, setWho] = useState<'both' | 'a' | 'b'>('both');
  const next = upcoming(t.plans, today);
  const [a, b] = t.names;

  return (
    <Screen testID="together">
      <H1>Together</H1>
      <Row gap={8}>
        <Stack style={{ flex: 1 }}><Field label="Player 1" value={a} onChangeText={(x) => t.setNames([x, b])} maxLength={14} testID="name-a" /></Stack>
        <Stack style={{ flex: 1 }}><Field label="Player 2" value={b} onChangeText={(x) => t.setNames([a, x])} maxLength={14} testID="name-b" /></Stack>
      </Row>
      <Section title="Games (pass the phone)">
        {GAMES.map((g) => (
          <Card key={g.id} onPress={() => router.push(`/game/${g.id}`)} testID={`game-${g.id}`}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Strong>{`${g.emoji}  ${g.name}`}</Strong>
              <Muted testID={`tally-${g.id}`}>{`${a} ${t.wins[`${g.id}:${a}`] ?? 0} – ${t.wins[`${g.id}:${b}`] ?? 0} ${b}`}</Muted>
            </Row>
          </Card>
        ))}
        <Muted>Playing on two phones, plus chess, Go Fish, the Kaos couple challenge and more, arrives with accounts.</Muted>
      </Section>
      <Section title="Our calendar" right={<Button small title="Add" icon="add" onPress={() => setAdding(true)} testID="plan-add" />}>
        {next.length === 0 ? <Muted>Nothing planned. Date night, anyone?</Muted> : null}
        {next.map((p) => (
          <Card key={p.id} testID={`plan-${p.title}`}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Stack gap={2} style={{ flex: 1 }}>
                <Strong>{p.title}</Strong>
                <Muted>{`${formatDay(p.day)}${p.time ? ` · ${p.time}` : ''} · ${relativeDay(p.day, today)} · ${p.who === 'both' ? 'both of us' : p.who === 'a' ? a : b}`}</Muted>
              </Stack>
              <IconButton icon="checkmark-done-outline" label={`Done: ${p.title}`} onPress={() => t.togglePlan(p.id)} />
              <IconButton icon="trash-outline" label={`Delete ${p.title}`} onPress={() => t.removePlan(p.id)} />
            </Row>
          </Card>
        ))}
        <Muted>Saved on this phone. Sharing it with your partner's phone comes with accounts.</Muted>
      </Section>
      <Sheet visible={adding} onClose={() => setAdding(false)} title="Add a plan">
        <Stack>
          <Field label="What" value={title} onChangeText={setTitle} placeholder="e.g. Date night: tapas" maxLength={40} testID="plan-title" />
          <DateStepper label="When" value={day} onChange={setDay} min={today} testID="plan-day" />
          <Field label="Time (optional)" value={time} onChangeText={setTime} placeholder="19:30" maxLength={5} testID="plan-time" error={timeError(time)} />
          <Row wrap gap={8}>
            {(['both', 'a', 'b'] as const).map((w) => (
              <Chip key={w} label={w === 'both' ? 'Both of us' : w === 'a' ? a : b} selected={who === w} onPress={() => setWho(w)} />
            ))}
          </Row>
          {timeError(time) ? <Note tone="warning">{timeError(time)}</Note> : null}
          <Button
            title="Add to our calendar"
            disabled={!title.trim() || !!timeError(time)}
            testID="plan-save"
            onPress={() => {
              t.addPlan({ title: title.trim(), day, time: time.trim() || null, who });
              setTitle('');
              setTime('');
              setAdding(false);
            }}
          />
        </Stack>
      </Sheet>
    </Screen>
  );
}
