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

/** @type {(() => (AudioContext | null)) | null} */
let audioCtxProvider = null;
/** @type {HTMLAudioElement | null} */
let playAudioEl = null;
/** True after a gesture successfully resumed the shared AudioContext. */
let audioUnlocked = false;
/** @type {AudioBufferSourceNode | null} */
let currentSource = null;
/** @type {string | null} */
let currentObjectUrl = null;
let speakGen = 0;

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

function releasePlayback() {
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
  if (playAudioEl) {
    try {
      playAudioEl.onended = null;
      playAudioEl.onerror = null;
      playAudioEl.pause();
    } catch {
      /* ignore */
    }
  }
  if (currentObjectUrl) {
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
}

/**
 * Gesture-only unlock via the shared AudioContext (silent buffer kick).
 * Avoids HTMLMediaElement.play() races that surface as AbortError when
 * switching voices quickly.
 */
export function unlockPiperAudio() {
  if (!userGestureActive()) {
    if (audioUnlocked) flushPending();
    return Promise.resolve(audioUnlocked);
  }

  const ctx = getAudioCtx();
  if (!ctx) return Promise.resolve(false);

  if (!playAudioEl) {
    playAudioEl = new Audio();
    playAudioEl.preload = "auto";
  }

  const kickSilent = () => {
    try {
      const buf = ctx.createBuffer(1, 1, ctx.sampleRate || 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch {
      /* ignore */
    }
    audioUnlocked = ctx.state === "running";
    if (audioUnlocked) flushPending();
    return audioUnlocked;
  };

  if (ctx.state === "suspended") {
    return ctx.resume().then(
      () => kickSilent(),
      () => false
    );
  }
  return Promise.resolve(kickSilent());
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

/**
 * Adapt phonemizer `phoneme_ids` to a voice's embedding table.
 *
 * Piper's phonemize output already intersperses pad ids (`_`) — required by
 * the VITS models. Remapping from `phonemes` strings without re-inserting
 * pads makes speech ~half-coherent. So we keep `phoneme_ids` as-is when
 * possible, and only drop ids missing from older "low" voices (max 129).
 */
function adaptPhonemeIds(result, phonemeIdMap) {
  const raw = Array.isArray(result?.phoneme_ids) ? result.phoneme_ids : [];
  if (!raw.length || !phonemeIdMap || !Object.keys(phonemeIdMap).length) {
    return raw;
  }

  const valid = new Set();
  for (const arr of Object.values(phonemeIdMap)) {
    for (const id of arr) valid.add(id);
  }

  // Full-vocab voices (e.g. thorsten_emotional): unchanged.
  if (raw.every((id) => valid.has(id))) return raw;

  // Older voices: strip unsupported symbols (extra diacritics / digit phones)
  // but preserve pad interleaving around the kept ids.
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
  const trimmed = String(text || "").trim();
  if (!trimmed) throw new Error("No text to synthesize");

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

async function playViaHtmlAudio(wav, opts, gen) {
  if (!playAudioEl || !audioUnlocked) return false;
  releasePlayback();

  const url = URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
  currentObjectUrl = url;
  let started = false;

  await new Promise((resolve, reject) => {
    const el = playAudioEl;
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
    el.src = url;
    el.play().then(
      () => {
        started = true;
      },
      (err) => {
        cleanup();
        // Overlapping load/pause — soft-fail so WebAudio can try.
        if (err?.name === "AbortError") resolve();
        else reject(err);
      }
    );
  });
  return started && gen === speakGen;
}

async function playViaWebAudio(wav, pcm, sampleRate, opts, gen) {
  const ctx = getAudioCtx();
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    if (!userGestureActive()) return false;
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  if (ctx.state !== "running") return false;
  if (gen !== speakGen) return false;

  releasePlayback();

  let buffer;
  try {
    buffer = await ctx.decodeAudioData(wav.slice(0));
  } catch (err) {
    console.warn("[piper] decodeAudioData failed, using PCM copy", err);
    const copy = pcm instanceof Float32Array ? pcm : new Float32Array(pcm);
    buffer = ctx.createBuffer(1, copy.length, sampleRate);
    buffer.getChannelData(0).set(copy);
  }
  if (gen !== speakGen) return false;

  const durationMs = Math.max(200, buffer.duration * 1000);
  opts?.onStart?.({ durationMs });

  const gain = ctx.createGain();
  gain.gain.value = 1;
  gain.connect(ctx.destination);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  currentSource = source;

  await new Promise((resolve) => {
    source.onended = () => {
      if (currentSource === source) currentSource = null;
      if (gen === speakGen) opts?.onEnd?.();
      resolve();
    };
    try {
      console.info("[piper] WebAudio start", buffer.duration.toFixed(2), "s");
      source.start(0);
    } catch (err) {
      console.error("Piper WebAudio start failed", err);
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
  if (ctx?.state === "running") {
    try {
      if (await playViaWebAudio(wav, pcm, sampleRate, opts, gen)) return;
    } catch (err) {
      console.warn("Piper WebAudio play failed", err);
    }
  }

  if (gen !== speakGen) return;

  try {
    if (await playViaHtmlAudio(wav, opts, gen)) return;
  } catch (err) {
    console.warn("Piper HTML play failed", err);
  }

  if (gen !== speakGen) return;

  try {
    if (await playViaWebAudio(wav, pcm, sampleRate, opts, gen)) return;
  } catch (err) {
    console.warn("Piper WebAudio play failed", err);
  }

  pending = { wav, pcm, sampleRate, opts, gen };
  console.info(
    "[piper] audio queued — tap anywhere once, then you should hear speech"
  );
}

/**
 * @param {string} text
 * @param {{ voiceId?: string, speakerKey?: string, rate?: number, onStart?: Function, onEnd?: Function, onError?: Function }} [opts]
 */
export async function speakGermanPiper(text, opts = {}) {
  speakGen += 1;
  pending = null;
  releasePlayback();
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
