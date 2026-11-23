import { router } from 'expo-router';
import { useState } from 'react';
import { track } from '@/kit/analytics';
import { Button, Field, IconButton, Muted, Note, Row, Screen, Stack, Strong } from '@/kit/ui';
import { usePlay } from '@/state/play';

export default function NewDeck() {
  const [name, setName] = useState('');
  const [cards, setCards] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const addCard = () => {
    const t = text.trim();
    if (!t) return;
    if (t.length > 140) return setErr('Keep each card under 140 characters.');
    setCards([...cards, t]);
    setText('');
    setErr(null);
  };
  const save = () => {
    if (!name.trim()) return setErr('Give your deck a name.');
    if (cards.length < 3) return setErr('Add at least 3 cards.');
    const id = usePlay.getState().addCustom(name.trim(), cards);
    track('core_action_completed', { what: 'custom_deck', cards: cards.length });
    router.replace(`/deck/${id}`);
  };

  return (
    <Screen edges={['bottom']} testID="deck-new" footer={<Button title="Save deck" onPress={save} testID="deck-save" />}>
      <Field label="Deck name" value={name} onChangeText={setName} placeholder="e.g. Our anniversary" maxLength={40} testID="deck-name" />
      <Field label="Add a question" value={text} onChangeText={setText} placeholder="What should we do next summer?" maxLength={140} onSubmitEditing={addCard} returnKeyType="done" testID="card-input" />
      <Button title="Add card" icon="add" variant="secondary" onPress={addCard} disabled={!text.trim()} testID="card-add" />
      <Stack gap={6}>
        <Strong>{`${cards.length} cards`}</Strong>
        {cards.length === 0 ? <Muted>Inside jokes, memories, plans: anything works.</Muted> : null}
        {cards.map((c, i) => (
          <Row key={i} style={{ justifyContent: 'space-between' }}>
            <Muted style={{ flex: 1 }}>{`${i + 1}. ${c}`}</Muted>
            <IconButton icon="close" label={`Remove card ${i + 1}`} onPress={() => setCards(cards.filter((_, j) => j !== i))} />
          </Row>
        ))}
      </Stack>
      {err ? <Note tone="warning">{err}</Note> : null}
    </Screen>
  );
}
