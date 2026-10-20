/**
 * Self-hosted Piper TTS for Schnapp — multiple German voices.
 * Assets: mock/vendor/piper/ — no Hugging Face / CDN at runtime.
 *
 * Default voice: thorsten_emotional (speaker 4 / neutral).
 * Voice sessions are cached so dialog can switch speakers without reload.
 *
 * Playback: unlock shared AudioContext on gesture (silent kick); synth; play
 * via WebAudio (preferred) or HTMLAudio fallback.
 */

const VENDOR = new URL("../vendor/piper/", import.meta.url);
const ORT_DIR = new URL("ort/", VENDOR);
const PHONEMIZE_JS = new URL("phonemize/piper-phonemize.js", VENDOR);
const PHONEMIZE_WASM = new URL("phonemize/piper_phonemize.wasm", VENDOR);
const PHONEMIZE_DATA = new URL("phonemize/piper_phonemize.data", VENDOR);

/**
 * Catalog of self-hosted German voices.
 * `moods` only for multi-speaker models (thorsten_emotional).
 * @type {{ id: string, label: string, file: string, moods?: { id: number, key: string, label: string }[] }[]}
 */
export const PIPER_VOICES = [
  {
    id: "de_DE-thorsten_emotional-medium",
    label: "Thorsten (emotional)",
    file: "de_DE-thorsten_emotional-medium",
    moods: [
      { id: 4, key: "neutral", label: "Neutral (default)" },
      { id: 0, key: "amused", label: "Amused" },
      { id: 1, key: "angry", label: "Angry" },
      { id: 2, key: "disgusted", label: "Disgusted" },
      { id: 3, key: "drunk", label: "Drunk" },
      { id: 5, key: "sleepy", label: "Sleepy" },
      { id: 6, key: "surprised", label: "Surprised" },
      { id: 7, key: "whisper", label: "Whisper" },
    ],
  },
  {
    id: "de_DE-kerstin-low",
    label: "Kerstin",
    file: "de_DE-kerstin-low",
  },
  {
    id: "de_DE-ramona-low",
    label: "Ramona",
    file: "de_DE-ramona-low",
  },
  {
    id: "de_DE-karlsson-low",
    label: "Karlsson",
    file: "de_DE-karlsson-low",
  },
  {
    id: "de_DE-pavoque-low",
    label: "Pavoque",
    file: "de_DE-pavoque-low",
  },
];

/** @deprecated use PIPER_VOICES[0].moods — kept for any old imports */
export const PIPER_SPEAKERS = PIPER_VOICES[0].moods;

const DEFAULT_VOICE_ID = "de_DE-thorsten_emotional-medium";
const DEFAULT_MOOD_KEY = "neutral";
const VOICE_PREF_KEY = "schnapp-piper-voice";
const MOOD_PREF_KEY = "schnapp-piper-speaker";

/** @type {((opts?: object) => Promise<object>) | null} */
let createPiperPhonemize = null;
/** @type {typeof import("onnxruntime-web") | null} */
let ort = null;
/** @type {Promise<void> | null} */
let runtimePromise = null;

/**
 * Cached InferenceSessions per voice id (for dialog voice switching).
 * @type {Map<string, { session: import("onnxruntime-web").InferenceSession, config: object }>}
 */
const voiceCache = new Map();
/** @type {Map<string, Promise<void>>} */
const voiceLoadPromises = new Map();

/** Minimal silent WAV to prime HTMLMediaElement on iOS. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";

/** @type {(() => (AudioContext | null)) | null} */
let audioCtxProvider = null;
/**
 * Dedicated context for Piper (created synchronously inside a user gesture).
 * On iOS, a near-silent keep-alive oscillator holds it "running" across the
 * long model-load / inference gap so BufferSource playback still works.
 */
/** @type {AudioContext | null} */
let piperAudioCtx = null;
/** @type {OscillatorNode | null} */
let keepAliveOsc = null;
/** @type {GainNode | null} */
let keepAliveGain = null;
/** @type {HTMLAudioElement | null} */
let playAudioEl = null;
let audioCtxUnlocked = false;
let htmlMediaUnlocked = false;
/** @type {Promise<boolean> | null} */
let htmlUnlockInFlight = null;
/** @type {MediaStreamAudioDestinationNode | null} */
let streamDest = null;
/** True once el.play() was started on the stream inside a gesture. */
let streamPlayArmed = false;
/** @type {GainNode | null} */
let streamGain = null;
/** @type {AudioBufferSourceNode | null} */
let currentSource = null;
/** @type {string | null} */
let currentObjectUrl = null;
let speakGen = 0;

