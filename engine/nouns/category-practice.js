/**
 * Category practice item accessors.
 *
 * Live Article Application / Sentence Validation pools are composed from
 * practice contexts + lexicon (see practice-compose.js). Static authored
 * sentence banks are retired — foils must be wrong-gender articles, not
 * definite↔indefinite swaps.
 *
 * Default pools are gated to Gender Shortcuts → Categories concepts
 * (nominative singular frames only). Pass eligibility to unlock Case/Plurals later.
 */

import { practiceCategories } from "./categories.js";
import {
  CATEGORIES_PRACTICE_CONCEPTS,
  composeArticleApplicationItems,
  composeSentenceValidationItems,
  clearComposeDiscards,
} from "./practice-compose.js";

/**
 * @typedef {object} CategoryArticleItem
 * @property {string} id
 * @property {string} categoryId
 * @property {string} lemma
 * @property {"definite"|"indefinite"} articleKind
 * @property {string} before
 * @property {string} after
 * @property {string[]} choices
 * @property {string} correct
 */

/**
 * @typedef {object} CategoryValidationItem
 * @property {string} id
 * @property {string} categoryId
 * @property {string} lemma
 * @property {string} sentence
 * @property {boolean} correct
 */

/** Empty legacy export — pools come from practice-compose.js */
export const CATEGORY_ARTICLE_ITEMS = Object.freeze([]);

/** Empty legacy export — pools come from practice-compose.js */
export const CATEGORY_VALIDATION_ITEMS = Object.freeze([]);

/** Default eligibility for live Categories practice (no accusative / plural yet). */
const DEFAULT_ELIGIBILITY = Object.freeze({
  concepts: CATEGORIES_PRACTICE_CONCEPTS,
});

let _articlePool = null;
let _articlePoolKey = "";
let _validationPool = null;
let _validationPoolKey = "";

function eligibilityKey(eligibility) {
  if (!eligibility || typeof eligibility !== "object") return "";
  const concepts = eligibility.concepts
    ? [...eligibility.concepts].sort().join(",")
    : "";
  const cases = eligibility.cases
    ? [...eligibility.cases].sort().join(",")
    : "";
  const numbers = eligibility.numbers
    ? [...eligibility.numbers].sort().join(",")
    : "";
  return `${concepts}|${cases}|${numbers}`;
}

function articlePool(eligibility = DEFAULT_ELIGIBILITY) {
  const key = eligibilityKey(eligibility);
  if (!_articlePool || _articlePoolKey !== key) {
    _articlePool = composeArticleApplicationItems(eligibility);
    _articlePoolKey = key;
  }
  return _articlePool;
}

function validationPool(eligibility = DEFAULT_ELIGIBILITY) {
  const key = eligibilityKey(eligibility);
  if (!_validationPool || _validationPoolKey !== key) {
    _validationPool = composeSentenceValidationItems(eligibility);
    _validationPoolKey = key;
  }
  return _validationPool;
}

/** Clears composer caches and discard log (tests). */
export function resetCategoryPracticePools() {
  _articlePool = null;
  _articlePoolKey = "";
  _validationPool = null;
  _validationPoolKey = "";
  clearComposeDiscards();
}

export function getCategoryArticleItem(id, eligibility = DEFAULT_ELIGIBILITY) {
  return articlePool(eligibility).find((x) => x.id === id) || null;
}

export function getCategoryValidationItem(id, eligibility = DEFAULT_ELIGIBILITY) {
  return validationPool(eligibility).find((x) => x.id === id) || null;
}

/**
 * @param {import("./practice-compose.js").ContextEligibility} [eligibility]
 */
export function categoryArticleItems(eligibility = DEFAULT_ELIGIBILITY) {
  const playable = new Set(practiceCategories().map((c) => c.id));
  return articlePool(eligibility).filter((x) => playable.has(x.categoryId));
}

/**
 * @param {import("./practice-compose.js").ContextEligibility} [eligibility]
 */
export function categoryValidationItems(eligibility = DEFAULT_ELIGIBILITY) {
  const playable = new Set(practiceCategories().map((c) => c.id));
  return validationPool(eligibility).filter((x) => playable.has(x.categoryId));
}
