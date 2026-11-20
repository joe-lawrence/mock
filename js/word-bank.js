/**
 * Profile word bank and frame-built input (Appendix H.8).
 * Not a territory and not a second mastery score.
 * User cards stay gloss-only. Case sentences come from curriculum cards
 * and from frames whose units are already introduced.
 */

import { articleForm, nounAnalysis } from "../engine/nouns/noun.js";
import {
  CASE_ACCUSATIVE_CONCEPTS,
  CASE_FRAME_UNITS,
  composeCaseAccusativeItems,
  composeCaseFrameItems,
} from "../engine/nouns/practice-compose.js";
import {
  caseAccusativeUnlocked,
  caseDativeUnlocked,
  migrateCaseUnitIds,
  resolveCaseUnitId,
} from "../engine/nouns/case-unit-ids.js";
import { CASE_CHART_ID } from "../engine/nouns/declension-table.js";

export function emptyWordBank() {
  return { introducedUnits: [], cards: {} };
}

/**
 * @param {unknown} raw
 */
export function normalizeWordBank(raw) {
  if (!raw || typeof raw !== "object") return emptyWordBank();
  const src = /** @type {Record<string, unknown>} */ (raw);
  const introducedUnits = migrateCaseUnitIds(
    Array.isArray(src.introducedUnits)
      ? src.introducedUnits.filter((id) => typeof id === "string")
      : []
  );
  /** @type {Record<string, object>} */
  const cards = {};
  const rawCards =
    src.cards && typeof src.cards === "object"
      ? /** @type {Record<string, object>} */ (src.cards)
      : {};
  for (const card of Object.values(rawCards)) {
    if (!card || (card.source !== "curriculum" && card.source !== "user")) continue;
    if (!card.lemma || !card.id) continue;
    cards[String(card.id)] = {
      id: String(card.id),
      source: card.source,
      lemma: String(card.lemma),
      gloss: String(card.gloss || ""),
      unitId: card.unitId ? resolveCaseUnitId(String(card.unitId)) : null,
      introducedAt: Number(card.introducedAt) || 0,
      missedAt: card.missedAt == null ? null : Number(card.missedAt),
    };
  }
  return { introducedUnits: [...introducedUnits], cards };
}

function cloneBank(bank) {
  return normalizeWordBank(bank);
}

/**
 * Lemmas a Case unit introduces. Off-lexicon names are dropped.
 * @param {string} unitId
 */
export function lemmasIntroducedByUnit(unitId) {
  const canonical = resolveCaseUnitId(unitId);
  /** @type {string[]} */
  let lemmas = [];
  if (canonical === CASE_CHART_ID) {
    const items = composeCaseAccusativeItems({
      concepts: CASE_ACCUSATIVE_CONCEPTS,
    });
    lemmas = [...new Set(items.map((item) => item.lemma))];
  } else {
    const unit = CASE_FRAME_UNITS[canonical];
    if (!unit) return [];
    for (const frame of unit.frames) {
      for (const entry of frame.lemmas) {
        const lemma = typeof entry === "string" ? entry : entry.lemma;
        if (lemma && !lemmas.includes(lemma)) lemmas.push(lemma);
      }
    }
  }
  return lemmas.filter((lemma) => {
    const analysis = nounAnalysis(lemma);
    return analysis.known && analysis.gender;
  });
}

/**
 * @param {object} bank
 * @param {string} unitId
 * @param {number} [now]
 */
export function introduceUnit(bank, unitId, now = Date.now()) {
  const canonical = resolveCaseUnitId(unitId);
  const next = cloneBank(bank);
  if (!next.introducedUnits.includes(canonical)) next.introducedUnits.push(canonical);
  next.introducedUnits = migrateCaseUnitIds(next.introducedUnits);
  for (const lemma of lemmasIntroducedByUnit(canonical)) {
    const id = `curriculum:${lemma}`;
    if (next.cards[id]) continue;
    const analysis = nounAnalysis(lemma);
    next.cards[id] = {
      id,
      source: "curriculum",
      lemma,
      gloss: analysis.gloss || "",
      unitId: canonical,
      introducedAt: now,
      missedAt: null,
    };
  }
  return next;
}

/**
 * A gloss the learner typed. This does not write the shared lexicon.
 * @param {object} bank
 * @param {string} lemma
 * @param {string} gloss
 * @param {number} [now]
 */
export function addUserCard(bank, lemma, gloss, now = Date.now()) {
  const name = String(lemma || "").trim();
  const meaning = String(gloss || "").trim();
  if (!name || !meaning) return cloneBank(bank);
  const next = cloneBank(bank);
  const id = `user:${name}`;
  const prev = next.cards[id];
  next.cards[id] = {
    id,
    source: "user",
    lemma: name,
    gloss: meaning,
    unitId: null,
    introducedAt: prev?.introducedAt || now,
    missedAt: prev?.missedAt ?? null,
  };
  return next;
}

/** User cards never enter a Case frame. */
export function cardMayEnterCaseFrame(card) {
  return !!(card && card.source === "curriculum");
}

/**
 * @param {object} bank
 * @param {"path"|"list"} source
 */
export function reviewQueue(bank, source) {
  const normalized = normalizeWordBank(bank);
  const introduced = new Set(normalized.introducedUnits);
  const cards = Object.values(normalized.cards).filter((card) => {
    if (source === "list") return card.source === "user";
    return card.source === "curriculum" && introduced.has(card.unitId);
  });
  cards.sort((a, b) => {
    const am = a.missedAt || 0;
    const bm = b.missedAt || 0;
    if (am !== bm) return bm - am;
    return a.introducedAt - b.introducedAt;
  });
  return cards;
}

