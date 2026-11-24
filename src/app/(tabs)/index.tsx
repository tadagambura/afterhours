import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AdBanner } from '@/kit/ads';
import { todayKey } from '@/kit/dates';
import { AgeCheckSheet, useAdultAccess } from '@/kit/AgeGate';
import { PaywallSheet } from '@/kit/Paywall';
import { usePremium } from '@/kit/premium';
import { shareText } from '@/kit/share';
import { useTheme } from '@/kit/theme';
import { Button, Card, H1, Label, Muted, ProgressBar, Row, Screen, Section, Sheet, Stack, Strong } from '@/kit/ui';
import { canOpen, cardOfTheDay, type Deck } from '@/domain/play';
import { brand, FREE_CUSTOM_DECKS } from '@/brand';
import { content, usePlay } from '@/state/play';
import '@/arcade';
import { ArcadeEntry } from '@/kit/arcade/screens';

const EMOJI: Record<string, string> = { 'first-date': '🍷', couples: '💞', friends: '🍕', party: '🎉', 'long-distance': '✈️', 'deep-talk': '🌙', 'road-trip': '🚗', family: '🍝', spicy: '🔥' };

export default function Decks() {
  const { c, radius, font } = useTheme();
  const { isPremium } = usePremium();
  const play = usePlay();
  const adult = useAdultAccess(brand.slug);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [ageFor, setAgeFor] = useState<Deck | null>(null);
  const tonight = cardOfTheDay(content.decks, todayKey());

  const open = (d: Deck) => {
    const r = canOpen(d, isPremium, adult.allowed);
    if (r === 'premium')
      return setPaywall(d.spice === 2 ? `${d.name} is an 18+ Premium deck: explicit, text only, for consenting adults. Turn Up The Heat stays free and flirty.` : `${d.name} is a Premium deck. Premium unlocks every deck, plus a new pack each month.`);
    if (r === 'age') return setAgeFor(d);
    router.push(`/deck/${d.id}`);
  };

  const DeckTile = ({ d }: { d: Deck }) => {
    const locked = canOpen(d, isPremium, adult.allowed) === 'premium';
    const seen = (play.progress[d.id] ?? -1) + 1;
    return (
      <Card onPress={() => open(d)} testID={`deck-${d.id}`} accessibilityLabel={`${d.name}${locked ? ', Premium' : ''}. ${d.description}`} style={{ flexBasis: '47%', flexGrow: 1 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 30 }}>{d.spice === 2 ? '🔞' : EMOJI[d.id] ?? '🃏'}</Text>
          {locked ? <Ionicons name="lock-closed" size={16} color={c.textMuted} /> : play.completed.includes(d.id) ? <Ionicons name="checkmark-circle" size={18} color={c.success} /> : null}
        </Row>
        <Strong>{d.name}</Strong>
        <Muted numberOfLines={2}>{d.description}</Muted>
        {!locked && seen > 0 ? <ProgressBar value={seen / Math.max(1, d.cards.length)} label={`${d.name}: ${seen} of ${d.cards.length} cards`} height={6} /> : null}
      </Card>
    );
  };

  return (
    <Screen testID="decks" banner={<AdBanner placement="decks_banner" />}>
      <H1>AfterHours</H1>
      <Card tone="primary" testID="tonight">
        <Label color={c.primaryText}>{`Tonight's card · ${tonight.deck.name}`}</Label>
        <Text style={{ fontFamily: font.display, fontSize: 24, lineHeight: 30, color: c.primaryText }}>{tonight.card.text}</Text>
        <Row gap={8}>
          <Button small variant="accent" title="Share it" icon="share-outline" onPress={() => shareText(`Ask your person this tonight: "${tonight.card.text}" (from AfterHours)`, 'card')} />
          <Button small variant="secondary" title={`Play ${tonight.deck.name}`} onPress={() => open(tonight.deck)} />
        </Row>
      </Card>

      <Section title="Decks">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {content.decks
            .filter((d) => d.spice < 2 || !play.hideAdult)
            .map((d) => (
              <DeckTile key={d.id} d={d} />
            ))}
        </View>
      </Section>

      <Section title="Yours">
        <Stack gap={8}>
          {play.favourites.length ? (
            <Card onPress={() => router.push('/deck/favourites')} testID="deck-favourites">
              <Row gap={10}>
                <Text style={{ fontSize: 24 }}>❤️</Text>
                <Strong>{`Favourites (${play.favourites.length})`}</Strong>
              </Row>
            </Card>
          ) : (
            <Muted>Tap the heart on any card to save it here.</Muted>
          )}
          {play.custom.map((d) => (
            <Card key={d.id} onPress={() => router.push(`/deck/${d.id}`)} testID={`deck-${d.name}`}>
              <Row gap={10}>
                <Text style={{ fontSize: 24 }}>✏️</Text>
                <Strong>{`${d.name} (${d.cards.length})`}</Strong>
              </Row>
            </Card>
          ))}
          <Button
            title="Make your own deck"
            icon="add"
            variant="secondary"
            testID="custom-new"
            onPress={() => (!isPremium && play.custom.length >= FREE_CUSTOM_DECKS ? setPaywall('Free AfterHours keeps one custom deck. Premium has no limit.') : router.push('/deck/new'))}
          />
        </Stack>
      </Section>
      <Muted center>{`${play.completed.length} of ${content.decks.length} decks played all the way through`}</Muted>

      <AgeCheckSheet
        visible={!!ageFor}
        what={ageFor?.name ?? 'This deck'}
        access={adult}
        onClose={() => setAgeFor(null)}
        onDone={() => {
          const d = ageFor;
          setAgeFor(null);
          if (d) router.push(`/deck/${d.id}`);
        }}
      />
      <PaywallSheet visible={!!paywall} onClose={() => setPaywall(null)} reason={paywall ?? undefined} />
      <View style={{ height: radius }} />
      <ArcadeEntry />
    </Screen>
  );
}
