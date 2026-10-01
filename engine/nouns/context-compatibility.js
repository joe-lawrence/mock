/**
 * Context compatibility / naturalness gate.
 *
 * Grammatical validity is checked separately (validateComposition).
 * This module answers: is lemma × context a suitable beginner exercise?
 *
 * Runtime stays deterministic: category-level restrictions, sparse per-lemma
 * overrides, and (later) verb-frame denials — never an LLM naturalness judge.
 */

import { getGenderCategory } from "./categories.js";
import { articleForm, nounAnalysis } from "./noun.js";

/** Deterministic failure reason codes for discards / tests. */
export const CONTEXT_FAILURE = Object.freeze({
  ARTICLE_KIND: "article_kind_restricted",
  CONTEXT_DENIED: "context_denied",
  CONTEXT_NOT_ALLOWED: "context_not_allowed",
  /** Category opted out of generic article/sentence compose. */
  COMPOSE_INELIGIBLE: "compose_ineligible",
  /** Reserved — v1 has no verb-frame rules; data may still declare denials. */
  VERB_FRAME: "verb_frame_restricted",
  /** Umbrella used in discard logs when suitability fails. */
  CONTEXT_SUITABILITY: "context_suitability",
});

/**
 * @typedef {object} LexemeContextRestriction
 * @property {readonly ("definite"|"indefinite")[]} [articleKinds]
 * @property {readonly string[]} [denyContexts] — context ids never allowed
 * @property {readonly string[]} [allowContexts] — if set, only these context ids
 * @property {readonly string[]} [denyVerbFrames] — e.g. "verb.haben" (extensible; unused in v1 rules)
 */

/**
 * Sparse per-lemma overrides. Prefer category-level `articleKinds` / deny lists.
 * Add entries only when a category rule is too coarse.
 * @type {Readonly<Record<string, LexemeContextRestriction>>}
 */
export const LEXEME_CONTEXT_RESTRICTIONS = Object.freeze({
  // v1: empty — weather/mass handled via category.articleKinds
});

/**
 * @typedef {object} ResolvedContextRestrictions
 * @property {readonly ("definite"|"indefinite")[]|null} articleKinds
 * @property {readonly string[]} denyContexts
 * @property {readonly string[]|null} allowContexts
 * @property {readonly string[]} denyVerbFrames
 */

/**
 * Merge category defaults with optional per-lemma overrides.
 * @param {object|null} category
 * @param {string} lemma
 * @returns {ResolvedContextRestrictions}
 */
export function resolveContextRestrictions(category, lemma) {
  const lex = LEXEME_CONTEXT_RESTRICTIONS[lemma] || {};
  const articleKinds =
    lex.articleKinds != null
      ? Object.freeze([...lex.articleKinds])
      : category?.articleKinds?.length
        ? Object.freeze([...category.articleKinds])
        : null;

  const denyContexts = Object.freeze([
    ...new Set([
      ...(category?.denyContexts || []),
      ...(lex.denyContexts || []),
    ]),
  ]);

  const allowContexts =
    lex.allowContexts != null
      ? Object.freeze([...lex.allowContexts])
      : category?.allowContexts != null
        ? Object.freeze([...category.allowContexts])
        : null;

  const denyVerbFrames = Object.freeze([
    ...new Set([
      ...(category?.denyVerbFrames || []),
      ...(lex.denyVerbFrames || []),
    ]),
  ]);

  return Object.freeze({
    articleKinds,
    denyContexts,
    allowContexts,
    denyVerbFrames,
  });
}

/**
 * Verb requirement tag on a practice context, if any (`verb.sehen`, …).
 * @param {{ requires?: string[] }} ctx
 * @returns {string|null}
 */
export function contextVerbFrame(ctx) {
  const tag = (ctx?.requires || []).find((r) => String(r).startsWith("verb."));
  return tag || null;
}

/**
 * Assess pedagogical / contextual suitability (not grammar).
 * @param {string} categoryId
 * @param {string} lemma
 * @param {{ id: string, articleKind: string, requires?: string[] }} ctx
 * @returns {{ ok: true } | { ok: false, reason: string, detail?: string }}
 */
