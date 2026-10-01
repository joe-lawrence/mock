/**
 * Constrained Practice composer — Article Application & Sentence Validation.
 *
 * Pipeline: eligible category members → context template → surface forms
 * (engine articles) → validate → exercise item. Never invents forms.
 *
 * Contexts are a small beginner library; expand only when engine+curriculum
 * can supply every required form.
 */

import { LEXICON } from "./data.js";
import { articleForm, nounAnalysis } from "./noun.js";
import {
  practiceCategories,
  categoryMatchingMembers,
  getGenderCategory,
} from "./categories.js";
import {
  gateContextCompatibility,
} from "./context-compatibility.js";

export const COMPOSE_VERSION = "0.2.0";

export {
  CONTEXT_FAILURE,
  LEXEME_CONTEXT_RESTRICTIONS,
  resolveContextRestrictions,
  assessContextCompatibility,
  gateContextCompatibility,
  previewCompositionCandidate,
  recordComposeDiscard,
  getComposeDiscards,
  clearComposeDiscards,
  contextVerbFrame,
} from "./context-compatibility.js";

const GENDERS = Object.freeze(["masculine", "feminine", "neuter"]);

/**
 * @typedef {object} PracticeContext
 * @property {string} id
 * @property {string} label
 * @property {string[]} requires
 * @property {"definite"|"indefinite"} articleKind
 * @property {"nominative"|"accusative"} case
 * @property {"singular"|"plural"} number
 * @property {string} before — text before the article blank (may be "")
 * @property {(nounForm: string) => string} after — text after the article
 * @property {(article: string, nounForm: string) => string} sentence
 */

/**
 * Concepts unlocked for Gender Shortcuts → Categories practice.
 * Accusative / plural / verb frames stay out until Articles & Case (and Plurals) teach them.
 * @type {readonly string[]}
 */
export const CATEGORIES_PRACTICE_CONCEPTS = Object.freeze([
  "nominative",
  "definite_article",
  "indefinite_article",
  "wo_ist",
  "hier_ist",
  "das_ist",
]);

/**
 * @typedef {object} ContextEligibility
 * @property {Iterable<string>} [concepts] — context eligible iff every `requires` tag is present
 * @property {Iterable<"nominative"|"accusative">} [cases]
 * @property {Iterable<"singular"|"plural">} [numbers]
 */

/**
 * Whether a practice context is eligible under the given curriculum gates.
 * @param {PracticeContext} ctx
 * @param {ContextEligibility} [opts]
 */
export function contextIsEligible(ctx, opts = {}) {
  if (!ctx) return false;
  if (opts.concepts) {
    const have = opts.concepts instanceof Set ? opts.concepts : new Set(opts.concepts);
    if (!ctx.requires.every((r) => have.has(r))) return false;
  }
  if (opts.cases) {
    const allowed = opts.cases instanceof Set ? opts.cases : new Set(opts.cases);
    if (!allowed.has(ctx.case)) return false;
  }
  if (opts.numbers) {
    const allowed = opts.numbers instanceof Set ? opts.numbers : new Set(opts.numbers);
    if (!allowed.has(ctx.number)) return false;
  }
  return true;
}

/**
 * Filter PRACTICE_CONTEXTS by case / number / required concepts.
 * @param {ContextEligibility} [opts]
 * @returns {readonly PracticeContext[]}
 */
export function eligiblePracticeContexts(opts = {}) {
  if (!opts.concepts && !opts.cases && !opts.numbers) {
    return PRACTICE_CONTEXTS;
  }
  return Object.freeze(PRACTICE_CONTEXTS.filter((ctx) => contextIsEligible(ctx, opts)));
}

