/**
 * Artikel Climber word pool from Schnapp vocabulary (gendered items only).
 */

import {
  getVocabulary,
  vocabularyForScope,
  vocabularyForTopic,
} from "./generated/vocabulary.js";
import { factsForItem } from "./vocabulary-practice.js";
import { snowNomenPlayableNounIds } from "./artikel-skier-case-content.js";

const GENDER_SHORT = Object.freeze({
  masculine: "masc",
  feminine: "fem",
  neuter: "neut",
});

/**
 * @param {object} item — generated vocabulary item
 * @returns {{
 *   word: string,
 *   article: string,
 *   gender: "masc"|"fem"|"neut",
 *   vocabId: string,
 *   gloss: string,
 * }|null}
 */
export function climberWordFromItem(item) {
  if (!item) return null;
  const facts = factsForItem(item);
  const article = facts.article ? String(facts.article).toLowerCase() : "";
  const short = GENDER_SHORT[facts.gender] || null;
  if (!article || !short) return null;
  const word = String(facts.surface || "").trim();
  if (!word) return null;
  return {
    word,
    article,
    gender: short,
    vocabId: String(item.id || ""),
    gloss: String(facts.gloss || "").trim(),
  };
}

/**
 * Scope for one vocab nav unit / deck (same fields as Vocabulary Practice).
 * @param {object} deck
 */
function scopeFromDeck(deck) {
  /** @type {{ areas?: string[], introducedBy?: string[] }} */
  const scope = {};
  if (Array.isArray(deck?.vocabAreas) && deck.vocabAreas.length) {
    scope.areas = deck.vocabAreas;
  } else if (deck?.vocabArea) {
    scope.areas = [deck.vocabArea];
  }
  const introduced = Array.isArray(deck?.vocabIntroducedBy)
    ? deck.vocabIntroducedBy
    : deck?.vocabIntroducedBy
      ? [deck.vocabIntroducedBy]
      : [];
  if (introduced.length) scope.introducedBy = introduced;
  return scope;
}

/**
 * Gendered climber words for selected Vocabulary nav units.
 * @param {object[]} units
 * @returns {{ word: string, article: string, gender: "masc"|"fem"|"neut", vocabId: string }[]}
 */
export function climberWordsFromVocabUnits(units) {
  const out = [];
  const seen = new Set();
  for (const deck of units || []) {
    const topic = deck?.vocabTopic || deck?.territory;
    if (!topic || topic === "vocabulary") continue;
    const scope = scopeFromDeck(deck);
    for (const item of vocabularyForScope(topic, scope)) {
      if (!item?.id || seen.has(item.id)) continue;
      const word = climberWordFromItem(item);
      if (!word) continue;
      seen.add(item.id);
      out.push(word);
    }
  }
  return out;
}

/**
 * How many gendered words a single vocab section contributes.
 * @param {object} unit
 */
export function climberWordCountForUnit(unit) {
  return climberWordsFromVocabUnits(unit ? [unit] : []).length;
}

/**
 * Resolve words by vocab id list (tests / debugging).
 * @param {string[]} ids
 */
export function climberWordsFromIds(ids) {
  const out = [];
  const seen = new Set();
  for (const id of ids || []) {
    if (!id || seen.has(id)) continue;
    const word = climberWordFromItem(getVocabulary(id));
    if (!word) continue;
    seen.add(id);
    out.push(word);
  }
  return out;
}

/**
 * Case-curriculum nouns for Snow-Nomen Cases slope.
 * Only nouns that appear in the construction compatibility whitelist.
 * Gender/article come from the canonical lexicon-backed vocab record —
 * never hardcoded. Noun `governs` is curriculum intro metadata only and
 * must not drive case selection (that comes from the construction).
 * @returns {{
 *   word: string,
 *   article: string,
 *   gender: "masc"|"fem"|"neut",
 *   vocabId: string,
 *   gloss: string,
 *   plural: string|null,
 * }[]}
 */
export function caseSkiNounsFromVocab() {
  const out = [];
  const playable = new Set(snowNomenPlayableNounIds());
  for (const id of playable) {
    const item = getVocabulary(id);
    if (!item || item.type !== "noun" || item.topic !== "case") continue;
    const word = climberWordFromItem(item);
    if (!word) continue;
    const facts = factsForItem(item);
    const pluralRaw = facts.plural ? String(facts.plural).trim() : "";
    const plural =
      pluralRaw && pluralRaw !== word.word ? pluralRaw : null;
    out.push({
      ...word,
      plural,
    });
  }
  out.sort((a, b) => a.word.localeCompare(b.word, "de"));
  return out;
}
