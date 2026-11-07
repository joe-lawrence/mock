/**
 * Snow-Nomen Cases slope — color-match declension rows.
 *
 * Four gates: Masculine / Feminine / Neuter / Plural (fixed order).
 * Labels swap to the Acc or Dat row for definite or indefinite parity.
 * Indefinite plural uses kein-forms (keine / keinen).
 * Player matches noun color (or plural lane) → gate; article text is absorbed.
 *
 * Content: Case curriculum construction/noun IDs + compatibility whitelist.
 * Case comes from the construction's `governs`; gender from the noun lexicon
 * record; articles from the noun engine (`articleForm`). The whitelist only
 * filters which pairs may be generated.
 */

import { articleForm } from "../engine/nouns/noun.js";
import { getVocabulary } from "./generated/vocabulary.js";
import {
  isCompatiblePair,
  SNOW_NOMEN_COMPATIBILITY,
  SNOW_NOMEN_CONSTRUCTION_IDS,
  SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS,
  snowNomenPlayableNounIds,
} from "./artikel-skier-case-content.js";

/** @typedef {"acc"|"dat"} CaseId */
/** @typedef {"masc"|"fem"|"neut"} GenderId */
/** @typedef {"sg"|"pl"} NumberId */
/** @typedef {"def"|"indef"} ParityId */
/** @typedef {GenderId | "plur"} LaneId */

/** Fixed lane order — never shuffled. */
export const GENDER_LANES = Object.freeze(
  /** @type {const} */ (["masc", "fem", "neut", "plur"])
);

const GENDER_LONG = Object.freeze({
  masc: "masculine",
  fem: "feminine",
  neut: "neuter",
});

const CASE_LONG = Object.freeze({
  acc: "accusative",
  dat: "dative",
});

const SHORT_GENDER = Object.freeze({
  masculine: "masc",
  feminine: "fem",
  neuter: "neut",
});

/**
 * @typedef {{
 *   id: string,
 *   surface: string,
 *   case: CaseId,
 *   governs: string[],
 * }} CaseConstruction
 */

/**
 * Parse a curriculum `governs` list into a single CaseId, or null if mixed/empty.
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
 * Load one allowlisted construction from the Case vocabulary record.
 * @param {string} id
 * @returns {CaseConstruction|null}
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
  };
}

/** All eligible constructions for the initial Cases slope. */
export function loadSnowNomenConstructions() {
  /** @type {CaseConstruction[]} */
  const out = [];
  for (const id of SNOW_NOMEN_CONSTRUCTION_IDS) {
    const c = loadCaseConstruction(id);
    if (c) out.push(c);
  }
  return out;
}

/**
 * @param {CaseId} caseId
 * @param {ParityId} parity
 * @returns {[string, string, string, string]}
 */
export function gateRowForCase(caseId, parity) {
  const grammaticalCase = CASE_LONG[caseId] || "accusative";
  if (parity === "indef") {
    return [
      articleForm("masculine", {
        kind: "indefinite",
        number: "singular",
        case: grammaticalCase,
      }),
      articleForm("feminine", {
        kind: "indefinite",
        number: "singular",
        case: grammaticalCase,
      }),
      articleForm("neuter", {
        kind: "indefinite",
        number: "singular",
        case: grammaticalCase,
      }),
      // Engine has no plural indefinite; Case curriculum uses kein-forms.
      caseId === "dat" ? "keinen" : "keine",
    ];
  }
  return [
    articleForm("masculine", {
      kind: "definite",
      number: "singular",
      case: grammaticalCase,
    }),
    articleForm("feminine", {
      kind: "definite",
      number: "singular",
      case: grammaticalCase,
    }),
    articleForm("neuter", {
      kind: "definite",
      number: "singular",
      case: grammaticalCase,
    }),
    articleForm("masculine", {
      kind: "definite",
      number: "plural",
      case: grammaticalCase,
    }),
  ];
}

/**
 * Authoritative declined article for the trial noun (engine tables).
 * @param {CaseId} caseId
 * @param {GenderId} gender
 * @param {NumberId} number
 * @param {ParityId} parity
 */
export function correctCaseArticle(caseId, gender, number, parity) {
  const row = gateRowForCase(caseId, parity);
  if (number === "pl") return row[3];
  const idx = GENDER_LANES.indexOf(gender);
  return idx >= 0 && idx < 3 ? row[idx] : row[0];
}

/**
 * Constructions whose compatibility whitelist includes this noun.
 * Noun curriculum `governs` is ignored — case comes only from the construction.
 * @param {CaseConstruction[]} constructions
 * @param {{ vocabId?: string, word?: string }} noun
 */
export function constructionsForNoun(constructions, noun) {
  const list =
    Array.isArray(constructions) && constructions.length
      ? constructions
      : loadSnowNomenConstructions();
  const vocabId = String(noun?.vocabId || "");
  if (!vocabId) return [];
  return list.filter((c) => isCompatiblePair(c.id, vocabId));
}

/**
 * Pick a compatible construction for the SRS target noun.
 * @param {CaseConstruction[]|{ surface: string, case: CaseId, id?: string }[]} constructions
 * @param {{ vocabId?: string, word?: string }} noun
 */
