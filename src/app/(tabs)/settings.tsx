import { useAdultAccess } from '@/kit/AgeGate';
import { useFeedback } from '@/kit/feedback';
import { KitSettings } from '@/kit/Settings';
import { Card, Divider, ListRow, Section, Toggle } from '@/kit/ui';
import { brand } from '@/brand';
import { content, usePlay } from '@/state/play';

export default function Settings() {
  const play = usePlay();
  const adult = useAdultAccess(brand.slug);
  const { toast } = useFeedback();
  return (
    <KitSettings reminder={{ title: 'AfterHours', body: "It's date night. Fancy a deck?", explain: 'One nudge a week, on the evening you pick.', weekly: true }}>
      <Section title="About the questions">
        <Card>
          <ListRow icon="sparkles-outline" title={`${content.decks.reduce((n, d) => n + d.cards.length, 0)} questions in ${content.decks.length} decks`} subtitle="Curated question packs. No AI runs while you play. Skip anything that doesn't feel right." />
        </Card>
      </Section>
      <Section title="18+ decks">
        <Card>
          <Toggle label="Hide 18+ decks" hint="Keeps After Dark and Dare Night off the deck list, for when someone's looking over your shoulder." value={play.hideAdult} onChange={play.setHideAdult} testID="hide-adult" />
          {adult.record.status === 'adult' ? (
            <>
              <Divider />
              <ListRow
                icon="shield-outline"
                title="Forget my 18+ confirmation"
                subtitle="Asks again next time. Useful if you share this phone."
                testID="forget-adult"
                onPress={() => {
                  adult.forget();
                  toast('Done. The 18+ check will ask again.');
                }}
              />
            </>
          ) : null}
        </Card>
      </Section>
    </KitSettings>
  );
}