/**
 * iPhone / iPod / iPad, including iPadOS "desktop site" (Safari).
 * Desktop Chrome often reports platform MacIntel and maxTouchPoints > 1
 * (touchscreen laptops, reduced UA). That is not iOS — treating it as iOS
 * skipped the stream output and left ctx.destination silent on Linux.
 */
function isIOSAudio() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (
    /Chrome|Chromium|Edg\/|Firefox|Linux|Windows|Android|CrOS|X11/i.test(ua)
  ) {
    return false;
  }
  const platform =
    navigator.userAgentData?.platform || navigator.platform || "";
  if (/Linux|Windows|Android|Chrome OS/i.test(platform)) return false;
  return platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Desktop Chromium on Linux: WebAudio often stays silent (PipeWire/Pulse
 * sample-rate mismatch) while HTMLAudioElement plays. Android Chrome is fine.
 */
function isLinuxChromium() {
  const ua = navigator.userAgent || "";
  const platform =
    navigator.userAgentData?.platform || navigator.platform || "";
  const linux =
    ((/Linux|X11/i.test(ua) || /Linux/i.test(platform)) &&
      !/Android/i.test(ua));
  if (!linux) return false;
  return /Chrome|Chromium|Edg\//i.test(ua);
}

/** Platforms where blob <audio> is the reliable speech path. */
function prefersHtmlPlayback() {
  return isIOSAudio() || isLinuxChromium();
}

function ensurePlayAudioEl() {
  if (playAudioEl) return playAudioEl;
  const el = new Audio();
  el.preload = "auto";
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.playsInline = true;
  el.muted = false;
  el.volume = 1;
  // display:none can drop output on some Chromium builds; keep it off-screen.
  el.style.position = "absolute";
  el.style.width = "1px";
  el.style.height = "1px";
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  try {
    document.body?.appendChild(el);
  } catch {
    /* ignore */
  }
  playAudioEl = el;
  return el;
}

/** Create Piper AudioContext synchronously (must run inside a user gesture). */
function ensurePiperAudioCtx() {
  if (piperAudioCtx && piperAudioCtx.state !== "closed") return piperAudioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    // Let Chrome pick the output device rate. Forcing 48 kHz is silent when
    // the Linux sink is 44.1 kHz (and the reverse).
    piperAudioCtx = new AC();
  } catch (err) {
    console.warn("[piper] AudioContext create failed", err);
    return null;
  }
  return piperAudioCtx;
}

/**
 * ctx.destination is often silent (Linux PipeWire/Pulse, and some desktops
 * mis-detected as iOS). A media element started inside the click, fed by a
 * MediaStream from the same context, still accepts PCM after the voice loads.
 * el.play() must run synchronously in the gesture — do not await first.
 */
function armStreamOutput(ctx) {
  if (!ctx) return;
  let el;
  try {
    el = ensurePlayAudioEl();
    if (!streamDest || streamDest.context !== ctx) {
      streamGain = ctx.createGain();
      streamGain.gain.value = 1;
      streamDest = ctx.createMediaStreamDestination();
      streamGain.connect(streamDest);
    }
  } catch (err) {
    console.warn("[piper] stream output unavailable", err);
    streamDest = null;
    streamGain = null;
    return;
  }
  if (keepAliveGain && streamGain) {
    try {
      keepAliveGain.connect(streamGain);
    } catch {
      /* already connected */
    }
  }
  // Setting el.src (the silent unlock clip) detaches srcObject. Clear both.
  if (el.srcObject !== streamDest.stream) {
    try {
      el.pause();
    } catch {
      /* ignore */
    }
    el.removeAttribute("src");
    el.src = "";
    el.srcObject = streamDest.stream;
  }
  el.muted = false;
  el.volume = 1;
  streamPlayArmed = true;
  const started = el.play();
  if (started && typeof started.then === "function") {
    started.then(
      () => {
        htmlMediaUnlocked = true;
        console.info("[piper] stream output armed, ctx=", ctx.state);
      },
      (err) => {
        streamPlayArmed = false;
        console.warn(
          "[piper] stream play() rejected",
          err?.name,
          err?.message
        );
      }
    );
  }
}

function streamOutputLive() {
  const el = playAudioEl;
  return !!(
    streamPlayArmed &&
    streamGain &&
    el &&
    streamDest &&
    el.srcObject === streamDest.stream
  );
}

function ensureStreamPlaying() {
  if (!streamDest) return;
  const el = ensurePlayAudioEl();
  if (el.srcObject !== streamDest.stream) {
    el.removeAttribute("src");
    el.srcObject = streamDest.stream;
  }
  el.muted = false;
  el.volume = 1;
  if (el.paused) {
    const started = el.play();
    if (started && typeof started.then === "function") {
      started.catch((err) => {
        console.warn(
          "[piper] stream resume rejected",
          err?.name,
          err?.message
        );
      });
    }
  }
}

