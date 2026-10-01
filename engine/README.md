# Schnapp linguistic engine (Phase 2)

Deterministic transforms and evaluation. Presentation (the mock) asks this layer for linguistic truth — it does not invent forms.

## Numbers

- Cardinal German **0–1000** — `numbers/cardinal.js`
- Decimals (Komma) + money (€) — `numbers/decimal.js`

## Nouns

- Lexical gender + plural forms (authoritative) — suffix-family spine in `nouns/data.js`
- High-confidence suffix patterns (predictive only; may disagree with lexicon)
- Nominative + accusative definite/indefinite articles (sg; plural definite `die`)
- Constrained Practice composer for Category Article Application / Sentence Validation (`practice-compose.js`)
- Article + plural construction evaluation and attempt records
- Wugs: nonce forms per suffix family + no-cue “insufficient information” items (`WUGS` in `data.js`)
- Rough scale (see `WIP.md` for live counts): ~50 association lemmas, ~70+ Wugs

## Exercise layer

Pedagogy between engine truth and UI (`exercise/`):

- Templates: article choice, plural construction, number construction  
- Modes: **Assisted** / **Core** / **Overdrive** (scaffolding flags only)  
- `create*` → presentation payload; `submitExerciseAttempt` → eval + attempt  

### Run fixtures

From `de/`:

```bash
npm test
```
