/**
 * Nouns curriculum — Topic × Unit × interaction preset (same shape as Numbers).
 *
 * Spec §7: topics own soft arc + Learn reference (chartTab); units list
 * preset allowlists. Practice “families” are units (step ids).
 */

import {
  INTERACTION_PRESETS,
  getInteractionPreset,
  enrichModeWithPreset,
} from "./interaction-presets.js";
import {
  directionsForStepMode,
  isDirectionPlayable,
  DIRECTION,
  DEFAULT_DIRECTIONS,
} from "./reverse-direction.js";

export {
  directionsForStepMode,
  isDirectionPlayable,
  DIRECTION,
  DEFAULT_DIRECTIONS,
};

/**
 * @typedef {object} NounsStep
 * @property {string} id
 * @property {string} label
 * @property {boolean} playable
 * @property {string[]} [modes] — shared preset ids; order = soft intro
 * @property {string[]} [plannedModes] — coming-soon chips when !playable or extras
 * @property {Record<string, ("forward"|"reverse")[]>} [directions] — per-preset direction allowlist (default forward-only)
 * @property {string} [blurb]
 * @property {boolean} [intro] — soft “try first” unit under its topic
 * @property {string} [familyId] — @deprecated alias of id (launch / playlist)
 */

/**
 * @typedef {object} NounsTopic
 * @property {string} id
 * @property {string} label
 * @property {boolean} playable
 * @property {string} [blurb]
 * @property {string} [chartTab] — nounsChart tab for Learn
 * @property {NounsStep[]} steps
 */

/** @type {NounsTopic[]} */
export const NOUNS_TOPICS = [
  {
    id: "suffixes",
    label: "Suffixes",
    playable: true,
    blurb:
      "Morphological cues (-ung, -chen, -ling…). Shared reference for Wugs and Real Words.",
    chartTab: "feminine",
    steps: [
      {
        id: "wugs",
        label: "Wugs",
        playable: true,
        intro: true,
        modes: ["choose"],
        plannedModes: ["convert"],
        directions: { choose: ["forward", "reverse"] },
        blurb:
          "Novel nouns — apply suffix → gender, or ? if insufficient. Reverse stays on those wugs: article → pick a matching wug.",
      },
      {
        id: "real-words",
        label: "Real Words",
        playable: true,
        modes: ["choose"],
        plannedModes: ["convert"],
        directions: { choose: ["forward", "reverse"] },
        blurb:
          "Same task on cued lexicon lemmas. Reverse: article → pick the matching lemma.",
      },
      {
        id: "proofread",
        label: "Proofread",
        playable: true,
        modes: ["proofread"],
        blurb: "Is “der X” right? Richtig / Falsch.",
      },
    ],
  },
  {
    id: "categories",
    label: "Categories",
    playable: true,
    blurb:
      "Semantic category → gender discrimination: Recognition → Article → Imposter → Sentence.",
    chartTab: "categories",
    steps: [
      {
        id: "gender-recognition",
        label: "Gender Recognition",
        playable: true,
        intro: true,
        modes: ["choose"],
        blurb: "Named category → associated gender.",
      },
      {
        id: "article-application",
        label: "Article Application",
        playable: true,
        modes: ["choose"],
        plannedModes: ["convert"],
        blurb: "Use the category gender to pick der/die/das or ein/eine.",
      },
      {
        id: "gender-imposter",
        label: "Gender Imposter",
        playable: true,
        modes: ["choose"],
        blurb: "Three nouns share a gender — find the odd gender out.",
      },
      {
        id: "sentence-validation",
        label: "Sentence Validation",
        playable: true,
        modes: ["proofread"],
        blurb: "Is the article in this sentence correct for the category?",
      },
      {
        id: "cardinal-directions",
        label: "Cardinal directions",
        playable: true,
        modes: [
          "choose",
          "listen",
          "convert",
          "visual",
          "visual-freeform",
          "set-dial",
        ],
        directions: { convert: ["forward", "reverse"] },
        blurb:
          "Compass: listen / convert / name (MC or type) or set the needle from a German cue. Convert reverse: German → type English.",
      },
    ],
  },
  {
    id: "plurals",
    label: "Plurals",
    playable: true,
    blurb:
      "Nominative plural. Suffix to ending, then the same ending on a wug, then on a known noun.",
    chartTab: "plurals",
    steps: [
      {
        id: "plural-patterns",
        label: "Patterns",
        playable: true,
        intro: true,
        modes: ["build", "proofread"],
        blurb: "Suffix to ending. No noun yet.",
      },
      {
        id: "plural-wugs",
        label: "Wugs",
        playable: true,
        softAfter: "plural-patterns",
        modes: ["build", "choose", "proofread"],
        blurb: "The same ending on a wug.",
      },
      {
        id: "plural-real-words",
        label: "Real words",
        playable: true,
        softAfter: "plural-wugs",
        modes: ["build", "choose", "proofread"],
        blurb: "The same ending on a noun you know.",
      },
    ],
  },
  {
    id: "articles",
    label: "Articles",
    playable: false,
    blurb: "Article forms as a bridge to Case — coming soon.",
    steps: [
      {
        id: "nominative",
        label: "Nominative articles",
        playable: false,
        blurb: "der / die / das / ein / eine as observable forms.",
        plannedModes: ["choose", "convert", "proofread"],
      },
    ],
  },
];