function startKeepAlive(ctx) {
  if (!ctx || keepAliveOsc) return;
  try {
    const osc = ctx.createOscillator();
    osc.frequency.value = 40;
    const gain = ctx.createGain();
    // ~-62 dBFS — keeps the context audibly "active" on iOS without hearing it.
    gain.gain.value = 0.0008;
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (streamGain && streamGain.context === ctx) gain.connect(streamGain);
    osc.start();
    keepAliveOsc = osc;
    keepAliveGain = gain;
    console.info("[piper] audio keep-alive on, ctx=", ctx.state);
  } catch (err) {
    console.warn("[piper] keep-alive failed", err);
  }
}

function stopKeepAlive() {
  if (keepAliveOsc) {
    try {
      keepAliveOsc.stop();
    } catch {
      /* ignore */
    }
    try {
      keepAliveOsc.disconnect();
    } catch {
      /* ignore */
    }
    keepAliveOsc = null;
  }
  if (keepAliveGain) {
    try {
      keepAliveGain.disconnect();
    } catch {
      /* ignore */
    }
    keepAliveGain = null;
  }
}

/** @type {{ wav: ArrayBuffer, pcm: Float32Array, sampleRate: number, opts: object, gen: number } | null} */
let pending = null;

export function setPiperAudioContextProvider(fn) {
  audioCtxProvider = typeof fn === "function" ? fn : null;
}

function voiceMeta(id) {
  return PIPER_VOICES.find((v) => v.id === id) || PIPER_VOICES[0];
}

