/**
 * Format-level hint ladders + support vector helpers (spec §8 / Slice 4+).
 *
 * Ladders are keyed by stimulus / response format — not per topic×unit×preset cell.
 * Default layer seed + session prefs; named assisted/core templates only for tests / launch difficulty=.
 */

import { STIMULUS, RESPONSE } from "./interaction-presets.js";

/** Question-side Help sheet climb order (matches help-sheet cards). */
export const HELP_LADDER_RUNGS = Object.freeze([
  "hint",
  "vocab",
  "pattern",
  "full",
]);

/**
 * @typedef {{ english?: boolean, liveCheck?: boolean, choiceHighlight?: boolean, helpRung?: number, helpRungsOpened?: string[] }} SupportVector
 */

/** Learner-toggleable answer/prompt layers (Help climb stays on the Help sheet). */
export const SUPPORT_LAYER_DEFS = Object.freeze([
  {
    id: "english",
    label: "English cue",
    blurb: "Show an English cue in the prompt when available.",
  },
  {
    id: "liveCheck",
    label: "Live check",
    blurb: "Green/red feedback while typing freeform answers.",
  },
  {
    id: "choiceHighlight",
    label: "Choice highlight",
    blurb: "Gender colors on choices; suffix mark (Zeit-ung) when relevant.",
  },
]);

const LAYER_DEF_BY_ID = Object.freeze(
  Object.fromEntries(SUPPORT_LAYER_DEFS.map((d) => [d.id, d]))
);

/**
 * Merge session prefs onto a vector (Help climb fields preserved unless cleared).
 * @param {SupportVector} vector
 * @param {Partial<SupportVector>|null|undefined} prefs
 */
export function applySupportPrefs(vector, prefs) {
  const next = {
    english: !!vector?.english,
    liveCheck: !!vector?.liveCheck,
    choiceHighlight: !!vector?.choiceHighlight,
    helpRung: Number(vector?.helpRung) || 0,
    helpRungsOpened: [...(vector?.helpRungsOpened || [])],
  };
  if (!prefs) return next;
  for (const def of SUPPORT_LAYER_DEFS) {
    if (typeof prefs[def.id] === "boolean") next[def.id] = prefs[def.id];
  }
  return next;
}

/**
 * Toggle one layer on a vector.
 * @param {SupportVector} vector
 * @param {string} layerId
 * @param {boolean} on
 */
export function setSupportLayer(vector, layerId, on) {
  return applySupportPrefs(vector, { [layerId]: !!on });
}

/**
 * Whether a vector matches the Assisted or Core named preset (ignore Help climb).
 * @param {SupportVector} vector
 * @returns {"assisted"|"core"|"custom"}
 */
export function supportPresetName(vector) {
  const a = supportPresetForDifficulty("assisted");
  const c = supportPresetForDifficulty("core");
  const same = (x, y) =>
    !!x.english === !!y.english &&
    !!x.liveCheck === !!y.liveCheck &&
    !!x.choiceHighlight === !!y.choiceHighlight;
  if (same(vector, a)) return "assisted";
  if (same(vector, c)) return "core";
  return "custom";
}

/**
 * Format ladders: which answer-side layers apply for a stimulus/response pair.
 * Question ladder is always HELP_LADDER_RUNGS when Help is available.
 */