/**
 * Question kinds unlocked for this card. A gloss-only user card stays gloss.
 * H.8: ACC after case.chart / Topic 2; DAT after Topic 3.
 * @param {object} card
 * @param {readonly string[]} introducedUnits
 */
export function reviewKinds(card, introducedUnits) {
  if (!card) return [];
  if (card.source === "user") return card.gloss ? ["gloss"] : [];
  const units = migrateCaseUnitIds(introducedUnits || []);
  /** @type {string[]} */
  const kinds = [];
  if (card.gloss) kinds.push("gloss");
  const analysis = nounAnalysis(card.lemma);
  if (!analysis.known || !analysis.gender) return kinds;
  kinds.push("nominative");
  if (caseAccusativeUnlocked(units)) kinds.push("accusative");
  if (caseDativeUnlocked(units)) kinds.push("dative");
  return kinds;
}

/**
 * One choice question. evidenceIds stays empty so a miss cannot rewrite grammar.
 * @param {object} card
 * @param {object} bank
 */
export function buildReviewQuestion(card, bank) {
  const normalized = normalizeWordBank(bank);
  const kinds = reviewKinds(card, normalized.introducedUnits);
  const kind = kinds[kinds.length - 1];
  if (!kind) return null;
  const base = {
    id: `${card.id}:${kind}`,
    cardId: card.id,
    kind,
    cue: "",
    evidenceIds: [],
  };
  if (kind === "gloss") {
    const distractors = Object.values(normalized.cards)
      .filter((other) => other.id !== card.id && other.gloss && other.gloss !== card.gloss)
      .slice(0, 3)
      .map((other) => other.gloss);
    return {
      ...base,
      prompt: card.lemma,
      cue: "Gloss",
      correct: card.gloss,
      choices: [card.gloss, ...distractors],
    };
  }
  const analysis = nounAnalysis(card.lemma);
  if (kind === "nominative") {
    return {
      ...base,
      prompt: card.lemma,
      correct: analysis.article,
      choices: ["der", "die", "das"],
    };
  }
  if (kind === "accusative") {
    return {
      ...base,
      prompt: card.lemma,
      correct: articleForm(analysis.gender, { kind: "definite", case: "accusative" }),
      choices: ["den", "die", "das"],
    };
  }
  return {
    ...base,
    prompt: card.lemma,
    correct: articleForm(analysis.gender, { kind: "definite", case: "dative" }),
    choices: ["dem", "der", "den"],
  };
}

/**
 * @param {object} bank
 * @param {string} cardId
 * @param {boolean} correct
 * @param {number} [now]
 */
export function recordReviewResult(bank, cardId, correct, now = Date.now()) {
  const next = cloneBank(bank);
  const card = next.cards[cardId];
  if (card && !correct) card.missedAt = now;
  return { bank: next, evidenceIds: [] };
}

function curriculumLemmas(bank) {
  return Object.values(normalizeWordBank(bank).cards)
    .filter((card) => card.source === "curriculum")
    .map((card) => card.lemma);
}

/**
 * Every proved sentence from introduced frames and curriculum lemmas.
 * User cards are ignored. Anything the composer cannot prove is absent.
 * @param {object} bank
 */
export function provedInputSentences(bank) {
  const normalized = normalizeWordBank(bank);
  const introduced = new Set(normalized.introducedUnits);
  const lemmas = curriculumLemmas(normalized);
  if (!lemmas.length || !introduced.size) return [];
  /** @type {object[]} */
  const out = [];
  if (caseAccusativeUnlocked(introduced) || introduced.has(CASE_CHART_ID)) {
    const items = composeCaseAccusativeItems({
      concepts: CASE_ACCUSATIVE_CONCEPTS,
      lemmas,
    });
    for (const item of items) {
      if (!lemmas.includes(item.lemma)) continue;
      const analysis = nounAnalysis(item.lemma);
      if (!analysis.known || !analysis.gender) continue;
      out.push({
        id: `${item.contextId}.${item.lemma}`,
        text: item.sentence,
        lemma: item.lemma,
        gloss: analysis.gloss || "",
        contextId: item.contextId,
        unitId: CASE_CHART_ID,
      });
    }
  }
  for (const unitId of introduced) {
    const spec = CASE_FRAME_UNITS[unitId];
    if (!spec) continue;
    const items = composeCaseFrameItems(unitId, {
      concepts: spec.concepts,
      lemmas,
    });
    for (const item of items) {
      if (!lemmas.includes(item.lemma)) continue;
      const analysis = nounAnalysis(item.lemma);
      if (!analysis.known || !analysis.gender) continue;
      out.push({
        id: `${item.contextId}.${item.lemma}`,
        text: item.sentence,
        lemma: item.lemma,
        gloss: analysis.gloss || "",
        contextId: item.contextId,
        unitId,
      });
    }
  }
  return out;
}

/**
 * At most two proved sentences per introduced unit.
 * @param {object} bank
 */
export function composeInputPassage(bank) {
  const byUnit = new Map();
  for (const sentence of provedInputSentences(bank)) {
    const list = byUnit.get(sentence.unitId) || [];
    if (list.length >= 2) continue;
    list.push(sentence);
    byUnit.set(sentence.unitId, list);
  }
  return [...byUnit.values()].flat();
}

/** Comprehension taps write no grammar skill. */
export function comprehensionTap() {
  return { evidenceIds: [] };
}