export function assessContextCompatibility(categoryId, lemma, ctx) {
  if (!ctx?.id) {
    return {
      ok: false,
      reason: CONTEXT_FAILURE.CONTEXT_SUITABILITY,
      detail: "missing_context",
    };
  }

  const category = getGenderCategory(categoryId);
  if (category?.composeEligible === false) {
    return {
      ok: false,
      reason: CONTEXT_FAILURE.COMPOSE_INELIGIBLE,
      detail: categoryId,
    };
  }

  const r = resolveContextRestrictions(category, lemma);

  if (r.articleKinds && !r.articleKinds.includes(ctx.articleKind)) {
    return {
      ok: false,
      reason: CONTEXT_FAILURE.ARTICLE_KIND,
      detail: `${ctx.articleKind}_not_in_${r.articleKinds.join("|")}`,
    };
  }

  if (r.denyContexts.includes(ctx.id)) {
    return {
      ok: false,
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
      detail: ctx.id,
    };
  }

  if (r.allowContexts && !r.allowContexts.includes(ctx.id)) {
    return {
      ok: false,
      reason: CONTEXT_FAILURE.CONTEXT_NOT_ALLOWED,
      detail: ctx.id,
    };
  }

  // Extensible verb-frame hook — v1 ships no denyVerbFrames data.
  const verb = contextVerbFrame(ctx);
  if (verb && r.denyVerbFrames.includes(verb)) {
    return {
      ok: false,
      reason: CONTEXT_FAILURE.VERB_FRAME,
      detail: verb,
    };
  }

  return { ok: true };
}

/**
 * Best-effort surface for discard logs (may be null if forms unavailable).
 * @param {string} lemma
 * @param {{ articleKind: string, case: string, number: string, sentence: Function }} ctx
 */
export function previewCompositionCandidate(lemma, ctx) {
  try {
    const analysis = nounAnalysis(lemma);
    if (!analysis.known || !analysis.gender) return null;
    const nounForm =
      ctx.number === "plural"
        ? analysis.plural?.form
        : analysis.lemma;
    if (!nounForm) return null;
    const article = articleForm(analysis.gender, {
      kind: ctx.articleKind,
      number: ctx.number,
      case: ctx.case,
    });
    if (!article) return null;
    return ctx.sentence(article, nounForm);
  } catch {
    return null;
  }
}

/** @type {object[]} */
let _discardLog = [];

/** Max retained discard entries (dev / tests). */
const DISCARD_LOG_CAP = 500;

/**
 * @param {object} entry
 */
export function recordComposeDiscard(entry) {
  const row = Object.freeze({
    context: entry.context ?? null,
    categoryId: entry.categoryId ?? null,
    lemma: entry.lemma ?? null,
    candidate: entry.candidate ?? null,
    failure: entry.failure ?? CONTEXT_FAILURE.CONTEXT_SUITABILITY,
    detail: entry.detail ?? null,
    action: entry.action ?? "discarded",
  });
  _discardLog.push(row);
  if (_discardLog.length > DISCARD_LOG_CAP) {
    _discardLog.splice(0, _discardLog.length - DISCARD_LOG_CAP);
  }
  // Observable in development without affecting the learner UI.
  if (
    typeof globalThis !== "undefined" &&
    globalThis.__SCHNAPP_COMPOSE_DEBUG__
  ) {
    // eslint-disable-next-line no-console
    console.debug("[compose-discard]", row);
  }
}

/** @returns {readonly object[]} */
export function getComposeDiscards() {
  return Object.freeze(_discardLog.slice());
}

export function clearComposeDiscards() {
  _discardLog = [];
}

/**
 * Convenience: assess + optionally record a discard with candidate preview.
 * @returns {{ ok: true } | { ok: false, reason: string, detail?: string }}
 */
export function gateContextCompatibility(
  categoryId,
  lemma,
  ctx,
  { record = true } = {}
) {
  const result = assessContextCompatibility(categoryId, lemma, ctx);
  if (!result.ok && record) {
    recordComposeDiscard({
      context: ctx?.id,
      categoryId,
      lemma,
      candidate: ctx ? previewCompositionCandidate(lemma, ctx) : null,
      failure: CONTEXT_FAILURE.CONTEXT_SUITABILITY,
      detail: result.detail
        ? `${result.reason}:${result.detail}`
        : result.reason,
      action: "discarded",
    });
  }
  return result;
}
