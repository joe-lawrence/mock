/**
 * Format-level hint ladders + support vector helpers (spec §8 / Slice 4+).
 *
 * Ladders are keyed by stimulus / response format — not per topic×unit×preset cell.
 * Named assisted/core templates remain internal seeds; Help → Hints chips are the learner control.
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
    answer: [],
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
    answer: ["liveCheck"],
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

/** Depth index of a Help rung (1…n); unknown → 0. */
export function helpRungDepth(rungId) {
  const i = HELP_LADDER_RUNGS.indexOf(rungId);
  return i >= 0 ? i + 1 : 0;
}

/**
 * Transitional: Assisted/Core → default support bits (help climb starts at 0).
 * @param {"assisted"|"core"|string} difficulty
 * @returns {SupportVector}
 */
export function supportPresetForDifficulty(difficulty) {
  if (difficulty === "core") {
    return {
      english: false,
      liveCheck: false,
      choiceHighlight: false,
      helpRung: 0,
      helpRungsOpened: [],
    };
  }
  return {
    english: true,
    liveCheck: true,
    choiceHighlight: true,
    helpRung: 0,
    helpRungsOpened: [],
  };
}

/**
 * Empty / reset vector for a new item, seeded from difficulty preset.
 * @param {"assisted"|"core"|string} [difficulty]
 * @returns {SupportVector}
 */
export function freshSupportVector(difficulty = "assisted") {
  const base = supportPresetForDifficulty(difficulty);
  return {
    ...base,
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