/** @type {readonly PracticeContext[]} */
export const PRACTICE_CONTEXTS = Object.freeze([
  Object.freeze({
    id: "wo_ist_def",
    label: "Where is …?",
    requires: ["nominative", "definite_article", "wo_ist"],
    articleKind: "definite",
    case: "nominative",
    number: "singular",
    before: "Wo ist ",
    after: (n) => ` ${n}?`,
    sentence: (a, n) => `Wo ist ${a} ${n}?`,
  }),
  Object.freeze({
    id: "hier_ist_def",
    label: "Here is …",
    requires: ["nominative", "definite_article", "hier_ist"],
    articleKind: "definite",
    case: "nominative",
    number: "singular",
    before: "Hier ist ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Hier ist ${a} ${n}.`,
  }),
  Object.freeze({
    id: "das_ist_indef",
    label: "That is a …",
    requires: ["nominative", "indefinite_article", "das_ist"],
    articleKind: "indefinite",
    case: "nominative",
    number: "singular",
    before: "Das ist ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Das ist ${a} ${n}.`,
  }),
  Object.freeze({
    id: "das_ist_def",
    label: "That is the …",
    requires: ["nominative", "definite_article", "das_ist"],
    articleKind: "definite",
    case: "nominative",
    number: "singular",
    before: "Das ist ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Das ist ${a} ${n}.`,
  }),
  Object.freeze({
    id: "ich_sehe_acc_def",
    label: "I see …",
    requires: ["accusative", "definite_article", "verb.sehen"],
    articleKind: "definite",
    case: "accusative",
    number: "singular",
    before: "Ich sehe ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Ich sehe ${a} ${n}.`,
  }),
  Object.freeze({
    id: "ich_habe_acc_def",
    label: "I have …",
    requires: ["accusative", "definite_article", "verb.haben"],
    articleKind: "definite",
    case: "accusative",
    number: "singular",
    before: "Ich habe ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Ich habe ${a} ${n}.`,
  }),
  Object.freeze({
    id: "ich_mag_acc_def",
    label: "I like …",
    requires: ["accusative", "definite_article", "verb.mögen"],
    articleKind: "definite",
    case: "accusative",
    number: "singular",
    before: "Ich mag ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Ich mag ${a} ${n}.`,
  }),
  Object.freeze({
    id: "es_gibt_acc_indef",
    label: "There is …",
    requires: ["accusative", "indefinite_article", "es_gibt"],
    articleKind: "indefinite",
    case: "accusative",
    number: "singular",
    before: "Es gibt ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Es gibt ${a} ${n}.`,
  }),
  Object.freeze({
    id: "wo_sind_pl_def",
    label: "Where are …?",
    requires: ["nominative", "definite_article", "plural", "wo_sind"],
    articleKind: "definite",
    case: "nominative",
    number: "plural",
    before: "Wo sind ",
    after: (n) => ` ${n}?`,
    sentence: (a, n) => `Wo sind ${a} ${n}?`,
  }),
]);

/**
 * Choice set for an article blank (known forms only).
 * @param {"definite"|"indefinite"} kind
 * @param {"nominative"|"accusative"} grammaticalCase
 */
export function articleChoices(kind, grammaticalCase) {
  if (kind === "definite") {
    if (grammaticalCase === "accusative") {
      return Object.freeze(["den", "die", "das"]);
    }
    return Object.freeze(["der", "die", "das"]);
  }
  if (grammaticalCase === "accusative") {
    return Object.freeze(["einen", "eine", "ein"]);
  }
  return Object.freeze(["ein", "eine"]);
}

/**
 * @param {string} lemma
 * @param {PracticeContext} ctx
 */
function nounSurface(lemma, ctx) {
  const analysis = nounAnalysis(lemma);
  if (!analysis.known || !analysis.gender) return null;
  if (ctx.number === "plural") {
    if (!analysis.plural?.form) return null;
    return analysis.plural.form;
  }
  return analysis.lemma;
}

/**
 * Validate a composed surface before it becomes an exercise.
 * @returns {{ ok: true, expected: string, nounForm: string, gender: string } | { ok: false, reason: string }}
 */
export function validateComposition(lemma, ctx, { article } = {}) {
  const analysis = nounAnalysis(lemma);
  if (!analysis.known) return { ok: false, reason: "unknown_lemma" };
  if (!analysis.gender) return { ok: false, reason: "missing_gender" };

  const nounForm = nounSurface(lemma, ctx);
  if (!nounForm) return { ok: false, reason: "missing_noun_form" };

  let expected;
  try {
    expected = articleForm(analysis.gender, {
      kind: ctx.articleKind,
      number: ctx.number,
      case: ctx.case,
    });
  } catch (err) {
    return { ok: false, reason: `article_unsupported:${err.message}` };
  }

  if (!expected) return { ok: false, reason: "missing_article" };

  const choices = articleChoices(ctx.articleKind, ctx.case);
  if (!choices.includes(expected)) {
    return { ok: false, reason: "expected_not_in_choices" };
  }

  if (article != null && article !== expected) {
    // intentional foil — surface must differ from expected
    if (article === expected) return { ok: false, reason: "foil_matches_expected" };
    if (!choices.includes(article)) {
      return { ok: false, reason: "foil_not_in_choices" };
    }
  }

  const sentence = ctx.sentence(article ?? expected, nounForm);
  if (!sentence || !sentence.includes(nounForm)) {
    return { ok: false, reason: "bad_sentence" };
  }

  return {
    ok: true,
    expected,
    nounForm,
    gender: analysis.gender,
    sentence: ctx.sentence(expected, nounForm),
  };
}

/**
 * Pick a wrong-gender article that yields a different surface form.
 * @returns {string|null}
 */
