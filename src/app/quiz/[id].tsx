import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { shareText } from '@/kit/share';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, Display, EmptyState, Field, H2, Muted, ProgressBar, Row, Screen, Stack, Strong } from '@/kit/ui';
import { quizScore, verdict } from '@/domain/play';
import { content, usePlay } from '@/state/play';

type Phase = 'names' | 'a' | 'pass' | 'b' | 'reveal';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quiz = content.quizzes.find((q) => q.id === id);
  const { c, radius } = useTheme();
  const celebrate = useCelebrate();
  const [phase, setPhase] = useState<Phase>('names');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [answersA, setAnswersA] = useState<number[]>([]);
  const [answersB, setAnswersB] = useState<number[]>([]);

  if (!quiz) return <Screen edges={[]}><EmptyState title="Quiz not found" action={<Button title="Back" onPress={() => router.back()} />} /></Screen>;

  const answering = phase === 'a' ? answersA : answersB;
  const who = phase === 'a' ? a : b;
  const q = quiz.questions[answering.length];
  const score = quizScore({ answersA, answersB });

  const pick = (opt: number) => {
    if (phase === 'a') {
      const next = [...answersA, opt];
      setAnswersA(next);
      if (next.length === quiz.questions.length) setPhase('pass');
    } else {
      const next = [...answersB, opt];
      setAnswersB(next);
      if (next.length === quiz.questions.length) {
        const s = quizScore({ answersA, answersB: next });
        usePlay.getState().saveQuiz({ quizId: quiz.id, a, b, answersA, answersB: next });
        track('value_delivered', { what: 'quiz_result', pct: s.pct });
        setPhase('reveal');
        if (s.pct >= 63) celebrate({ scene: 'quiz', emoji: '💞', title: `${s.matches} of ${s.total}!`, body: verdict(s.pct) });
      }
    }
  };

  return (
    <Screen edges={[]} testID="quiz">
      <RouterStack.Screen options={{ title: quiz.name }} />
      {phase === 'names' ? (
        <Stack>
          <Body>{quiz.description}</Body>
          <Field label="First player" value={a} onChangeText={setA} maxLength={20} testID="quiz-a" />
          <Field label="Second player" value={b} onChangeText={setB} maxLength={20} testID="quiz-b" />
          <Button title={`${a.trim() || 'First player'} goes first`} disabled={!a.trim() || !b.trim()} onPress={() => setPhase('a')} testID="quiz-start" />
          <Muted>First names or nicknames are fine. Nothing leaves this phone.</Muted>
        </Stack>
      ) : null}

      {(phase === 'a' || phase === 'b') && q ? (
        <Stack>
          <Row style={{ justifyContent: 'space-between' }}>
            <Strong>{`${who}'s turn`}</Strong>
            <Muted testID="quiz-progress">{`${answering.length + 1} of ${quiz.questions.length}`}</Muted>
          </Row>
          <ProgressBar value={answering.length / quiz.questions.length} label="Quiz progress" />
          <H2>{q.q}</H2>
          {q.options.map((o, i) => (
            <Pressable key={i} accessibilityRole="button" accessibilityLabel={o} onPress={() => pick(i)} testID={`opt-${i}`} style={({ pressed }) => ({ padding: 16, minHeight: 52, borderRadius: radius, borderWidth: 1.5, borderColor: c.border, backgroundColor: pressed ? c.surfaceAlt : c.surface })}>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>{o}</Text>
            </Pressable>
          ))}
          <Muted>No peeking. Answers stay hidden until the reveal.</Muted>
        </Stack>
      ) : null}

      {phase === 'pass' ? (
        <Card tone="alt">
          <Display center>🤫</Display>
          <H2>{`Pass the phone to ${b}`}</H2>
          <Body>{`${a}'s answers are locked in and hidden.`}</Body>
          <Button title={`I'm ${b}, let's go`} onPress={() => setPhase('b')} testID="quiz-pass" />
        </Card>
      ) : null}

      {phase === 'reveal' ? (
        <Stack>
          <Muted center>THE REVEAL</Muted>
          <Display center testID="quiz-score">{`${score.matches} of ${score.total}`}</Display>
          <H2>{verdict(score.pct)}</H2>
          {quiz.questions.map((qq, i) => {
            const same = answersA[i] === answersB[i];
            return (
              <Card key={qq.id} tone={same ? 'alt' : undefined}>
                <Strong>{`${same ? '💞' : '🤔'} ${qq.q}`}</Strong>
                <Muted>{`${a}: ${qq.options[answersA[i]]}`}</Muted>
                <Muted>{`${b}: ${qq.options[answersB[i]]}`}</Muted>
              </Card>
            );
          })}
          <Button title="Share our score" icon="share-outline" onPress={() => shareText(`We matched ${score.matches} of ${score.total} on "${quiz.name}" in AfterHours. ${verdict(score.pct)}`, 'quiz')} />
          <Button title="Play again" variant="secondary" onPress={() => { setAnswersA([]); setAnswersB([]); setPhase('a'); }} />
        </Stack>
      ) : null}
    </Screen>
  );
}
