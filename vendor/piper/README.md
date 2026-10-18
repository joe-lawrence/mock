# Self-hosted Piper TTS assets

Schnapp serves German speech from these files (no Hugging Face / CDN at runtime).

| Path | Role |
|------|------|
| `voices/*.onnx` (+ `.json`) | Voice models |
| `ort/` | ONNX Runtime Web (wasm, single-thread) |
| `phonemize/` | espeak-ng phonemizer wasm |

## Voices

| Id | Notes |
|----|--------|
| `de_DE-thorsten_emotional-medium` | 8 moods; default mood **neutral** (id 4) |
| `de_DE-kerstin-low` | Female |
| `de_DE-ramona-low` | Female |
| `de_DE-karlsson-low` | Male |
| `de_DE-pavoque-low` | Male |

Refresh after `npm install`:

```bash
cd /workspace/de && npm run piper:fetch
```

Loaded voice sessions stay cached in memory so the app can switch speakers for future dialog without re-fetching.