/** @deprecated use NOUNS_TOPICS stubs — kept for hub “More topics” copy. */
export const NOUNS_STUB_TOPICS = NOUNS_TOPICS.filter((t) => !t.playable).map(
  (t) => ({
    id: t.id,
    label: t.label,
    playable: false,
    blurb: t.blurb || "",
  })
);

/**
 * Legacy Learn-unit shape for hub / playlist / carousel.
 * Derived from NOUNS_TOPICS — do not edit by hand.
 */
export const GENDER_SHORTCUTS_UNITS = NOUNS_TOPICS.filter((t) =>
  ["suffixes", "categories"].includes(t.id)
).map((t) => ({
  id: t.id,
  label: t.label,
  playable: t.playable,
  blurb: t.blurb,
  chartTab: t.chartTab,
  families: (t.steps || []).map((s) => ({
    id: s.id,
    label: s.label,
    playable: s.playable,
    intro: !!s.intro,
    blurb: s.blurb,
  })),
  /** @deprecated prefer modes on steps */
  modalities:
    t.id === "categories" ? ["category-gender"] : ["choose-article"],
}));

/** @deprecated legacy modality chip labels (carousel / practice-prefs). */
export const NOUNS_MODALITY_LABELS = {
  "choose-article": "Choose article",
  "type-article": "Type article",
  "category-gender": "Category → gender",
  choose: INTERACTION_PRESETS.choose.label,
  convert: INTERACTION_PRESETS.convert.label,
  proofread: INTERACTION_PRESETS.proofread.label,
};

export function getNounsTopic(topicId) {
  return NOUNS_TOPICS.find((t) => t.id === topicId) || null;
}

export function getNounsStep(topicId, stepId) {
  const topic = getNounsTopic(topicId);
  return topic?.steps?.find((s) => s.id === stepId) || null;
}

export function getGenderShortcutsUnit(unitId) {
  return GENDER_SHORTCUTS_UNITS.find((u) => u.id === unitId) || null;
}

export function familiesForUnit(unitId) {
  const u = getGenderShortcutsUnit(unitId);
  return (u?.families || []).filter((f) => f.playable);
}

export function introFamilyForUnit(unitId) {
  const fams = familiesForUnit(unitId);
  return fams.find((f) => f.intro) || fams[0] || null;
}

export function unitIdForFamily(familyId) {
  for (const t of NOUNS_TOPICS) {
    if ((t.steps || []).some((s) => s.id === familyId)) return t.id;
  }
  return "suffixes";
}

/** Topic id that owns a unit/step id (family id). */
export function topicIdForStep(stepId) {
  for (const t of NOUNS_TOPICS) {
    if ((t.steps || []).some((s) => s.id === stepId)) return t.id;
  }
  return null;
}

/**
 * Playable presets for a Nouns cell (allowlist; order = soft intro).
 * Same contract as Numbers `modesForStep`.
 */
export function modesForNounsStep(topicId, stepId) {
  const step = getNounsStep(topicId, stepId);
  if (!step?.playable) return [];
  const allowed = step.modes || ["choose"];
  return allowed
    .map((id) => {
      const p = getInteractionPreset(id);
      return p?.playable ? enrichModeWithPreset(p) : null;
    })
    .filter(Boolean);
}