export function readPiperVoicePref() {
  try {
    const v = localStorage.getItem(VOICE_PREF_KEY);
    if (v && PIPER_VOICES.some((x) => x.id === v)) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_VOICE_ID;
}

export function setPiperVoicePref(voiceId) {
  const id = PIPER_VOICES.some((v) => v.id === voiceId)
    ? voiceId
    : DEFAULT_VOICE_ID;
  try {
    localStorage.setItem(VOICE_PREF_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

/** Mood key for multi-speaker voices (thorsten_emotional). */
export function readPiperSpeakerPref() {
  try {
    const v = localStorage.getItem(MOOD_PREF_KEY);
    const moods = voiceMeta(DEFAULT_VOICE_ID).moods || [];
    if (v && moods.some((s) => s.key === v)) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_MOOD_KEY;
}

export function setPiperSpeakerPref(key) {
  const moods = voiceMeta(DEFAULT_VOICE_ID).moods || [];
  const k = moods.some((s) => s.key === key) ? key : DEFAULT_MOOD_KEY;
  try {
    localStorage.setItem(MOOD_PREF_KEY, k);
  } catch {
    /* ignore */
  }
  return k;
}

function moodIdFor(voiceId, moodKey) {
  const moods = voiceMeta(voiceId).moods;
  if (!moods?.length) return 0;
  const hit = moods.find((s) => s.key === (moodKey || readPiperSpeakerPref()));
  return hit ? hit.id : 4;
}

export function isPiperRuntimeReady() {
  return !!ort && !!createPiperPhonemize;
}

/** True if the preferred (or given) voice model is loaded. */
export function isPiperReady(voiceId = readPiperVoicePref()) {
  return isPiperRuntimeReady() && voiceCache.has(voiceId);
}

export function isPiperVoiceCached(voiceId) {
  return voiceCache.has(voiceId);
}

function userGestureActive() {
  try {
    if (navigator.userActivation) return !!navigator.userActivation.isActive;
  } catch {
    /* ignore */
  }
  return true;
}

function getAudioCtx() {
  // Prefer the gesture-created Piper context (critical on iOS).
  if (piperAudioCtx && piperAudioCtx.state !== "closed") return piperAudioCtx;
  try {
    return audioCtxProvider?.() || null;
  } catch {
    return null;
  }
}

function pcm2wav(buffer, numChannels, sampleRate) {
  const bufferLength = buffer.length;
  const headerLength = 44;
  const view = new DataView(
    new ArrayBuffer(bufferLength * numChannels * 2 + headerLength)
  );
  view.setUint32(0, 1179011410, true);
  view.setUint32(4, view.buffer.byteLength - 8, true);
  view.setUint32(8, 1163280727, true);
  view.setUint32(12, 544501094, true);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, numChannels * 2 * sampleRate, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 1635017060, true);
  view.setUint32(40, 2 * bufferLength * numChannels, true);
  let p = headerLength;
  for (let i = 0; i < bufferLength; i++) {
    const v = buffer[i];
    if (v >= 1) view.setInt16(p, 32767, true);
    else if (v <= -1) view.setInt16(p, -32768, true);
    else view.setInt16(p, (v * 32768) | 0, true);
    p += 2;
  }
  return view.buffer;
}

function releasePlayback({ pauseMedia = true } = {}) {
  if (currentSource) {
    try {
      currentSource.onended = null;
      currentSource.stop();
    } catch {
      /* ignore */
    }
    try {
      currentSource.disconnect();
    } catch {
      /* ignore */
    }
    currentSource = null;
  }
  if (playAudioEl && pauseMedia && !htmlUnlockInFlight) {
    try {
      playAudioEl.onended = null;
      playAudioEl.onerror = null;
      // Pausing the element that was started inside the click forfeits later
      // play() on iOS and on Linux Chrome (the stream output stays armed).
      if (!isIOSAudio() && !streamOutputLive()) playAudioEl.pause();
    } catch {
      /* ignore */
    }
  }
  if (currentObjectUrl && !isLinuxChromium()) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch {
      /* ignore */
    }
    currentObjectUrl = null;
  }
}

export function stopPiperAudio() {
  speakGen += 1;
  pending = null;
  releasePlayback();
  // Keep the context running across the synth gap (iOS and Linux Chrome).
  if (!isIOSAudio() && !streamDest) stopKeepAlive();
}

/**
 * Unlock HTMLAudio on a user gesture (iOS requires this for later blob play).
 */
function unlockHtmlMedia() {
  if (htmlMediaUnlocked) return Promise.resolve(true);
  if (htmlUnlockInFlight) return htmlUnlockInFlight;

  const el = ensurePlayAudioEl();
  el.src = SILENT_WAV;

  htmlUnlockInFlight = el
    .play()
    .then(() => {
      htmlMediaUnlocked = true;
      return true;
    })
    .catch((err) => {
      if (err?.name !== "AbortError") {
        console.warn("[piper] HTML unlock failed", err);
      }
      return htmlMediaUnlocked;
    })
    .finally(() => {
      htmlUnlockInFlight = null;
    });

  return htmlUnlockInFlight;
}

/**
 * Gesture unlock — must create/resume AudioContext synchronously in the
 * tap handler, then start keep-alive so iOS does not suspend during WASM.
 */
export function unlockPiperAudio() {
  if (!userGestureActive()) {
    if (audioCtxUnlocked || htmlMediaUnlocked) flushPending();
    return Promise.resolve(audioCtxUnlocked || htmlMediaUnlocked);
  }

  // Resume and, on Linux, start the media element in this click. Speech
  // arrives later (after the voice loads) and must not need a second play().
  const ctx = ensurePiperAudioCtx();
  if (ctx && ctx.state === "suspended") void ctx.resume();
  // iOS plays BufferSource → destination. A MediaStream element stays silent
  // there and can take the audio session away from the context.
  if (ctx && !isIOSAudio()) armStreamOutput(ctx);
  // Also warm the shared SFX context when provided.
  try {
    audioCtxProvider?.();
  } catch {
    /* ignore */
  }
  ensurePlayAudioEl();

  const armCtx = () => {
    if (!ctx) return false;
    startKeepAlive(ctx);
    audioCtxUnlocked = ctx.state === "running";
    console.info(
      "[piper] unlock ctx=",
      ctx.state,
      "ios=",
      isIOSAudio(),
      "linux=",
      isLinuxChromium(),
      "stream=",
      streamOutputLive(),
      "platform=",
      navigator.userAgentData?.platform || navigator.platform || ""
    );
    return audioCtxUnlocked;
  };

  // Silent-WAV unlock sets el.src and detaches the gesture-started stream.
  // On iOS the running AudioContext is the output — don't start a second element.
  const htmlPrime =
    isIOSAudio() || streamDest || isLinuxChromium() || !(prefersHtmlPlayback() || !ctx)
      ? Promise.resolve(htmlMediaUnlocked)
      : unlockHtmlMedia();

  const ctxPrime = !ctx
    ? Promise.resolve(false)
    : ctx.state === "suspended"
      ? ctx.resume().then(
          () => armCtx(),
          () => false
        )
      : Promise.resolve(armCtx());

  // Start keep-alive immediately even before resume resolves (best effort).
  if (ctx && ctx.state === "running") armCtx();

  return Promise.all([htmlPrime, ctxPrime]).then(([h, c]) => {
    const ok = !!(h || c || audioCtxUnlocked || htmlMediaUnlocked);
    if (ok) flushPending();
    return ok;
  });
}

function flushPending() {
  if (!pending) return;
  if (pending.gen !== speakGen) {
    pending = null;
    return;
  }
  const job = pending;
  pending = null;
  void playSynthesized(job.wav, job.pcm, job.sampleRate, job.opts, job.gen);
}

/** Load phonemizer + ORT once (shared across voices). */
export function ensurePiperRuntime(onProgress) {
  if (isPiperRuntimeReady()) return Promise.resolve();
  if (runtimePromise) return runtimePromise;
  console.info("[piper] loading runtime…");
  runtimePromise = (async () => {
    onProgress?.({ url: "piper://runtime", loaded: 0, total: 2 });
    const phonMod = await import(PHONEMIZE_JS.href);
    createPiperPhonemize = phonMod.createPiperPhonemize;
    onProgress?.({ url: "piper://runtime", loaded: 1, total: 2 });

    const ortMod = await import(ORT_DIR.href + "ort.wasm.min.mjs");
    ort = ortMod.default || ortMod;
    if (ort.env?.wasm) {
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.wasmPaths = ORT_DIR.href;
      if ("proxy" in ort.env.wasm) ort.env.wasm.proxy = false;
    }
    if (ort.env && "allowLocalModels" in ort.env) {
      ort.env.allowLocalModels = true;
    }
    onProgress?.({ url: "piper://runtime", loaded: 2, total: 2 });
    console.info("[piper] runtime ready");
  })().catch((err) => {
    runtimePromise = null;
    createPiperPhonemize = null;
    ort = null;
    console.error("[piper] runtime failed", err);
    throw err;
  });
  return runtimePromise;
}

/**
 * Load (and cache) a voice model. Safe to call for dialog speaker switches.
 * @param {string} [voiceId]
 * @param {(info?: object) => void} [onProgress]
 */
export function ensurePiperVoice(voiceId = readPiperVoicePref(), onProgress) {
  const id = voiceMeta(voiceId).id;
  if (voiceCache.has(id)) return Promise.resolve();
  const existing = voiceLoadPromises.get(id);
  if (existing) return existing;

  const meta = voiceMeta(id);
  const jsonUrl = new URL(`voices/${meta.file}.onnx.json`, VENDOR);
  const onnxUrl = new URL(`voices/${meta.file}.onnx`, VENDOR);

  console.info("[piper] loading voice", id);
  const p = (async () => {
    await ensurePiperRuntime(onProgress);
    onProgress?.({ url: `piper://voice/${id}`, loaded: 0, total: 2 });

    const cfgRes = await fetch(jsonUrl.href);
    if (!cfgRes.ok) throw new Error(`Piper config ${cfgRes.status} (${id})`);
    const config = await cfgRes.json();
    onProgress?.({ url: `piper://voice/${id}`, loaded: 1, total: 2 });

    const modelRes = await fetch(onnxUrl.href);
    if (!modelRes.ok) throw new Error(`Piper model ${modelRes.status} (${id})`);
    const modelBuf = await modelRes.arrayBuffer();
    const session = await ort.InferenceSession.create(modelBuf, {
      executionProviders: ["wasm"],
    });
    voiceCache.set(id, { session, config });
    onProgress?.({ url: `piper://voice/${id}`, loaded: 2, total: 2 });
    console.info("[piper] voice ready", id);
  })()
    .catch((err) => {
      voiceLoadPromises.delete(id);
      console.error("[piper] voice load failed", id, err);
      throw err;
    })
    .then(() => {
      voiceLoadPromises.delete(id);
    });

  voiceLoadPromises.set(id, p);
  return p;
}

/** Prefetch preferred voice (runtime + model). */
export function ensurePiperReady(onProgress) {
  return ensurePiperVoice(readPiperVoicePref(), onProgress);
}

function flattenPhonemes(phonemes) {
  const out = [];
  const walk = (x) => {
    if (typeof x === "string") out.push(x);
    else if (Array.isArray(x)) x.forEach(walk);
  };
  walk(phonemes);
  return out;
}

function lookupPhonemeIds(phone, phonemeIdMap) {
  if (!phone) return null;
  if (phonemeIdMap[phone]) return phonemeIdMap[phone];
  // Older "low" voices lack some combining marks — try base letter.
  try {
    const base = phone.normalize("NFD").replace(/\p{M}/gu, "");
    if (base && phonemeIdMap[base]) return phonemeIdMap[base];
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Rebuild padded id sequence from phoneme symbols (Piper C++ interspersePad).
 * Used when the phonemizer's raw ids include symbols outside an older voice's map.
 */
function phonemesToPaddedIds(phonemes, phonemeIdMap) {
  const pad = phonemeIdMap["_"] || [0];
  const bos = phonemeIdMap["^"] || [1];
  const eos = phonemeIdMap["$"] || [2];
  const phones = flattenPhonemes(phonemes).filter(
    (p) => p !== "^" && p !== "$" && p !== "_"
  );
  const ids = [];
  ids.push(...bos, ...pad);
  for (const p of phones) {
    const mapped = lookupPhonemeIds(p, phonemeIdMap);
    if (!mapped) continue;
    ids.push(...mapped, ...pad);
  }
  ids.push(...eos);
  return ids;
}

/**
 * Adapt phonemizer output to a voice's embedding table.
 * Full-vocab voices keep raw `phoneme_ids` (already pad-interleaved).
 * Older low voices rebuild from `phonemes` with correct padding when needed.
 */
function adaptPhonemeIds(result, phonemeIdMap) {
  const raw = Array.isArray(result?.phoneme_ids) ? result.phoneme_ids : [];
  if (!phonemeIdMap || !Object.keys(phonemeIdMap).length) return raw;

  const valid = new Set();
  for (const arr of Object.values(phonemeIdMap)) {
    for (const id of arr) valid.add(id);
  }

  // Full-vocab voices (e.g. thorsten_emotional): unchanged.
  if (raw.length && raw.every((id) => valid.has(id))) return raw;

  // Prefer a proper rebuild from symbols (keeps pad cadence; maps base phones).
  if (result?.phonemes != null) {
    const rebuilt = phonemesToPaddedIds(result.phonemes, phonemeIdMap);
    if (rebuilt.length > 2) return rebuilt;
  }

  // Last resort: drop unsupported ids from the interleaved stream.
  return raw.filter((id) => valid.has(id));
}

async function phonemeIdsFor(text, config) {
  const input = JSON.stringify([{ text: text.trim() }]);
  const espeakVoice = config.espeak?.voice || "de";
  return new Promise(async (resolve, reject) => {
    try {
      const module = await createPiperPhonemize({
        print: (data) => {
          try {
            const parsed = JSON.parse(data);
            const ids = adaptPhonemeIds(parsed, config.phoneme_id_map);
            if (!ids.length) {
              reject(new Error("No phoneme ids for text (empty after voice map)"));
              return;
            }
            resolve(ids);
          } catch (e) {
            reject(e);
          }
        },
        printErr: (message) => {
          reject(new Error(String(message)));
        },
        locateFile: (url) => {
          if (url.endsWith(".wasm")) return PHONEMIZE_WASM.href;
          if (url.endsWith(".data")) return PHONEMIZE_DATA.href;
          return url;
        },
      });
      module.callMain([
        "-l",
        espeakVoice,
        "--input",
        input,
        "--espeak_data",
        "/espeak-ng-data",
      ]);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * @param {string} text
 * @param {{ voiceId?: string, speakerKey?: string, rate?: number }} [opts]
 */
export async function synthesizeGerman(text, opts = {}) {
  const voiceId = opts.voiceId || readPiperVoicePref();
  await ensurePiperVoice(voiceId);
  const packed = voiceCache.get(voiceMeta(voiceId).id);
  if (!packed) throw new Error(`Voice not loaded: ${voiceId}`);

  const { session, config } = packed;
  const trimmed = String(text || "")
    .normalize("NFC")
    .trim();
  if (!trimmed) throw new Error("No text to synthesize");

  // rate 1 = model default (ordinary pace). <1 slower, >1 faster.
  const rate = Math.max(0.5, Math.min(1.4, opts.rate ?? 1));
  const baseLen = config.inference.length_scale ?? 1;
  const lengthScale = baseLen / rate;
  const noiseScale = config.inference.noise_scale;
  const noiseW = config.inference.noise_w;
  const sampleRate = config.audio.sample_rate;
  const speakerId = moodIdFor(voiceId, opts.speakerKey);

  const phonemeIds = await phonemeIdsFor(trimmed, config);
  const feeds = {
    input: new ort.Tensor("int64", phonemeIds, [1, phonemeIds.length]),
    input_lengths: new ort.Tensor("int64", [phonemeIds.length]),
    scales: new ort.Tensor("float32", [noiseScale, lengthScale, noiseW]),
  };
  if (config.speaker_id_map && Object.keys(config.speaker_id_map).length) {
    feeds.sid = new ort.Tensor("int64", [speakerId]);
  }

  const {
    output: { data: pcmRaw },
  } = await session.run(feeds);

  const pcm = new Float32Array(pcmRaw);
  let peak = 0;
  for (let i = 0; i < pcm.length; i += 64) {
    const a = Math.abs(pcm[i]);
    if (a > peak) peak = a;
  }

  return {
    wav: pcm2wav(pcm, 1, sampleRate),
    pcm,
    sampleRate,
    peak,
    voiceId: voiceMeta(voiceId).id,
  };
}

/** Build an AudioBuffer at the context sample rate (iOS-safe; skips decodeAudioData). */
function pcmToAudioBuffer(ctx, pcmIn, srcRate) {
  const pcm = pcmIn instanceof Float32Array ? pcmIn : new Float32Array(pcmIn);
  const dstRate = ctx.sampleRate || srcRate;
  if (dstRate === srcRate) {
    const buf = ctx.createBuffer(1, pcm.length, dstRate);
    buf.getChannelData(0).set(pcm);
    return buf;
  }
  const dstLen = Math.max(1, Math.floor((pcm.length * dstRate) / srcRate));
  const buf = ctx.createBuffer(1, dstLen, dstRate);
  const out = buf.getChannelData(0);
  const ratio = srcRate / dstRate;
  for (let i = 0; i < dstLen; i++) {
    const srcIdx = i * ratio;
    const i0 = Math.min(pcm.length - 1, Math.floor(srcIdx));
    const i1 = Math.min(pcm.length - 1, i0 + 1);
    const frac = srcIdx - i0;
    out[i] = pcm[i0] * (1 - frac) + pcm[i1] * frac;
  }
  return buf;
}

function duckKeepAlive(on) {
  if (!keepAliveGain) return;
  try {
    keepAliveGain.gain.value = on ? 0.00005 : 0.0008;
  } catch {
    /* ignore */
  }
}

async function playViaHtmlAudio(wav, opts, gen) {
  if (htmlUnlockInFlight) {
    try {
      await htmlUnlockInFlight;
    } catch {
      /* ignore */
    }
  }
  // iOS: allow blob play once the page audio session is active (blue speaker /
  // keep-alive), even if the silent-HTML prime failed earlier.
  const sessionLive =
    htmlMediaUnlocked || audioCtxUnlocked || !!keepAliveOsc;
  if (isIOSAudio() && !sessionLive) return false;

  const el = ensurePlayAudioEl();
  // Drop a WebAudio stream if one was attached earlier; it blocks WAV playback.
  if (el.srcObject) el.srcObject = null;
  // Clear prior blob handlers without pause() on iOS (keeps session).
  el.onended = null;
  el.onerror = null;
  el.onloadedmetadata = null;
  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch {
      /* ignore */
    }
    currentObjectUrl = null;
  }

  const url = URL.createObjectURL(
    new Blob([wav], { type: "audio/wav" })
  );
  currentObjectUrl = url;
  let started = false;

  await new Promise((resolve, reject) => {
    const cleanup = () => {
      el.onended = null;
      el.onerror = null;
      el.onloadedmetadata = null;
    };
    el.onerror = () => {
      cleanup();
      reject(new Error("HTMLAudioElement playback failed"));
    };
    el.onended = () => {
      cleanup();
      duckKeepAlive(false);
      if (gen === speakGen) opts?.onEnd?.();
      resolve();
    };
    el.onloadedmetadata = () => {
      if (gen !== speakGen) {
        cleanup();
        resolve();
        return;
      }
      opts?.onStart?.({
        durationMs: Math.max(200, (el.duration || 0) * 1000),
      });
    };
    el.muted = false;
    el.volume = 1;
    el.src = url;
    try {
      el.load();
    } catch {
      /* ignore */
    }
    duckKeepAlive(true);
    el.play().then(
      () => {
        started = true;
        htmlMediaUnlocked = true;
        console.info("[piper] HTMLAudio start", "dur=", el.duration);
      },
      (err) => {
        cleanup();
        duckKeepAlive(false);
        console.warn("[piper] HTMLAudio play() rejected", err?.name, err?.message);
        if (err?.name === "AbortError") resolve();
        else reject(err);
      }
    );
  });
  return started && gen === speakGen;
}

async function playViaWebAudio(wav, pcm, sampleRate, opts, gen) {
  // Never create AudioContext here — iOS would leave a post-gesture ctx suspended.
  const ctx = getAudioCtx();
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }
  if (ctx.state === "running") startKeepAlive(ctx);
  if (ctx.state !== "running") {
    console.warn("[piper] WebAudio ctx not running:", ctx.state);
    return false;
  }
  ensureStreamPlaying();
  if (gen !== speakGen) return false;

  if (currentSource) {
    try {
      currentSource.onended = null;
      currentSource.stop();
    } catch {
      /* ignore */
    }
    currentSource = null;
  }

  // Linux stream output is already playing — feed it PCM. decodeAudioData
  // on our WAV is also flaky in Chrome, so skip it there.
  let buffer;
  if (isIOSAudio() || isLinuxChromium()) {
    buffer = pcmToAudioBuffer(ctx, pcm, sampleRate);
  } else {
    try {
      buffer = await ctx.decodeAudioData(wav.slice(0));
    } catch (err) {
      console.warn("[piper] decodeAudioData failed, using PCM copy", err);
      buffer = pcmToAudioBuffer(ctx, pcm, sampleRate);
    }
  }
  if (gen !== speakGen) return false;

  let peak = 0;
  const ch = buffer.getChannelData(0);
  for (let i = 0; i < ch.length; i += 64) {
    const a = Math.abs(ch[i]);
    if (a > peak) peak = a;
  }
  if (peak < 0.001) {
    console.warn("[piper] WebAudio buffer near-silent, peak=", peak);
    return false;
  }

  const durationMs = Math.max(200, buffer.duration * 1000);
  opts?.onStart?.({ durationMs });

  duckKeepAlive(true);
  const gain = ctx.createGain();
  gain.gain.value = 1;
  if (!isIOSAudio() && streamOutputLive() && streamGain && streamGain.context === ctx) {
    gain.connect(streamGain);
  } else {
    gain.connect(ctx.destination);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  currentSource = source;

  await new Promise((resolve) => {
    source.onended = () => {
      if (currentSource === source) currentSource = null;
      duckKeepAlive(false);
      if (gen === speakGen) opts?.onEnd?.();
      resolve();
    };
    try {
      console.info(
        "[piper] WebAudio start",
        buffer.duration.toFixed(2),
        "s peak=",
        peak.toFixed(3),
        "ctxRate=",
        ctx.sampleRate,
        "ctx=",
        ctx.state
      );
      source.start(0);
    } catch (err) {
      console.error("Piper WebAudio start failed", err);
      duckKeepAlive(false);
      if (gen === speakGen) opts?.onError?.(err);
      resolve();
    }
  });
  return true;
}

async function playSynthesized(wav, pcm, sampleRate, opts, gen) {
  if (gen !== speakGen) {
    console.warn("[piper] play skipped — cancelled");
    return;
  }

  const ctx = getAudioCtx();
  console.info(
    "[piper] play routes ios=",
    isIOSAudio(),
    "ctx=",
    ctx?.state,
    "htmlUnlocked=",
    htmlMediaUnlocked,
    "keepalive=",
    !!keepAliveOsc,
    "stream=",
    streamOutputLive(),
    "pcm=",
    pcm?.length,
    "sr=",
    sampleRate
  );

  // Gesture-started media stream: feed it PCM. A later <audio>.play() of the
  // WAV is blocked once the voice-load await has left the click, and it also
  // detaches srcObject.
  const streamLive = !isIOSAudio() && streamOutputLive();
  const order = streamLive
    ? ["webaudio"]
    : ctx?.state === "running"
      ? ["webaudio", "html"]
      : ["html", "webaudio"];

  for (const how of order) {
    if (gen !== speakGen) return;
    try {
      if (how === "html") {
        if (await playViaHtmlAudio(wav, opts, gen)) return;
      } else if (await playViaWebAudio(wav, pcm, sampleRate, opts, gen)) {
        return;
      }
    } catch (err) {
      console.warn(`[piper] ${how} play failed`, err);
    }
  }

  pending = { wav, pcm, sampleRate, opts, gen };
  console.info(
    "[piper] audio queued — tap once more to hear speech (iOS autoplay)"
  );
  opts?.onError?.(new Error("Audio did not start"));
}

/**
 * @param {string} text
 * @param {{ voiceId?: string, speakerKey?: string, rate?: number, onStart?: Function, onEnd?: Function, onError?: Function }} [opts]
 */
export async function speakGermanPiper(text, opts = {}) {
  speakGen += 1;
  pending = null;
  // Do not pause the click-started stream; only stop a previous buffer.
  releasePlayback({ pauseMedia: false });
  const gen = speakGen;

  try {
    const voiceId = opts.voiceId || readPiperVoicePref();
    console.info(
      "[piper] synthesize:",
      voiceId,
      String(text).slice(0, 40)
    );
    const { wav, pcm, sampleRate, peak } = await synthesizeGerman(text, {
      rate: opts.rate,
      speakerKey: opts.speakerKey,
      voiceId,
    });
    if (gen !== speakGen) return;
    console.info(
      "[piper] synth ok",
      voiceId,
      pcm.length,
      "peak=",
      peak.toFixed(3)
    );
    await playSynthesized(wav, pcm, sampleRate, opts, gen);
  } catch (err) {
    console.error("[piper] speak failed", err);
    if (gen === speakGen) opts.onError?.(err);
  }
}
