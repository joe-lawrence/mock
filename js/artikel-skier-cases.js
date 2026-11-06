/**
 * Snow-Nomen Cases slope — color-match declension rows.
 *
 * Four gates: Masculine / Feminine / Neuter / Plural (fixed order).
 * Labels swap to the Acc or Dat row for definite or indefinite parity.
 * Indefinite plural uses kein-forms (keine / keinen).
 * Player matches noun color (or plural lane) → gate; article text is absorbed.
 */

/** @typedef {"acc"|"dat"} CaseId */
/** @typedef {"masc"|"fem"|"neut"} GenderId */
/** @typedef {"sg"|"pl"} NumberId */
/** @typedef {"def"|"indef"} ParityId */
/** @typedef {GenderId | "plur"} LaneId */

/** Fixed lane order — never shuffled. */
export const GENDER_LANES = Object.freeze(
  /** @type {const} */ (["masc", "fem", "neut", "plur"])
);

/**
 * Case-forcing triggers (prepositions / verbs). Prefer clear single-case governors.
 * @type {{ surface: string, case: CaseId }[]}
 */
export const DEFAULT_CASE_GOVERNORS = [
  { surface: "für", case: "acc" },
  { surface: "ohne", case: "acc" },
  { surface: "durch", case: "acc" },
  { surface: "sehen", case: "acc" },
  { surface: "haben", case: "acc" },
  { surface: "brauchen", case: "acc" },
  { surface: "suchen", case: "acc" },
  { surface: "nehmen", case: "acc" },
  { surface: "finden", case: "acc" },
  { surface: "warten auf", case: "acc" },
  { surface: "mit", case: "dat" },
  { surface: "aus", case: "dat" },
  { surface: "bei", case: "dat" },
  { surface: "helfen", case: "dat" },
  { surface: "danken", case: "dat" },
  { surface: "gefallen", case: "dat" },
  { surface: "passen zu", case: "dat" },
];

/**
 * Declension rows: [masc, fem, neut, plur] for each case × parity.
 * Indefinite plural = kein-forms.
 * @type {Record<ParityId, Record<CaseId, [string, string, string, string]>>}
 */
const ROW_TABLE = {
  def: {
    acc: ["den", "die", "das", "die"],
    dat: ["dem", "der", "dem", "den"],
  },
  indef: {
    acc: ["einen", "eine", "ein", "keine"],
    dat: ["einem", "einer", "einem", "keinen"],
  },
};

/**
 * @param {CaseId} caseId
 * @param {ParityId} parity
 * @returns {[string, string, string, string]}
 */
export function gateRowForCase(caseId, parity) {
  const row = ROW_TABLE[parity]?.[caseId];
  return row ? [...row] : [...ROW_TABLE.def.acc];
}

/**
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
 * @param {{ surface: string, case: CaseId }[]} governors
 * @param {{ word: string, article: string, gender: GenderId }} noun
 * @param {{ indefChance?: number, pluralChance?: number }} [opts]
 */
export function buildCaseTrial(governors, noun, opts = {}) {
  const list =
    Array.isArray(governors) && governors.length
      ? governors
      : DEFAULT_CASE_GOVERNORS;
  /** Prefer triggers that match the noun’s Case-lesson `governs` tag. */
  const wanted = Array.isArray(noun?.caseGoverns)
    ? noun.caseGoverns.filter((c) => c === "acc" || c === "dat")
    : [];
  const matched = wanted.length
    ? list.filter((g) => wanted.includes(g.case))
    : [];
  const pool = matched.length ? matched : list;
  const gov = pool[Math.floor(Math.random() * pool.length)];
  const caseId = gov.case;
  const indefChance = opts.indefChance ?? 0.38;
  const pluralChance = opts.pluralChance ?? 0.22;
  const parity = /** @type {ParityId} */ (
    Math.random() < indefChance ? "indef" : "def"
  );
  const number = /** @type {NumberId} */ (
    Math.random() < pluralChance ? "pl" : "sg"
  );
  const gender = /** @type {GenderId} */ (noun.gender || "masc");
  const gateArticles = gateRowForCase(caseId, parity);
  const article = correctCaseArticle(caseId, gender, number, parity);
  const trigger = gov.surface;
  /** @type {LaneId} */
  const tint = number === "pl" ? "plur" : gender;

  return {
    trigger,
    case: caseId,
    gender,
    number,
    parity,
    noun: noun.word,
    correctArticle: article,
    ruleText: `${trigger} ${article}`,
    /** Always [masc, fem, neut, plur] for the forced case row. */
    gateArticles,
    tint,
  };
}

/**
 * Extract single-case governors from generated vocab items.
 * @param {object[]} items
 * @returns {{ surface: string, case: CaseId }[]}
 */
export function caseGovernorsFromVocabItems(items) {
  /** @type {{ surface: string, case: CaseId }[]} */
  const out = [];
  const seen = new Set();
  const triggerTypes = new Set([
    "verb",
    "function_word",
    "verb_preposition",
    "preposition",
  ]);
  for (const item of items || []) {
    // Nouns also carry `governs` (lesson home) — never use them as triggers.
    if (!triggerTypes.has(String(item?.type || ""))) continue;
    const governs = Array.isArray(item?.governs) ? item.governs : [];
    const cases = governs
      .map((g) => String(g || "").toLowerCase())
      .filter((g) => g === "accusative" || g === "dative");
    if (cases.length !== 1) continue;
    const surface = String(item.surface || "").trim();
    if (!surface) continue;
    const caseId = /** @type {CaseId} */ (
      cases[0] === "dative" ? "dat" : "acc"
    );
    const key = `${surface}|${caseId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ surface, case: caseId });
  }
  return out.length ? out : [...DEFAULT_CASE_GOVERNORS];
}
