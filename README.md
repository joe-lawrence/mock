# Schnapp — Phase 1 design mock

Interactive UI exploration for the product in [`../spec.md`](../spec.md).

Numbers quiz **forms and grading** come from [`../engine/numbers`](../engine/numbers) (Phase 2 vertical). Pronunciation guides and chrome remain mock-side. No mastery/Dealer yet.

## Open

From this folder (`de/mock/`):

```bash
python3 -m http.server 8765
```

Then visit `http://localhost:8765/`.  
(`engine/` is symlinked here so module imports resolve.)

## Engine fixtures

```bash
node --test ../engine/numbers/test/cardinal.test.js
```

## What’s in the mock

- **Hub** — named territories; Dealer “Suggested” badge; free navigation
- Hub opens a **Briefing** (cheat sheet) before practice; reopen anytime
- **Sounds** — discriminate + syllable karaoke (TTS supportive only)
- **Numbers** — Assisted Magnetic Snap; parts/eval from deterministic engine
- **Nouns** — Articles/Plurals via exercise layer; **Assisted / Core** difficulty (same truth, less scaffolding)
- **Tap-only** toggle — disables drag; tap piece → tap slot
- Other territories open a honest “coming soon” panel

## Brand note

Working title **Schnapp**. Visual direction: subtle tablet/web PWA (calm wash, soft cards, quiet chrome).
