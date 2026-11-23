import { router } from 'expo-router';
import { CardLibrary, type CardPack } from '@/kit/cards';
import cardsRaw from '@/content/cards.json';
import { formatDay } from '@/kit/dates';
import { Card, H1, Muted, Row, Screen, Section, Stack, Strong } from '@/kit/ui';
import { quizScore } from '@/domain/play';
import { content, usePlay } from '@/state/play';

export default function Quizzes() {
  const runs = usePlay((s) => s.quizRuns);
  return (
    <Screen testID="quizzes">
      <H1>Quizzes</H1>
      <Muted>Both of you answer privately on this phone. Then reveal how many answers match.</Muted>
      {content.quizzes.map((q) => (
        <Card key={q.id} onPress={() => router.push(`/quiz/${q.id}`)} testID={`quiz-${q.id}`} accessibilityLabel={`${q.name}. ${q.description}`}>
          <Strong>{q.name}</Strong>
          <Muted>{q.description}</Muted>
        </Card>
      ))}
      <Section title="Being a better partner">
        <Muted>Short cards on connection. Inspired by The School of Life and relationship research, in our own words.</Muted>
        <CardLibrary pack={cardsRaw as CardPack} app="afterhours" />
      </Section>
      {runs.length ? (
        <Section title="Past results">
          <Stack gap={6}>
            {runs.slice(0, 10).map((r, i) => {
              const s = quizScore(r);
              return (
                <Row key={i} style={{ justifyContent: 'space-between' }}>
                  <Muted>{`${r.a} & ${r.b} · ${content.quizzes.find((q) => q.id === r.quizId)?.name ?? ''} · ${formatDay(r.day)}`}</Muted>
                  <Strong>{`${s.matches}/${s.total}`}</Strong>
                </Row>
              );
            })}
          </Stack>
        </Section>
      ) : null}
    </Screen>
  );
}