export function pickGovernorForNoun(constructions, noun) {
  const pool = constructionsForNoun(
    /** @type {CaseConstruction[]} */ (constructions),
    noun
  );
  if (!pool.length) {
    // Legacy surface-only governors (tests): fall back to case match without whitelist.
    const legacy = Array.isArray(constructions) ? constructions : [];
    if (legacy.length && !legacy[0]?.id) {
      return legacy[Math.floor(Math.random() * legacy.length)];
    }
    const all = loadSnowNomenConstructions();
    return all[Math.floor(Math.random() * all.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Construction-first exercise pick (curriculum algorithm).
 * Optionally constrain to a preferred noun (SRS target).
 *
 * @param {{
 *   constructions?: CaseConstruction[],
 *   preferredNounId?: string|null,
 *   indefChance?: number,
 *   pluralChance?: number,
 *   nounById?: (id: string) => object|null,
 * }} [opts]
 */
export function pickCaseExercise(opts = {}) {
  const constructions = opts.constructions?.length
    ? opts.constructions
    : loadSnowNomenConstructions();
  const preferred = opts.preferredNounId
    ? String(opts.preferredNounId)
    : null;

  /** @type {CaseConstruction[]} */
  let constructionPool = constructions;
  if (preferred) {
    const withNoun = constructions.filter((c) =>
      isCompatiblePair(c.id, preferred)
    );
    if (withNoun.length) constructionPool = withNoun;
  }
  const construction =
    constructionPool[Math.floor(Math.random() * constructionPool.length)];
  if (!construction) return null;

  const nounIds = preferred
    ? [preferred].filter((id) => isCompatiblePair(construction.id, id))
    : [...(SNOW_NOMEN_COMPATIBILITY[construction.id] || [])];
  if (!nounIds.length) return null;
  const nounId = nounIds[Math.floor(Math.random() * nounIds.length)];
  const noun =
    typeof opts.nounById === "function" ? opts.nounById(nounId) : null;

  return {
    construction,
    nounId,
    noun,
    case: construction.case,
  };
}

/**
 * Build one trial. Displayed noun surface and correctArticle always derive
 * from the same `noun` argument (lexicon gender + optional plural form).
 * Case comes from the selected construction, never from noun.governs.
 *
 * @param {CaseConstruction[]|{ surface: string, case: CaseId }[]} governors
 * @param {{
 *   word: string,
 *   article: string,
 *   gender: GenderId,
 *   vocabId?: string,
 *   plural?: string|null,
 * }} noun
 * @param {{ indefChance?: number, pluralChance?: number, construction?: CaseConstruction|null }} [opts]
 */
export function buildCaseTrial(governors, noun, opts = {}) {
  const gov =
    opts.construction ||
    pickGovernorForNoun(
      /** @type {CaseConstruction[]} */ (governors),
      noun
    );
  const caseId = /** @type {CaseId} */ (gov.case);
  const indefChance = opts.indefChance ?? 0.38;
  const pluralChance = opts.pluralChance ?? 0.22;
  const parity = /** @type {ParityId} */ (
    Math.random() < indefChance ? "indef" : "def"
  );

  const lemma = String(noun.word || "").trim();
  const pluralSurface = String(noun.plural || "").trim();
  const canPlural = pluralSurface.length > 0 && pluralSurface !== lemma;
  const number = /** @type {NumberId} */ (
    canPlural && Math.random() < pluralChance ? "pl" : "sg"
  );
  const gender = /** @type {GenderId} */ (noun.gender || "masc");
  /** Surface shown in the prompt — must match number used for the article. */
  const displayNoun = number === "pl" ? pluralSurface : lemma;
  const gateArticles = gateRowForCase(caseId, parity);
  const article = correctCaseArticle(caseId, gender, number, parity);
  const trigger = gov.surface;
  /** @type {LaneId} */
  const tint = number === "pl" ? "plur" : gender;

  return {
    trigger,
    constructionId: gov.id || null,
    case: caseId,
    gender,
    number,
    parity,
    /** Lemma (SRS / word-level identity). */
    lemma,
    nounId: noun.vocabId || null,
    /** Prompt surface (sg lemma or plural form). */
    noun: displayNoun,
    correctArticle: article,
    ruleText: `${trigger} ${article}`,
    gateArticles,
    tint,
  };
}

/**
 * Extract single-case governors from generated vocab items, restricted to
 * the Snow-Nomen allowlist (excludes zeigen/geben and non-curriculum items).
 * @param {object[]} items
 * @returns {CaseConstruction[]}
 */
export function caseGovernorsFromVocabItems(items) {
  const allow = new Set(SNOW_NOMEN_CONSTRUCTION_IDS);
  const deny = new Set(SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS);
  /** @type {CaseConstruction[]} */
  const out = [];
  const seen = new Set();
  for (const item of items || []) {
    const id = String(item?.id || "");
    if (!id || deny.has(id) || !allow.has(id)) continue;
    const caseId = singleCaseFromGoverns(item.governs);
    if (!caseId) continue;
    const surface = String(item.surface || "").trim();
    if (!surface) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      surface,
      case: caseId,
      governs: Array.isArray(item.governs) ? [...item.governs] : [],
    });
  }
  return out.length ? out : loadSnowNomenConstructions();
}

/** @deprecated Use loadSnowNomenConstructions — kept for call sites. */
export const DEFAULT_CASE_GOVERNORS = loadSnowNomenConstructions();

export {
  SNOW_NOMEN_COMPATIBILITY,
  SNOW_NOMEN_CONSTRUCTION_IDS,
  SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS,
  isCompatiblePair,
  snowNomenPlayableNounIds,
};

/** Gender short code from a lexicon / vocab gender string. */
export function genderShortFromLexicon(gender) {
  return SHORT_GENDER[String(gender || "")] || null;
}
