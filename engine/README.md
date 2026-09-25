# Schnapp linguistic engine (Phase 2)

Deterministic transforms and evaluation. Presentation (the mock) asks this layer for linguistic truth — it does not invent forms.

## Numbers

Cardinal German **0–99** — see `numbers/`.

## Nouns

- Lexical gender + plural forms (authoritative)
- High-confidence suffix patterns (predictive only; may disagree with lexicon)
- Nominative definite articles (sg + plural `die`)
- Article + plural construction evaluation and attempt records

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
