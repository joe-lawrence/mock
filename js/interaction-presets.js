/**
 * Interaction presets — named (stimulus × response) pairs (spec §7).
 *
 * Today's mode ids (`build`, `listen`, …) are preset ids. Slice 1: single
 * source of truth for what each preset means. Shells (Slice 2–3) will render
 * by stimulus/response; callers should resolve through this map.
 */

/** @typedef {string} StimulusId */
/** @typedef {string} ResponseId */
/** @typedef {string} PresetId */

/**
 * @typedef {object} InteractionPreset
 * @property {PresetId} id
 * @property {string} label
 * @property {StimulusId} stimulus
 * @property {ResponseId} response
 * @property {boolean} playable
 * @property {string} [blurb]
 * @property {number} [seedDifficulty] — 0 easy … 1 hard; Dealer prior (Slice 6)
 * @property {boolean} [planned] — catalog-only / coming soon
 */

/** Stimulus shell ids — renderers in stimulus-shells.js (Slice 3). */
export const STIMULUS = Object.freeze({
  VALUE: "value",
  TTS: "tts",
  DIGIT: "digit",
  CLOZE_FRAME: "cloze-frame",
  PROOFREAD_FRAME: "proofread-frame",
  VISUAL: "visual",
  SENTENCE: "sentence",
  WRITTEN_CONTEXT: "written-context",
  KARAOKE: "karaoke",
});

/** Response shell ids (Slice 2 will own renderers). */
export const RESPONSE = Object.freeze({
  BUILD_CHIPS: "build-chips",
  MULTI_SELECT: "multi-select",
  FREEFORM: "freeform",
  BINARY: "binary",
  /** Snap a dial / hands to a legal position (compass, clock). */
  DIAL: "dial",
});

/**
 * Canonical Numbers (+ shared) presets.
 * `id` matches legacy `numbersQuizMode` / curriculum `modes[]` entries.
 *
 * @type {Record<string, InteractionPreset>}
 */
export const INTERACTION_PRESETS = Object.freeze({
  build: {
    id: "build",
    label: "Build",
    stimulus: STIMULUS.VALUE,
    response: RESPONSE.BUILD_CHIPS,
    playable: true,
    seedDifficulty: 0.45,
    blurb: "Construct the German form from pieces.",
  },
  listen: {
    id: "listen",
    label: "Listen",
    stimulus: STIMULUS.TTS,
    response: RESPONSE.MULTI_SELECT,
    playable: true,
    seedDifficulty: 0.35,
    blurb:
      "Hear TTS, pick the match — numbers, forms, or sound contrasts.",
  },

  convert: {
    id: "convert",
    label: "Convert",
    stimulus: STIMULUS.DIGIT,
    response: RESPONSE.FREEFORM,
    playable: true,
    seedDifficulty: 0.55,
    blurb: "See the digit, type the German form — production.",
  },
  /** Generic written/value → multi-select (Nouns articles/gender; reusable). */
  choose: {
    id: "choose",
    label: "Choose",
    stimulus: STIMULUS.VALUE,
    response: RESPONSE.MULTI_SELECT,
    playable: true,
    seedDifficulty: 0.4,
    blurb: "See the cue, pick the matching form (article, gender, lemma…).",
  },
  cloze: {
    id: "cloze",
    label: "Cloze",
    stimulus: STIMULUS.CLOZE_FRAME,
    response: RESPONSE.MULTI_SELECT,
    playable: false,
    planned: true,
    seedDifficulty: 0.5,
    blurb: "Retired from allowlists — redundant with Build for now.",
  },
  proofread: {
    id: "proofread",
    label: "Proofread",
    stimulus: STIMULUS.PROOFREAD_FRAME,
    response: RESPONSE.BINARY,
    playable: true,
    seedDifficulty: 0.4,
    blurb: "Spot and fix a wrong spelling.",
  },
  visual: {
    id: "visual",
    label: "Visual",
    stimulus: STIMULUS.VISUAL,
    response: RESPONSE.MULTI_SELECT,
    playable: true,
    seedDifficulty: 0.5,
    blurb: "Read a pie chart or clock face — multi-select.",
  },
  "visual-freeform": {
    id: "visual-freeform",
    label: "Visual · type",
    stimulus: STIMULUS.VISUAL,
    response: RESPONSE.FREEFORM,
    playable: true,
    seedDifficulty: 0.65,
    blurb: "Read a clock/pie — type the German form (composed pair).",
  },
  /**
   * Written/spoken cue → set an interactive dial (compass needle, clock hands).
   * Reverse of Visual: production by pointing instead of naming.
   */
  "set-dial": {
    id: "set-dial",
    label: "Set dial",
    stimulus: STIMULUS.VALUE,
    response: RESPONSE.DIAL,
    playable: true,
    seedDifficulty: 0.6,
    blurb:
      "See the German form — set the compass, clock, or pie chart to match.",
  },
  sentence: {
    id: "sentence",
    label: "Sentence",
    stimulus: STIMULUS.SENTENCE,
    response: RESPONSE.MULTI_SELECT,
    playable: true,
    seedDifficulty: 0.55,
    blurb: "Read an ordinal inside a short sentence.",
  },
  read: {
    id: "read",
    label: "Read",
    stimulus: STIMULUS.WRITTEN_CONTEXT,
    response: RESPONSE.MULTI_SELECT,
    playable: false,
    planned: true,
    seedDifficulty: 0.6,
    blurb: "Number inside a short written phrase (planned).",
  },
  karaoke: {
    id: "karaoke",
    label: "Karaoke",
    stimulus: STIMULUS.KARAOKE,
    response: RESPONSE.MULTI_SELECT,
    playable: true,
    seedDifficulty: 0.3,
    blurb: "Syllable karaoke with stress.",
  },
});

