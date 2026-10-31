/**
 * Vocabulary attempts count toward the curriculum unit that introduces the word.
 * They do not keep a separate mastery score.
 */

import { CASE_TOPICS } from "./case-curriculum.js";
import { vocabularyForScope } from "./generated/vocabulary.js";

/**
 * reference id → dealer key for the one curriculum unit that word belongs to.
 * Case ids are resolved from the curriculum (unitId → topic × step).
 */
const REFERENCE_DEAL_KEYS = Object.freeze({
  "numbers.overview": "numbers:cardinals:number-words",
  "numbers.decimals.komma": "numbers:decimals:komma-read",
  "numbers.decimals.money": "numbers:decimals:money-context",
  "numbers.fractions": "numbers:fractions:fraction-words",
  "numbers.time": "numbers:time:time-words",
  "numbers.dates": "numbers:dates:date-context",
  "numbers.measurements": "numbers:measurement:measure-context",
  "nouns.suffix.feminine": "nouns:suffixes:real-words",
  "nouns.suffix.masculine": "nouns:suffixes:real-words",
  "nouns.suffix.neuter": "nouns:suffixes:real-words",
  "nouns.categories": "nouns:categories:gender-recognition",
});

/**
 * @param {string} unitId — case step unit id, e.g. case.prep.fuer
 */
function caseDealKeyForUnitId(unitId) {
  for (const topic of CASE_TOPICS) {
    for (const step of topic.steps || []) {
      if (step.unitId === unitId && step.playable !== false && topic.playable !== false) {
        return `case:${topic.id}:${step.id}`;
      }
    }
  }
  return "";
}

/**
 * Dealer key of the curriculum unit associated with this vocabulary item.
 * @param {{ reference?: string[] }|null|undefined} item
 * @returns {string}
 */
export function associateDealKey(item) {
  const ref = item?.reference?.[0];
  if (!ref) return "";
  if (String(ref).startsWith("case.")) return caseDealKeyForUnitId(ref);
  return REFERENCE_DEAL_KEYS[ref] || "";
}

/**
 * Active vocabulary ids a guided vocab selection will ask, in deck order.
 * @param {object[]} decks — grouped vocab nav units
 * @returns {string[]}
 */
export function vocabItemIdsForDecks(decks) {
  const ids = [];
  const seen = new Set();
  for (const deck of decks || []) {
    /** @type {{ areas?: string[], introducedBy?: string[] }} */
    const scope = {};
    if (Array.isArray(deck?.vocabAreas) && deck.vocabAreas.length) {
      scope.areas = deck.vocabAreas;
    }
    const introduced = Array.isArray(deck?.vocabIntroducedBy)
      ? deck.vocabIntroducedBy
      : deck?.vocabIntroducedBy
        ? [deck.vocabIntroducedBy]
        : [];
    if (introduced.length) scope.introducedBy = introduced;
    const topic = deck?.vocabTopic || deck?.territory;
    if (!topic) continue;
    for (const item of vocabularyForScope(topic, scope)) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      ids.push(item.id);
    }
  }
  return ids;
}
