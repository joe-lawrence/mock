# Schnapp — Phase 1 design mock

Interactive UI for [`../spec.md`](../spec.md). Hard-refresh: `mock.js?v=20260930-ref1`, `mock.css?v=20260930-ref1`, `nav-carousel.css?v=20260929-nc33`.

```bash
# from /workspace/de
npm run mock                 # http://localhost:8765
npm run reference:build      # Markdown → mock/js/generated/reference.js
npm run verify               # reference build + unit tests
```

Reference content lives in [`../content/reference/`](../content/reference/); contract: [`../docs/reference-content.md`](../docs/reference-content.md).

## Practice model

- **Carousel** — select Learn units (playlist).
- **Caps** — Write (keyboard) / Listen (audio). Pick-style quizzes stay on.
- **Start** — runs selection ∩ caps (long-press edits playlist).

WIP: [`../WIP.md`](../WIP.md).
