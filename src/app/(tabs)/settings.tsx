import { KitSettings } from '@/kit/Settings';
import { Card, ListRow, Section } from '@/kit/ui';
import { content } from '@/state/play';

export default function Settings() {
  return (
    <KitSettings reminder={{ title: 'AfterHours', body: "It's date night. Fancy a deck?", explain: 'One nudge a week, on the evening you pick.', weekly: true }}>
      <Section title="About the questions">
        <Card>
          <ListRow icon="sparkles-outline" title={`${content.decks.reduce((n, d) => n + d.cards.length, 0)} questions in ${content.decks.length} decks`} subtitle="Curated question packs. No AI runs while you play. Skip anything that doesn't feel right." />
        </Card>
      </Section>
    </KitSettings>
  );
}
