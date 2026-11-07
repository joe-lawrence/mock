/**
 * Snow-Nomen Cases slope — initial Case curriculum alignment.
 *
 * Construction and noun IDs are the Case vocabulary records in
 * content/vocabulary/case.md (generated vocabulary.js). This file only
 * lists which IDs are eligible and which noun pairings are approved.
 * It never sets case, gender, article, or grading answers.
 */

/** Single-case constructions for the initial Cases slope (mixed-case excluded). */
export const SNOW_NOMEN_CONSTRUCTION_IDS = Object.freeze([
  "vocab.case.sehen",
  "vocab.case.haben",
  "vocab.case.fuer",
  "vocab.case.ohne",
  "vocab.case.brauchen",
  "vocab.case.suchen",
  "vocab.case.nehmen",
  "vocab.case.finden",
  "vocab.case.warten-auf",
  "vocab.case.helfen",
  "vocab.case.mit",
  "vocab.case.aus",
  "vocab.case.danken",
  "vocab.case.gefallen",
  "vocab.case.passen-zu",
]);

/** Mixed-case Case verbs — never generate on this slope. */
export const SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS = Object.freeze([
  "vocab.case.zeigen",
  "vocab.case.geben",
]);

/**
 * Canonical Case nouns for Snow-Nomen (20). Gender comes from lexicon
 * records, not from this list.
 */
export const SNOW_NOMEN_NOUN_IDS = Object.freeze([
  "vocab.case.ball",
  "vocab.case.bus",
  "vocab.case.hund",
  "vocab.case.mann",
  "vocab.case.schluessel",
  "vocab.case.stift",
  "vocab.case.zug",
  "vocab.case.frau",
  "vocab.case.jacke",
  "vocab.case.katze",
  "vocab.case.stadt",
  "vocab.case.tasche",
  "vocab.case.auto",
  "vocab.case.buch",
  "vocab.case.geschenk",
  "vocab.case.hemd",
  "vocab.case.kind",
  "vocab.case.ticket",
  "vocab.case.haus",
  "vocab.case.kleid",
]);

/**
 * Approved construction → noun pairings (editable). Filters combinations
 * only — does not determine case, gender, article, or grade.
 *
 * gefallen: dative experiencer only (Mann, Frau, Kind), never the thing liked.
 *
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const SNOW_NOMEN_COMPATIBILITY = Object.freeze({
  "vocab.case.sehen": Object.freeze([
    "vocab.case.mann",
    "vocab.case.frau",
    "vocab.case.hund",
    "vocab.case.katze",
    "vocab.case.ball",
    "vocab.case.bus",
    "vocab.case.zug",
    "vocab.case.auto",
    "vocab.case.buch",
  ]),
  "vocab.case.haben": Object.freeze([
    "vocab.case.auto",
    "vocab.case.hund",
    "vocab.case.schluessel",
    "vocab.case.ticket",
    "vocab.case.tasche",
    "vocab.case.buch",
    "vocab.case.haus",
  ]),
  "vocab.case.fuer": Object.freeze([
    "vocab.case.mann",
    "vocab.case.frau",
    "vocab.case.kind",
    "vocab.case.hund",
    "vocab.case.geschenk",
    "vocab.case.ticket",
    "vocab.case.zug",
  ]),
  "vocab.case.ohne": Object.freeze([
    "vocab.case.schluessel",
    "vocab.case.ticket",
    "vocab.case.auto",
    "vocab.case.tasche",
    "vocab.case.jacke",
    "vocab.case.hund",
  ]),
  "vocab.case.brauchen": Object.freeze([
    "vocab.case.schluessel",
    "vocab.case.ticket",
    "vocab.case.auto",
    "vocab.case.tasche",
    "vocab.case.buch",
    "vocab.case.bus",
  ]),
  "vocab.case.suchen": Object.freeze([
    "vocab.case.schluessel",
    "vocab.case.tasche",
    "vocab.case.ticket",
    "vocab.case.hund",
    "vocab.case.katze",
    "vocab.case.buch",
  ]),
  "vocab.case.nehmen": Object.freeze([
    "vocab.case.bus",
    "vocab.case.zug",
    "vocab.case.schluessel",
    "vocab.case.ticket",
    "vocab.case.tasche",
    "vocab.case.jacke",
  ]),
  "vocab.case.finden": Object.freeze([
    "vocab.case.schluessel",
    "vocab.case.ticket",
    "vocab.case.buch",
    "vocab.case.tasche",
    "vocab.case.hund",
    "vocab.case.katze",
  ]),
  "vocab.case.warten-auf": Object.freeze([
    "vocab.case.zug",
    "vocab.case.bus",
    "vocab.case.mann",
    "vocab.case.frau",
    "vocab.case.kind",
  ]),
  "vocab.case.helfen": Object.freeze([
    "vocab.case.mann",
    "vocab.case.frau",
    "vocab.case.kind",
    "vocab.case.hund",
  ]),
  "vocab.case.mit": Object.freeze([
    "vocab.case.auto",
    "vocab.case.bus",
    "vocab.case.zug",
    "vocab.case.schluessel",
    "vocab.case.hund",
    "vocab.case.tasche",
    "vocab.case.buch",
  ]),
  "vocab.case.aus": Object.freeze([
    "vocab.case.haus",
    "vocab.case.auto",
    "vocab.case.tasche",
  ]),
  "vocab.case.danken": Object.freeze([
    "vocab.case.mann",
    "vocab.case.frau",
    "vocab.case.kind",
  ]),
  "vocab.case.gefallen": Object.freeze([
    "vocab.case.mann",
    "vocab.case.frau",
    "vocab.case.kind",
  ]),
  "vocab.case.passen-zu": Object.freeze([
    "vocab.case.kleid",
    "vocab.case.hemd",
    "vocab.case.jacke",
    "vocab.case.tasche",
    "vocab.case.haus",
  ]),
});

/** Noun IDs that appear in at least one compatibility row (ski-deck candidates). */
export function snowNomenPlayableNounIds() {
  const ids = new Set();
  for (const list of Object.values(SNOW_NOMEN_COMPATIBILITY)) {
    for (const id of list) ids.add(id);
  }
  return [...ids];
}

/**
 * @param {string} constructionId
 * @param {string} nounId
 */
export function isCompatiblePair(constructionId, nounId) {
  const list = SNOW_NOMEN_COMPATIBILITY[constructionId];
  return Array.isArray(list) && list.includes(nounId);
}
