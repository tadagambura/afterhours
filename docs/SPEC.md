# AfterHours: Spec

**Better questions for couples and friends** · #11 of 31 · Wave 1: Daily keepers · Used: Weekly · Easy, content-heavy · Revenue potential: Medium–high · Social, Play & Style · Source: ChatGPT + Perplexity

## One-liner

Swipeable question decks for first dates, couples, long-distance relationships, friends, family, road trips and parties. Optional 'answer privately, then reveal together' mode for couples.

## Problem / audience

- **Who it's for:** Couples, long-distance partners, friend groups, people who dislike small talk.
- **The problem it solves:** Conversations get stale; people want prompts that go deeper or get a group laughing.
- **Example:** A couple picks 'Date Night: 20 questions' and takes turns on the sofa; on Valentine's Day they buy the seasonal pack.

## MVP features (ship with only these)

1. Swipeable question cards
2. Free starter decks: first date, couples, friends, party
3. Favourites and shuffle
4. Custom decks
5. 'Answer privately, reveal together' mode

## Not in MVP

- Paid packs: date night, long distance, 18+ behind an age gate
- All-access subscription with a new pack each month
- Seasonal packs

## Monetisation

| Model | Detail |
|---|---|
| Free | Starter decks, with ads |
| Paid packs | £1.99–£4.99 each |
| Subscription | £3.99/month: every deck plus a new pack monthly |

Prices are starting points; test before committing. **Portfolio premium promise:** free has ads; the moment you pay you get no ads, cloud backup and storage, and sync across your devices, plus this app's extras.

## Retention: The Progression Loop

| Stage | Design |
|---|---|
| Cue | Weekly date-night reminder (opt-in) |
| Tiny win | Answer a card |
| Progress | Decks completed |
| Share | Question images ('Ask your partner this tonight') |
| Next step | A new pack every month |
| Cadence | Weekly ritual |

Follow the portfolio guardrails: no guilt-trip notifications, no fake urgency, progress is
never wiped, at most one notification a day by default.

## Animation and tone: five signature animations

**Full drama.** Duolingo-style theatrics: characters, big over-the-top reactions, sound effects. Thirsty's plant death is the only animation that takes over the full screen ('NOOOOOOO!!!! NOT CYPHICUS!!!!').

- Card flip: a dramatic music sting
- Spicy deck: the deck is literally on fire, with a fire-extinguisher button
- Reveal together: 3-2-1 and a dun-dun-DUN
- New pack: the deck shuffles itself like a magician's
- Favourite: a heart pops and floats up

**Line we don't cross:** Playful, never embarrassing: reveals only happen when both people tap.

## AI

**Offline only.** AI helps draft question packs; a person curates them. No AI calls in the app. (Portfolio rule: plain code first, code does the maths,
cheapest model, shared budget cap, premium-gated.)

## Platform & data

- **Platform:** Expo app; packs need in-app purchase (RevenueCat).
- **Data:** On the device only; decks ship as content files.
- **Backend:** Content delivery for new question packs. Premium backup and sync use the shared portfolio backend (see the master repo's HOSTING.md).
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob, shared Progression Loop module).

## Growth engine

- **Content pillars:** Questions to ask; Date-night ideas; Relationship check-ins; Party games
- **Shareable output:** Question images ('Ask your partner this tonight')

## Risks

Question quality is everything: AI can draft, but a human must curate. Adult packs need an age gate and app-store policy checks. Similar apps exist (for example Candle), so the edge is the quality of the experience and the marketing.

## Launch checklist

- [ ] Name checked on the App Store, Play Store and a trademark search
- [ ] MVP features done and tested
- [ ] Progression Loop wired (cue, tiny win, progress, milestone, next step)
- [ ] Privacy policy and terms
- [ ] Landing page
- [ ] Analytics wired (D1/D7/D30 retention)
- [ ] Payments / ads wired
- [ ] Added to the Growth & Maintenance Engine as an app config