export const FORMAT_HINT_LADDERS = Object.freeze({
  [STIMULUS.DIGIT]: {
    question: HELP_LADDER_RUNGS,
    answer: ["english", "liveCheck"],
  },
  [STIMULUS.VALUE]: {
    question: HELP_LADDER_RUNGS,
    // English cue (gloss / pattern note) when the prompt has one.
    answer: ["english"],
  },
  [STIMULUS.TTS]: {
    question: HELP_LADDER_RUNGS,
    answer: ["replay"],
  },
  [STIMULUS.VISUAL]: {
    question: HELP_LADDER_RUNGS,
    answer: [],
  },
  [STIMULUS.PROOFREAD_FRAME]: {
    question: HELP_LADDER_RUNGS,
    // Freeform Fix-the-spelling: live check. Binary Right/Wrong also uses this
    // stimulus — liveCheck is a no-op there (no typing shell).
    answer: ["liveCheck", "english"],
  },
  [STIMULUS.SENTENCE]: {
    question: HELP_LADDER_RUNGS,
    answer: [],
  },
  [STIMULUS.CLOZE_FRAME]: {
    question: HELP_LADDER_RUNGS,
    answer: [],
  },
  [STIMULUS.WRITTEN_CONTEXT]: {
    question: HELP_LADDER_RUNGS,
    answer: [],
  },
  [RESPONSE.FREEFORM]: {
    answer: ["liveCheck"],
  },
  [RESPONSE.MULTI_SELECT]: {
    answer: ["choiceHighlight"],
  },
  [RESPONSE.BUILD_CHIPS]: {
    answer: [],
  },
  [RESPONSE.BINARY]: {
    answer: [],
  },
});

/**
 * @param {{ stimulus?: string, response?: string }} formats
 */
export function ladderForFormats(formats = {}) {
  const q = new Set();
  const a = new Set();
  const stim = FORMAT_HINT_LADDERS[formats.stimulus];
  const resp = FORMAT_HINT_LADDERS[formats.response];
  for (const id of stim?.question || HELP_LADDER_RUNGS) q.add(id);
  for (const id of stim?.answer || []) a.add(id);
  for (const id of resp?.answer || []) a.add(id);
  return {
    question: [...q],
    answer: [...a],
  };
}

/**
 * Learner-toggleable layer defs for this stimulus×response (omit no-ops).
 * @param {{ stimulus?: string, response?: string }} formats
 */
export function toggleableLayersForFormats(formats = {}) {
  const { answer } = ladderForFormats(formats);
  return answer
    .map((id) => LAYER_DEF_BY_ID[id])
    .filter(Boolean);
}

/**
 * Peel order when reducing help (first id turns off first).
 * Curriculum advisors may override later via authored tables.
 */
export const ASSIST_PEEL_ORDER = Object.freeze([
  "english",
  "liveCheck",
  "choiceHighlight",
]);

/**
 * Learner-facing assistance presets (support-vector templates, not mastery levels).
 * Exact layers applied still depend on the question format.
 */
export const ASSIST_LEARNER_PRESETS = Object.freeze([
  {
    id: "independent",
    label: "Independent",
    blurb: "Minimal cues; retrieve the answer yourself.",
  },
  {
    id: "some",
    label: "Some help",
    blurb: "A few useful cues and hints.",
  },
  {
    id: "more",
    label: "More help",
    blurb: "Rich scaffolding and reference support.",
  },
]);

/**
 * Applicable layer ids for formats, in peel order.
 * @param {{ stimulus?: string, response?: string }} formats
 * @returns {string[]}
 */
export function assistLayersForFormats(formats = {}) {
  const ids = new Set(toggleableLayersForFormats(formats).map((d) => d.id));
  return ASSIST_PEEL_ORDER.filter((id) => ids.has(id));
}

/**
 * Number of peel stops (0 = all applicable on … n = all off).
 * @param {{ stimulus?: string, response?: string }} formats
 */
export function assistStopCount(formats = {}) {
  return assistLayersForFormats(formats).length + 1;
}

/**
 * Layer prefs for a peel stop (0 = all on among applicable).
 * @param {number} stop
 * @param {{ stimulus?: string, response?: string }} formats
 */
export function layersForAssistStop(stop, formats = {}) {
  const layers = assistLayersForFormats(formats);
  const k = Math.max(0, Math.min(Number(stop) || 0, layers.length));
  /** @type {Record<string, boolean>} */
  const prefs = {};
  for (let i = 0; i < layers.length; i++) {
    prefs[layers[i]] = i >= k;
  }
  return prefs;
}

