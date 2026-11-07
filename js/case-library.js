/**
 * Shared Case content helpers for Vocabulary Practice and Snow-Nomen.
 *
 * Rules:
 * - Case comes from constructions (verbs / prepositions), never from noun.governs.
 * - Noun.governs is curriculum intro metadata only.
 * - Compatibility whitelist filters pairs; it does not set case/gender/article.
 */

import { articleForm } from "../engine/nouns/noun.js";
import { getVocabulary } from "./generated/vocabulary.js";
import {
  isCompatiblePair,
  SNOW_NOMEN_COMPATIBILITY,
  SNOW_NOMEN_CONSTRUCTION_IDS,
  SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS,
  SNOW_NOMEN_NOUN_IDS,
  snowNomenPlayableNounIds,
} from "./artikel-skier-case-content.js";

/** @typedef {"acc"|"dat"} CaseId */
/** @typedef {"masc"|"fem"|"neut"} GenderId */
/** @typedef {"def"|"indef"} ParityId */

export const GOVERNOR_TYPES = Object.freeze(
  new Set(["verb", "function_word", "verb_preposition", "preposition"])
);

export {
  isCompatiblePair,
  SNOW_NOMEN_COMPATIBILITY,
  SNOW_NOMEN_COMPATIBILITY as CASE_COMPATIBILITY,
  SNOW_NOMEN_CONSTRUCTION_IDS,
  SNOW_NOMEN_CONSTRUCTION_IDS as CASE_CONSTRUCTION_IDS,
  SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS,
  SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS as CASE_EXCLUDED_CONSTRUCTION_IDS,
  SNOW_NOMEN_NOUN_IDS,
  SNOW_NOMEN_NOUN_IDS as CASE_NOUN_IDS,
  snowNomenPlayableNounIds,
};

const CASE_LONG = Object.freeze({
  acc: "accusative",
  dat: "dative",
});

const GENDER_LONG = Object.freeze({
  masc: "masculine",
  fem: "feminine",
  neut: "neuter",
});

const SHORT_GENDER = Object.freeze({
  masculine: "masc",
  feminine: "fem",
  neuter: "neut",
});

/**
 * @param {unknown} governs
 * @returns {CaseId|null}
 */
export function singleCaseFromGoverns(governs) {
  const cases = (Array.isArray(governs) ? governs : [])
    .map((g) => String(g || "").toLowerCase())
    .filter((g) => g === "accusative" || g === "dative");
  if (cases.length !== 1) return null;
  return cases[0] === "dative" ? "dat" : "acc";
}

/**
 * @param {unknown} governs
 * @returns {string[]} accusative / dative ids (may be mixed)
 */
export function casesFromGoverns(governs) {
  return (Array.isArray(governs) ? governs : [])
    .map((g) => String(g || "").toLowerCase())
    .filter((g) => g === "accusative" || g === "dative");
}

/**
 * True when the item can govern case (quiz “takes the …” / ski construction).
 * @param {object|null|undefined} item
 */
export function isCaseGovernor(item) {
  if (!item || !GOVERNOR_TYPES.has(String(item.type || ""))) return false;
  return casesFromGoverns(item.governs).length > 0;
}

/**
 * @param {CaseId} caseId
 */
export function caseLongName(caseId) {
  return CASE_LONG[caseId] || "accusative";
}

/**
 * @param {GenderId|string} gender
 */
export function genderLongName(gender) {
  if (gender === "masc" || gender === "masculine") return "masculine";
  if (gender === "fem" || gender === "feminine") return "feminine";
  if (gender === "neut" || gender === "neuter") return "neuter";
  return "masculine";
}

/**
 * @param {string} gender — lexicon long or short
 * @returns {GenderId|null}
 */
export function genderShort(gender) {
  return SHORT_GENDER[String(gender || "")] || null;
}

/**
 * @param {string} id
 */
export function loadCaseConstruction(id) {
  if (SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS.includes(id)) return null;
  if (!SNOW_NOMEN_CONSTRUCTION_IDS.includes(id)) return null;
  const item = getVocabulary(id);
  if (!item || item.topic !== "case") return null;
  const caseId = singleCaseFromGoverns(item.governs);
  if (!caseId) return null;
  const surface = String(item.surface || "").trim();
  if (!surface) return null;
  return {
    id: String(item.id),
    surface,
    case: caseId,
    governs: Array.isArray(item.governs) ? [...item.governs] : [],
    item,
  };
}