/** Alias — presets for a unit (spec §7). */
export function quizzesForNounsStep(topicId, stepId) {
  return modesForNounsStep(topicId, stepId);
}

export function introModeForNounsStep(topicId, stepId) {
  return modesForNounsStep(topicId, stepId)[0] || null;
}

export function isNounsCellPlayable(topicId, stepId, modeId) {
  const topic = getNounsTopic(topicId);
  const step = getNounsStep(topicId, stepId);
  const mode = getInteractionPreset(modeId);
  if (!topic?.playable || !step?.playable || !mode?.playable) return false;
  return modesForNounsStep(topicId, stepId).some((m) => m.id === modeId);
}

/** Directions allowed for a Nouns cell (default forward-only). */
export function directionsForNounsCell(topicId, stepId, modeId) {
  return directionsForStepMode(getNounsStep(topicId, stepId), modeId);
}

export function isNounsDirectionPlayable(topicId, stepId, modeId, direction) {
  if (!isNounsCellPlayable(topicId, stepId, modeId)) return false;
  return isDirectionPlayable(getNounsStep(topicId, stepId), modeId, direction);
}

/** Planned preset chips (coming soon) for a step. */
export function plannedNounsModeChips(step) {
  const ids = step?.plannedModes || [];
  const live = new Set(step?.modes || []);
  return ids
    .filter((id) => !live.has(id))
    .map((id) => {
      const p = getInteractionPreset(id);
      return {
        id,
        label: p?.label || id,
        stimulus: p?.stimulus ?? null,
        response: p?.response ?? null,
        planned: true,
        playable: false,
      };
    });
}

/**
 * Legacy modality chips for carousel / practice-prefs.
 * Maps shared presets → old choose-article / type-article / category-gender ids.
 */
export function modalitiesForUnit(unitId) {
  const topic = getNounsTopic(unitId);
  const steps = topic?.steps || [];
  const liveIds = new Set();
  const plannedIds = new Set();
  for (const s of steps) {
    for (const id of s.modes || []) {
      if (s.playable) liveIds.add(id);
    }
    for (const id of s.plannedModes || []) plannedIds.add(id);
  }
  const chooseLive = liveIds.has("choose");
  const convertLive = liveIds.has("convert");
  const convertPlanned = plannedIds.has("convert") || convertLive;

  if (unitId === "categories") {
    return [
      {
        id: "category-gender",
        label: NOUNS_MODALITY_LABELS["category-gender"],
        playable: chooseLive,
      },
      {
        id: "choose-article",
        label: NOUNS_MODALITY_LABELS["choose-article"],
        playable: false,
      },
      {
        id: "type-article",
        label: NOUNS_MODALITY_LABELS["type-article"],
        playable: convertLive,
      },
    ];
  }
  return [
    {
      id: "choose-article",
      label: NOUNS_MODALITY_LABELS["choose-article"],
      playable: chooseLive,
    },
    {
      id: "type-article",
      label: NOUNS_MODALITY_LABELS["type-article"],
      playable: convertLive,
    },
    {
      id: "category-gender",
      label: NOUNS_MODALITY_LABELS["category-gender"],
      playable: false,
    },
  ].map((m) =>
    m.id === "type-article" && !m.playable && convertPlanned
      ? { ...m, playable: false }
      : m
  );
}

/**
 * Carousel / hub unit nodes for Gender Shortcuts learn units.
 * Practice families are not separate browse cards.
 */
export function genderShortcutsNavUnits() {
  return GENDER_SHORTCUTS_UNITS.map((u) => ({
    id: `nouns:gs:${u.id}`,
    title: u.label,
    type: "unit",
    territory: "nouns",
    learnUnitId: u.id,
    chartTab: u.chartTab,
    playable: u.playable,
  }));
}

/** Play carousel cards for the Plurals topic (one per unit). */
export function pluralNavUnits() {
  const topic = getNounsTopic("plurals");
  return (topic?.steps || []).map((s) => ({
    id: `nouns:plurals:${s.id}`,
    title: s.label,
    type: "unit",
    territory: "nouns",
    playable: !!s.playable,
    topicId: "plurals",
    stepId: s.playable ? s.id : undefined,
    chartTab: topic.chartTab || "plurals",
  }));
}