/**
 * Nearest valid peel stop for a vector on this format.
 * @param {SupportVector|null|undefined} vector
 * @param {{ stimulus?: string, response?: string }} formats
 */
export function assistStopFromVector(vector, formats = {}) {
  const layers = assistLayersForFormats(formats);
  if (!layers.length) return 0;
  for (let k = 0; k <= layers.length; k++) {
    const want = layersForAssistStop(k, formats);
    if (layers.every((id) => !!vector?.[id] === want[id])) return k;
  }
  const on = layers.filter((id) => !!vector?.[id]).length;
  return layers.length - on;
}

/**
 * Peel stop for a learner preset on this format.
 * @param {"independent"|"some"|"more"|string} presetId
 * @param {{ stimulus?: string, response?: string }} formats
 */
export function stopForAssistPreset(presetId, formats = {}) {
  const n = assistLayersForFormats(formats).length;
  if (presetId === "more") return 0;
  if (presetId === "independent") return n;
  // some — middle peel (format-dependent)
  return Math.floor(n / 2);
}

/**
 * Layer prefs for a learner preset (only applicable format layers).
 * @param {"independent"|"some"|"more"|string} presetId
 * @param {{ stimulus?: string, response?: string }} formats
 */
export function layersForAssistPreset(presetId, formats = {}) {
  return layersForAssistStop(stopForAssistPreset(presetId, formats), formats);
}

/**
 * Nearest learner preset for a vector on this format.
 * @param {SupportVector|null|undefined} vector
 * @param {{ stimulus?: string, response?: string }} formats
 * @returns {"independent"|"some"|"more"}
 */
export function assistPresetFromVector(vector, formats = {}) {
  const n = assistLayersForFormats(formats).length;
  const stop = assistStopFromVector(vector, formats);
  if (n === 0 || stop <= 0) return "more";
  if (stop >= n) return "independent";
  return "some";
}

/**
 * Distinct preset ids for the stepper on this format (skips duplicate peels).
 * Order: more help → some help → independent.
 * @param {{ stimulus?: string, response?: string }} formats
 * @returns {("more"|"some"|"independent")[]}
 */
export function assistPresetSteps(formats = {}) {
  /** @type {("more"|"some"|"independent")[]} */
  const order = ["more", "some", "independent"];
  /** @type {("more"|"some"|"independent")[]} */
  const out = [];
  const seen = new Set();
  for (const id of order) {
    const stop = stopForAssistPreset(id, formats);
    if (seen.has(stop)) continue;
    seen.add(stop);
    out.push(id);
  }
  return out.length ? out : ["more"];
}

/**
 * Display label for a learner preset id.
 * @param {"independent"|"some"|"more"|string} presetId
 */
export function assistPresetLabel(presetId) {
  return (
    ASSIST_LEARNER_PRESETS.find((p) => p.id === presetId)?.label || "Assistance"
  );
}

/**
 * @param {number} stop
 * @param {{ stimulus?: string, response?: string }} formats
 */
export function assistStopLabel(stop, formats = {}) {
  return assistPresetLabel(
    assistPresetFromVector(layersForAssistStop(stop, formats), formats)
  );
}

/** Depth index of a Help rung (1…n); unknown → 0. */
export function helpRungDepth(rungId) {
  const i = HELP_LADDER_RUNGS.indexOf(rungId);
  return i >= 0 ? i + 1 : 0;
}

/** Default layer seed when session prefs are unset — Independent (no assist). */
export const DEFAULT_SUPPORT_LAYERS = Object.freeze({
  english: false,
  liveCheck: false,
  choiceHighlight: false,
});

/** Full scaffolding template (launch difficulty=assisted / More help). */
export const ASSISTED_SUPPORT_LAYERS = Object.freeze({
  english: true,
  liveCheck: true,
  choiceHighlight: true,
});

