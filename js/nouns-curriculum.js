/**
 * Nouns / Gender Shortcuts curriculum — Learn units vs practice families.
 *
 * Spec §7: Learn units own reference (Suffixes, Categories).
 * Practice families (Wugs, Real Words, Associations) hang under units — not peer Learn cards.
 * Quiz modalities (choose-article, …) are chosen after family; only choose ships today.
 */

/** @typedef {"wugs"|"real-words"|"association"} NounsPracticeFamilyId */
/** @typedef {"choose-article"} NounsQuizModalityId */

/**
 * @typedef {object} NounsPracticeFamily
 * @property {NounsPracticeFamilyId} id
 * @property {string} label
 * @property {boolean} playable
 * @property {string} [blurb]
 * @property {boolean} [intro] — soft “try first”
 */

/**
 * @typedef {object} NounsLearnUnit
 * @property {string} id
 * @property {string} label
 * @property {boolean} playable
 * @property {string} [blurb]
 * @property {string} chartTab — nounsChart tab id for Learn
 * @property {NounsPracticeFamily[]} families
 * @property {NounsQuizModalityId[]} [modalities] — allowlist; omit = choose-article only
 */

/** @type {NounsLearnUnit[]} */
export const GENDER_SHORTCUTS_UNITS = [
  {
    id: "suffixes",
    label: "Suffixes",
    playable: true,
    blurb: "Morphological cues (-ung, -chen, -ling…). Shared reference for Wugs and Real Words.",
    chartTab: "feminine",
    families: [
      {
        id: "wugs",
        label: "Wugs",
        playable: true,
        intro: true,
        blurb: "Novel nouns — apply suffix → gender, or ? if insufficient.",
      },
      {
        id: "real-words",
        label: "Real Words",
        playable: true,
        blurb: "Same task on cued lexicon lemmas. Skip ahead anytime.",
      },
    ],
    modalities: ["choose-article"],
  },
  {
    id: "categories",
    label: "Categories",
    playable: true,
    blurb: "Semantic / category associations — soft correlations, not laws.",
    chartTab: "categories",
    families: [
      {
        id: "association",
        label: "Associations",
        playable: true,
        intro: true,
        blurb: "Practice by suffix family with a soft ~80% readiness signal.",
      },
    ],
    modalities: ["choose-article"],
  },
];

/** Stub topics under Nouns (not Gender Shortcuts). */
export const NOUNS_STUB_TOPICS = [
  {
    id: "plurals",
    label: "Plurals",
    playable: false,
    blurb: "Productive plurals vs lexical facts — coming soon.",
  },
  {
    id: "articles",
    label: "Articles",
    playable: false,
    blurb: "Article forms as a bridge to Case — coming soon.",
  },
];

export const NOUNS_MODALITY_LABELS = {
  "choose-article": "Choose article",
  "type-article": "Type article",
};

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
  for (const u of GENDER_SHORTCUTS_UNITS) {
    if (u.families.some((f) => f.id === familyId)) return u.id;
  }
  return "suffixes";
}

/** Playable + planned modalities for UI chips. */
export function modalitiesForUnit(unitId) {
  const u = getGenderShortcutsUnit(unitId);
  const playable = new Set(u?.modalities || ["choose-article"]);
  const all = ["choose-article", "type-article"];
  return all.map((id) => ({
    id,
    label: NOUNS_MODALITY_LABELS[id] || id,
    playable: playable.has(id),
  }));
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