export function loadCaseConstructions() {
  const out = [];
  for (const id of SNOW_NOMEN_CONSTRUCTION_IDS) {
    const c = loadCaseConstruction(id);
    if (c) out.push(c);
  }
  return out;
}

/**
 * Construction IDs whose whitelist includes this noun.
 * @param {string} nounId
 */
export function constructionIdsForNoun(nounId) {
  const id = String(nounId || "");
  if (!id) return [];
  const out = [];
  for (const [cid, nouns] of Object.entries(SNOW_NOMEN_COMPATIBILITY)) {
    if (nouns.includes(id)) out.push(cid);
  }
  return out;
}

/**
 * @param {object} nounItem — vocab noun record
 */
export function nounHasCaseFrames(nounItem) {
  if (!nounItem || nounItem.type !== "noun") return false;
  return constructionIdsForNoun(nounItem.id).length > 0;
}

/**
 * Pick a construction–noun frame for quiz/game generation.
 * Case from construction; gender from noun lexicon fields.
 *
 * @param {object} nounItem
 * @param {{
 *   preferredConstructionId?: string|null,
 *   parity?: ParityId,
 *   random?: () => number,
 * }} [opts]
 */
export function pickCaseFrameForNoun(nounItem, opts = {}) {
  if (!nounItem || nounItem.type !== "noun") return null;
  const nounId = String(nounItem.id || "");
  let cids = constructionIdsForNoun(nounId);
  if (!cids.length) return null;
  const prefer = opts.preferredConstructionId;
  if (prefer && cids.includes(prefer)) cids = [prefer];
  const rnd = typeof opts.random === "function" ? opts.random : Math.random;
  const construction = loadCaseConstruction(
    cids[Math.floor(rnd() * cids.length)]
  );
  if (!construction) return null;

  const genderLong =
    nounItem.derived?.gender ||
    genderLongName(nounItem.gender || "");
  const gender = genderShort(genderLong) || "masc";
  const parity = opts.parity === "indef" ? "indef" : "def";
  const grammaticalCase = caseLongName(construction.case);
  const article = declinedArticle({
    caseId: construction.case,
    gender,
    parity,
  });
  const surface = String(
    nounItem.surface || nounItem.derived?.lemma || ""
  ).trim();
  if (!surface || !article) return null;

  return {
    constructionId: construction.id,
    trigger: construction.surface,
    case: construction.case,
    caseLong: grammaticalCase,
    parity,
    gender,
    genderLong,
    nounId,
    noun: surface,
    article,
    phrase: `${article} ${surface}`,
    promptStem: `${construction.surface} ➔ ${surface}`,
  };
}

/**
 * Authoritative declined article (singular).
 * @param {{ caseId: CaseId, gender: GenderId, parity?: ParityId }} args
 */
export function declinedArticle({ caseId, gender, parity = "def" }) {
  const grammaticalCase = caseLongName(caseId);
  const g = genderLongName(gender);
  try {
    return articleForm(g, {
      kind: parity === "indef" ? "indefinite" : "definite",
      number: "singular",
      case: grammaticalCase,
    });
  } catch {
    return null;
  }
}

/**
 * MCQ article choices for a case row (unique forms + common confusions).
 * @param {CaseId} caseId
 * @param {ParityId} [parity]
 */
export function caseArticleChoiceList(caseId, parity = "def") {
  const grammaticalCase = caseLongName(caseId);
  const kind = parity === "indef" ? "indefinite" : "definite";
  const forms = [
    articleForm("masculine", { kind, number: "singular", case: grammaticalCase }),
    articleForm("feminine", { kind, number: "singular", case: grammaticalCase }),
    articleForm("neuter", { kind, number: "singular", case: grammaticalCase }),
  ];
  const unique = [];
  const seen = new Set();
  for (const f of forms) {
    if (seen.has(f)) continue;
    seen.add(f);
    unique.push(f);
  }
  // Ensure three options: add a cross-case distractor when masc/neut collide (dem).
  if (unique.length < 3) {
    const distractor =
      caseId === "dat"
        ? parity === "indef"
          ? "einen"
          : "den"
        : parity === "indef"
          ? "einem"
          : "dem";
    if (!seen.has(distractor)) unique.push(distractor);
  }
  return unique.map((form) => ({ id: form, label: form }));
}