/** @returns {InteractionPreset | null} */
export function getInteractionPreset(presetId) {
  if (!presetId) return null;
  return INTERACTION_PRESETS[presetId] || null;
}

/**
 * Whether a preset can run under carousel caps.
 * Proofread and typed visuals count as write. Pick stays available
 * unless Write or Listen is exclusive.
 * @param {string} modeId
 * @param {{ keyboard?: boolean|"only", audio?: boolean|"only" }} [caps]
 */
export function presetMatchesCaps(
  modeId,
  caps = { keyboard: true, audio: true }
) {
  const preset = getInteractionPreset(modeId);
  const isWrite =
    modeId === "convert" ||
    modeId === "proofread" ||
    modeId === "visual-freeform" ||
    preset?.response === RESPONSE.FREEFORM;
  const isListen = modeId === "listen" || preset?.stimulus === STIMULUS.TTS;
  if (caps.keyboard === "only") return isWrite;
  if (caps.audio === "only") return isListen;
  if (isListen && caps.audio === false) return false;
  if (isWrite && caps.keyboard === false) return false;
  return true;
}

/**
 * A step is dealt when one of its presets fits the caps.
 * An exclusive cap ignores a single mix id (Convert / Build / Listen):
 * Place value has no Convert quiz, but Proofread is still write.
 * @param {string[]} modeIds
 * @param {string} [mixMode]
 * @param {{ keyboard?: boolean|"only", audio?: boolean|"only" }} [caps]
 */
export function stepDealsForMix(
  modeIds,
  mixMode,
  caps = { keyboard: true, audio: true }
) {
  const ids = modeIds || [];
  const exclusive = caps.keyboard === "only" || caps.audio === "only";
  if (exclusive || mixMode === "either" || !mixMode) {
    return ids.some((id) => presetMatchesCaps(id, caps));
  }
  return ids.includes(mixMode) && presetMatchesCaps(mixMode, caps);
}

/**
 * Enrich a legacy mode descriptor with stimulus/response from the map.
 * @param {{ id: string, label?: string, playable?: boolean, blurb?: string }} mode
 */
export function enrichModeWithPreset(mode) {
  if (!mode?.id) return mode;
  const p = getInteractionPreset(mode.id);
  if (!p) {
    return {
      ...mode,
      presetId: mode.id,
      stimulus: null,
      response: null,
    };
  }
  return {
    ...mode,
    label: mode.label || p.label,
    playable: mode.playable ?? p.playable,
    blurb: mode.blurb || p.blurb,
    presetId: p.id,
    stimulus: p.stimulus,
    response: p.response,
    seedDifficulty: p.seedDifficulty,
    planned: p.planned || false,
  };
}

/**
 * Find a playable preset id for a stimulus×response pair (first match).
 * @param {StimulusId} stimulus
 * @param {ResponseId} response
 * @returns {PresetId | null}
 */
export function presetIdForPair(stimulus, response) {
  for (const p of Object.values(INTERACTION_PRESETS)) {
    if (p.stimulus === stimulus && p.response === response && p.playable) {
      return p.id;
    }
  }
  for (const p of Object.values(INTERACTION_PRESETS)) {
    if (p.stimulus === stimulus && p.response === response) return p.id;
  }
  return null;
}

/**
 * Normalize launch / deep-link query to a preset id.
 *
 * Accepts `stimulus=` + `response=` and/or `preset=`.
 * Interaction preset is no longer read from `mode=` (vocab learn/practice
 * still uses `mode=` elsewhere — that is not an interaction preset).
 *
 * @param {URLSearchParams | Record<string, string | null | undefined>} input
 * @returns {{ presetId: string | null, stimulus: string | null, response: string | null }}
 */
export function normalizeLaunchInteraction(input) {
  const get =
    typeof input?.get === "function"
      ? (k) => input.get(k)
      : (k) => input?.[k] ?? null;

  const preset = get("preset") || null;
  const stimulus = get("stimulus") || null;
  const response = get("response") || null;

  // Prefer explicit Q×A pair when both are present.
  if (stimulus && response) {
    const id = presetIdForPair(stimulus, response);
    if (id) {
      const p = getInteractionPreset(id);
      return { presetId: id, stimulus: p.stimulus, response: p.response };
    }
    return { presetId: null, stimulus, response };
  }

  if (preset && getInteractionPreset(preset)) {
    const p = getInteractionPreset(preset);
    return {
      presetId: p.id,
      stimulus: p.stimulus,
      response: p.response,
    };
  }

  if (preset) {
    return { presetId: preset, stimulus: null, response: null };
  }

  return { presetId: null, stimulus: null, response: null };
}

/** All preset ids (including planned). */
export function allPresetIds() {
  return Object.keys(INTERACTION_PRESETS);
}

/**
 * Shared matrix column order for curriculum-browse (every module).
 * Units mark · when a preset is not in their allowlist.
 */
export const MATRIX_PRESET_IDS = Object.freeze([
  "build",
  "listen",
  "convert",
  "choose",
  "proofread",
  "visual",
  "visual-freeform",
  "set-dial",
  "sentence",
  "karaoke",
]);