/**
 * Named templates (tests / launch difficulty= → prefs). Not a learner menu.
 * @param {"assisted"|"core"|string} difficulty
 * @returns {SupportVector}
 */
export function supportPresetForDifficulty(difficulty) {
  if (difficulty === "core") {
    return {
      ...DEFAULT_SUPPORT_LAYERS,
      helpRung: 0,
      helpRungsOpened: [],
    };
  }
  return {
    ...ASSISTED_SUPPORT_LAYERS,
    helpRung: 0,
    helpRungsOpened: [],
  };
}

/**
 * Layer prefs object from a named template (no Help climb fields).
 * @param {"assisted"|"core"|string} [difficulty]
 */
export function layerPrefsFromDifficulty(difficulty = "core") {
  const base = supportPresetForDifficulty(difficulty);
  return {
    english: !!base.english,
    liveCheck: !!base.liveCheck,
    choiceHighlight: !!base.choiceHighlight,
  };
}

/**
 * Empty / reset vector for a new item.
 * @param {"default"|"assisted"|"core"|string} [seed]
 * @returns {SupportVector}
 */
export function freshSupportVector(seed = "default") {
  if (seed === "core" || seed === "assisted") {
    return { ...supportPresetForDifficulty(seed) };
  }
  return {
    ...DEFAULT_SUPPORT_LAYERS,
    helpRung: 0,
    helpRungsOpened: [],
  };
}

/**
 * Record that the learner opened a Help rung (keeps max depth).
 * @param {SupportVector} vector
 * @param {string} rungId
 * @returns {SupportVector}
 */
export function climbHelpRung(vector, rungId) {
  const next = {
    english: !!vector?.english,
    liveCheck: !!vector?.liveCheck,
    choiceHighlight: !!vector?.choiceHighlight,
    helpRung: Number(vector?.helpRung) || 0,
    helpRungsOpened: [...(vector?.helpRungsOpened || [])],
  };
  const depth = helpRungDepth(rungId);
  if (depth > next.helpRung) next.helpRung = depth;
  if (rungId && !next.helpRungsOpened.includes(rungId)) {
    next.helpRungsOpened.push(rungId);
  }
  return next;
}

/**
 * Scalar hint depth for mastery weighting / Dealer (Slice 4+).
 * Help rungs dominate; live-check / english / choice highlight add light weight.
 * @param {SupportVector} vector
 */
export function hintDepthFromVector(vector) {
  if (!vector) return 0;
  let d = Number(vector.helpRung) || 0;
  if (vector.liveCheck) d += 0.5;
  if (vector.english) d += 0.5;
  if (vector.choiceHighlight) d += 0.25;
  return d;
}

/** Max theoretical depth for current format ladders (for independence weight). */
export function maxHintDepth() {
  return HELP_LADDER_RUNGS.length + 0.5 + 0.5 + 0.25;
}

/**
 * Weight for a correct attempt (1 = independent, lower = heavily scaffolded).
 * @param {number} hintDepth
 */
export function independenceWeight(hintDepth) {
  const max = maxHintDepth();
  if (!hintDepth || hintDepth <= 0) return 1;
  return Math.max(0.15, 1 - hintDepth / max);
}

/**
 * Snapshot fields for attempt / session-audit rows.
 * @param {SupportVector} vector
 * @param {{ stimulus?: string, response?: string, presetId?: string }} [ix]
 */
export function supportSnapshot(vector, ix = {}) {
  const hintDepth = hintDepthFromVector(vector);
  return {
    supportVector: {
      english: !!vector?.english,
      liveCheck: !!vector?.liveCheck,
      choiceHighlight: !!vector?.choiceHighlight,
      helpRung: Number(vector?.helpRung) || 0,
      helpRungsOpened: [...(vector?.helpRungsOpened || [])],
    },
    hintDepth,
    independenceWeight: independenceWeight(hintDepth),
    stimulus: ix.stimulus || null,
    response: ix.response || null,
    interactionPreset: ix.presetId || null,
  };
}
