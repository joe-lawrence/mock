/**
 * Guided Case picks an exercise instance inside the unit the dealer chose.
 * Presets stay on the unit. Sentences take turns: one shape each, until a
 * harder shape is earned on a sentence the learner already met.
 */

import { WEAK_ACCURACY } from "../engine/dealer.js";
import { EVIDENCE_GRAIN } from "./multi-grain-evidence.js";

/** Reasons that may ask the same sentence again, in the new shape. */
export const REPEAT_SENTENCE_REASONS = Object.freeze([
  "felt_too_easy",
  "edge_of_competence",
]);

/**
 * Identity of one case slot, shared by proofread, sentence, listen, and type.
 * Analysis cards stay on their own id so role and case remain different asks.
 * @param {{ target?: string, contextId?: string, lemma?: string, id?: string, sentence?: string, playId?: string }|null|undefined} card
 */
export function caseSentenceKey(card) {
  if (!card) return "";
  if (card.contextId && card.lemma) {
    return `${card.target || "article"}:${card.contextId}:${card.lemma}`;
  }
  if (card.id) return String(card.id).replace(/\.play\.[^.]+$/, "");
  return card.sentence || card.playId || "";
}

/**
 * @param {string} key
 * @returns {{ dealKey: string, presetId: string, sentenceKey: string }|null}
 */
function parseItemGrainKey(key) {
  const parts = String(key || "").split("×");
  if (parts.length < 3) return null;
  return {
    dealKey: parts[0],
    presetId: parts[1],
    sentenceKey: parts.slice(2).join("×"),
  };
}

/**
 * Sentence totals for one guided unit, summed across presets.
 * @param {string} dealKey
 * @param {Record<string, { kind?: string, correct?: number, total?: number }>|null|undefined} grains
 */
export function caseSentenceStats(dealKey, grains) {
  /** @type {Map<string, { correct: number, total: number, presets: string[] }>} */
  const map = new Map();
  if (!dealKey) return map;
  for (const [key, stat] of Object.entries(grains || {})) {
    if (stat?.kind !== EVIDENCE_GRAIN.ITEM) continue;
    const parsed = parseItemGrainKey(key);
    if (!parsed || parsed.dealKey !== dealKey) continue;
    const row = map.get(parsed.sentenceKey) || {
      correct: 0,
      total: 0,
      presets: [],
    };
    row.correct += stat.correct || 0;
    row.total += stat.total || 0;
    if (parsed.presetId && !row.presets.includes(parsed.presetId)) {
      row.presets.push(parsed.presetId);
    }
    map.set(parsed.sentenceKey, row);
  }
  return map;
}

/**
 * @param {readonly object[]} deck
 * @param {{
 *   dealKey?: string,
 *   grains?: Record<string, { kind?: string, correct?: number, total?: number }>|null,
 *   reasonCode?: string,
 *   heldSentenceKey?: string,
 * }} [opts]
 * @returns {number}
 */
export function pickCaseExerciseIndex(deck, opts = {}) {
  const cards = deck || [];
  if (cards.length <= 1) return 0;
  const held = opts.heldSentenceKey || "";
  const earnSame =
    !!held && REPEAT_SENTENCE_REASONS.includes(opts.reasonCode || "");
  if (earnSame) {
    const same = cards.findIndex((card) => caseSentenceKey(card) === held);
    if (same >= 0) return same;
  }

  const stats = caseSentenceStats(opts.dealKey || "", opts.grains);
  /** @type {number[]} */
  const untested = [];
  /** @type {number[]} */
  const weak = [];
  /** @type {number[]} */
  const rest = [];
  cards.forEach((card, index) => {
    const row = stats.get(caseSentenceKey(card));
    if (!row?.total) untested.push(index);
    else if (row.correct / row.total < WEAK_ACCURACY) weak.push(index);
    else rest.push(index);
  });

  const pool = untested.length
    ? untested
    : weak.length
      ? weak
      : rest.length
        ? rest
        : cards.map((_, index) => index);
  const skipped =
    held && pool.length > 1
      ? pool.filter((index) => caseSentenceKey(cards[index]) !== held)
      : pool;
  const choice = skipped.length ? skipped : pool;
  return choice[0] ?? 0;
}