export function wrongGenderArticle(gender, ctx) {
  const expected = articleForm(gender, {
    kind: ctx.articleKind,
    number: ctx.number,
    case: ctx.case,
  });
  for (const g of GENDERS) {
    if (g === gender) continue;
    try {
      const foil = articleForm(g, {
        kind: ctx.articleKind,
        number: ctx.number,
        case: ctx.case,
      });
      if (foil && foil !== expected) return foil;
    } catch {
      /* skip unsupported */
    }
  }
  return null;
}

/**
 * Compose one Article Application item, or null if validation / suitability fails.
 * Suitability failures are silent to the learner; discards are recorded for tests/dev.
 */
export function composeArticleItem(categoryId, lemma, contextId) {
  const ctx = PRACTICE_CONTEXTS.find((c) => c.id === contextId);
  if (!ctx) return null;
  const cat = getGenderCategory(categoryId);
  if (!cat) return null;

  const suit = gateContextCompatibility(categoryId, lemma, ctx);
  if (!suit.ok) return null;

  const v = validateComposition(lemma, ctx);
  if (!v.ok) return null;

  const after = ctx.after(v.nounForm);
  return Object.freeze({
    id: `gen.art.${contextId}.${lemma}`,
    categoryId,
    lemma,
    articleKind: ctx.articleKind,
    before: ctx.before,
    after,
    choices: articleChoices(ctx.articleKind, ctx.case),
    correct: v.expected,
    contextId: ctx.id,
    case: ctx.case,
    number: ctx.number,
    composeVersion: COMPOSE_VERSION,
  });
}

/**
 * Compose correct + incorrect Sentence Validation pair (incorrect may be null).
 */
export function composeValidationPair(categoryId, lemma, contextId) {
  const ctx = PRACTICE_CONTEXTS.find((c) => c.id === contextId);
  if (!ctx) return { ok: null, bad: null };
  const cat = getGenderCategory(categoryId);
  if (!cat) return { ok: null, bad: null };

  const suit = gateContextCompatibility(categoryId, lemma, ctx);
  if (!suit.ok) return { ok: null, bad: null };

  const v = validateComposition(lemma, ctx);
  if (!v.ok) return { ok: null, bad: null };

  const okItem = Object.freeze({
    id: `gen.val.${contextId}.${lemma}.ok`,
    categoryId,
    lemma,
    sentence: v.sentence,
    correct: true,
    contextId: ctx.id,
    case: ctx.case,
    number: ctx.number,
    composeVersion: COMPOSE_VERSION,
  });

  const foil = wrongGenderArticle(v.gender, ctx);
  if (!foil) return { ok: okItem, bad: null };

  const foilCheck = validateComposition(lemma, ctx, { article: foil });
  if (!foilCheck.ok) return { ok: okItem, bad: null };

  const badItem = Object.freeze({
    id: `gen.val.${contextId}.${lemma}.bad`,
    categoryId,
    lemma,
    sentence: ctx.sentence(foil, v.nounForm),
    correct: false,
    contextId: ctx.id,
    case: ctx.case,
    number: ctx.number,
    composeVersion: COMPOSE_VERSION,
    foilArticle: foil,
  });

  return { ok: okItem, bad: badItem };
}

/**
 * Build a validated Article Application pool for practice categories.
 * Pass `{ concepts: CATEGORIES_PRACTICE_CONCEPTS }` (or cases/numbers) to gate frames.
 * @param {ContextEligibility} [eligibility]
 * @returns {readonly object[]}
 */
export function composeArticleApplicationItems(eligibility = {}) {
  const contexts = eligiblePracticeContexts(eligibility);
  const out = [];
  const seen = new Set();
  for (const cat of practiceCategories()) {
    const members = categoryMatchingMembers(cat.id);
    for (const lemma of members) {
      if (!LEXICON[lemma]) continue;
      for (const ctx of contexts) {
        const item = composeArticleItem(cat.id, lemma, ctx.id);
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        out.push(item);
      }
    }
  }
  return Object.freeze(out);
}

/**
 * Build a validated Sentence Validation pool.
 * @param {ContextEligibility} [eligibility]
 * @returns {readonly object[]}
 */
export function composeSentenceValidationItems(eligibility = {}) {
  const contexts = eligiblePracticeContexts(eligibility);
  const out = [];
  const seen = new Set();
  for (const cat of practiceCategories()) {
    const members = categoryMatchingMembers(cat.id);
    for (const lemma of members) {
      if (!LEXICON[lemma]) continue;
      for (const ctx of contexts) {
        const { ok, bad } = composeValidationPair(cat.id, lemma, ctx.id);
        if (ok && !seen.has(ok.id)) {
          seen.add(ok.id);
          out.push(ok);
        }
        if (bad && !seen.has(bad.id)) {
          seen.add(bad.id);
          out.push(bad);
        }
      }
    }
  }
  return Object.freeze(out);
}
