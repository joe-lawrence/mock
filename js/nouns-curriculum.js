/**
 * Nouns / Gender Shortcuts curriculum — Learn units vs practice families.
 *
 * Spec §7: Learn units own reference (Suffixes, Categories).
 * Practice families hang under units — not peer Learn cards.
 * Categories: Gender Recognition → Article Application → Gender Imposter → Sentence Validation.
 */

/** @typedef {"wugs"|"real-words"|"proofread"|"reverse-mc"|"gender-recognition"|"article-application"|"gender-imposter"|"sentence-validation"} NounsPracticeFamilyId */
/** @typedef {"choose-article"|"category-gender"} NounsQuizModalityId */

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
 * @property {NounsQuizModalityId[]} [modalities]
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
      {
        id: "proofread",
        label: "Proofread",
        playable: true,
        blurb: "Is “der X” right? Richtig / Falsch.",
      },
      {
        id: "reverse-mc",
        label: "Reverse",
        playable: true,
        blurb: "Article given — pick the matching lemma.",
      },
    ],
    modalities: ["choose-article"],
  },
  {
    id: "categories",
    label: "Categories",
    playable: true,
    blurb:
      "Semantic category → gender discrimination: Recognition → Article → Imposter → Sentence.",
    chartTab: "categories",
    families: [
      {
        id: "gender-recognition",
        label: "Gender Recognition",
        playable: true,
        intro: true,
        blurb: "Named category → associated gender.",
      },
      {
        id: "article-application",
        label: "Article Application",
        playable: true,
        blurb: "Use the category gender to pick der/die/das or ein/eine.",
      },
      {
        id: "gender-imposter",
        label: "Gender Imposter",
        playable: true,
        blurb: "Find the noun whose gender violates the category shortcut.",
      },
      {
        id: "sentence-validation",
        label: "Sentence Validation",
        playable: true,
        blurb: "Is the article in this sentence correct for the category?",
      },
    ],
    modalities: ["category-gender"],
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
  "category-gender": "Category → gender",
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

/** Playable + planned modalities for UI chips / caps eligibility. */
export function modalitiesForUnit(unitId) {
  const u = getGenderShortcutsUnit(unitId);
  const playable = new Set(u?.modalities || ["choose-article"]);
  const all = ["choose-article", "type-article", "category-gender"];
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
