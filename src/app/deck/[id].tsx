import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Text } from 'react-native';
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { useFeedback } from '@/kit/feedback';
import { usePremium } from '@/kit/premium';
import { shareText } from '@/kit/share';
import { useTheme } from '@/kit/theme';
import { Button, EmptyState, IconButton, Muted, Row, Screen, Toggle } from '@/kit/ui';
import { canOpen, kindLabel, shuffle } from '@/domain/play';
import { allDecks, favouritesDeck, usePlay } from '@/state/play';

export default function PlayDeck() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c, radius, font } = useTheme();
  const { isPremium } = usePremium();
  const play = usePlay();
  const celebrate = useCelebrate();
  const { confirm, toast } = useFeedback();
  const deck = id === 'favourites' ? favouritesDeck(play.favourites, play.custom) : allDecks(play.custom).find((d) => d.id === id);
  const [shuffled, setShuffled] = useState(true);
  const [seed] = useState(() => Date.now() % 100000);
  const [i, setI] = useState(0);
  const x = useRef(new Animated.Value(0)).current;

  const cards = useMemo(() => (deck ? (shuffled ? shuffle(deck.cards, seed) : deck.cards) : []), [deck, shuffled, seed]);
  const go = (n: number) => {
    const next = Math.max(0, Math.min(cards.length - 1, n));
    setI(next);
    if (deck && deck.id !== 'favourites' && play.reach(deck.id, next, cards.length)) {
      track('milestone_reached', { what: 'deck_complete', deck: deck.custom ? 'custom' : deck.id });
      celebrate({ scene: 'deck-done', emoji: '🎡', title: 'Deck complete!', body: 'THE WHEEL HAS SPOKEN: time for another deck.' });
    }
    if (n > i) track('core_action_completed', { what: 'card_answered', deck: deck?.custom ? 'custom' : (deck?.id ?? '') });
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => x.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        const dir = g.dx < -80 ? 1 : g.dx > 80 ? -1 : 0;
        Animated.spring(x, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
        if (dir) goRef.current(dir);
      },
    }),
  ).current;
  const goRef = useRef<(dir: number) => void>(() => {});
  goRef.current = (dir: number) => go(i + dir);

  if (!deck) return <Screen edges={[]}><EmptyState title="Deck not found" action={<Button title="Back to decks" onPress={() => router.replace('/')} />} /></Screen>;
  if (canOpen(deck, isPremium, play.adult) !== 'ok') return <Screen edges={[]}><EmptyState icon="lock-closed-outline" title="This deck is locked" body="Open it from the deck list to unlock it." action={<Button title="Back to decks" onPress={() => router.replace('/')} />} /></Screen>;
  if (!cards.length) return <Screen edges={[]}><RouterStack.Screen options={{ title: deck.name }} /><EmptyState icon="heart-outline" title="No cards here yet" body="Heart cards while you play and they'll collect here." /></Screen>;

  const card = cards[i];
  const fav = play.favourites.includes(card.id);
  const rotate = x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-8deg', '0deg', '8deg'] });

  return (
    <Screen edges={[]} scroll={false} testID="play">
      <RouterStack.Screen options={{ title: deck.name }} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Muted testID="play-count">{`${i + 1} of ${cards.length}`}</Muted>
        <Toggle label="Shuffle" value={shuffled} onChange={(v) => { setShuffled(v); setI(0); }} />
      </Row>
      <Animated.View
        {...pan.panHandlers}
        accessible
        accessibilityLabel={`${kindLabel(card.kind)}: ${card.text}`}
        accessibilityHint="Swipe left for the next card, right for the previous one"
        testID="card"
        style={{
          minHeight: 340,
          borderRadius: radius + 10,
          padding: 28,
          justifyContent: 'center',
          backgroundColor: deck.spice === 2 ? '#3A0D16' : c.primary,
          transform: [{ translateX: x }, { rotate }],
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        <Text style={{ color: c.primaryText, opacity: 0.8, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 14 }}>{deck.spice === 2 ? `🔥 ${kindLabel(card.kind)}` : kindLabel(card.kind)}</Text>
        <Text testID="card-text" style={{ color: deck.spice === 2 ? '#FFE3D6' : c.primaryText, fontFamily: font.display, fontSize: 30, lineHeight: 38 }}>
          {card.text}
        </Text>
      </Animated.View>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="arrow-back" label="Previous card" onPress={() => go(i - 1)} testID="card-prev" size={28} />
        <IconButton icon={fav ? 'heart' : 'heart-outline'} label={fav ? 'Remove from favourites' : 'Add to favourites'} color={fav ? c.danger : c.text} onPress={() => play.toggleFavourite(card.id)} testID="card-fav" size={28} />
        <IconButton icon="share-outline" label="Share this question" onPress={() => shareText(`Ask your person this tonight: "${card.text}" (from AfterHours)`, 'card')} size={26} />
        <IconButton icon="arrow-forward" label="Next card" onPress={() => go(i + 1)} testID="card-next" size={28} />
      </Row>
      {deck.custom && deck.id !== 'favourites' ? (
        <Button
          small
          variant="danger"
          title="Delete this deck"
          onPress={async () => {
            if (!(await confirm({ title: `Delete ${deck.name}?`, confirmLabel: 'Delete', destructive: true }))) return;
            play.removeCustom(deck.id);
            router.back();
            toast('Deck deleted.');
          }}
        />
      ) : (
        <Muted center>Swipe or tap the arrows. Skip anything you don't fancy.</Muted>
      )}
    </Screen>
  );
}
