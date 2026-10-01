/**
 * Category practice item accessors.
 *
 * Live Article Application / Sentence Validation pools are composed from
 * practice contexts + lexicon (see practice-compose.js). Static authored
 * sentence banks are retired — foils must be wrong-gender articles, not
 * definite↔indefinite swaps.
 */

import { practiceCategories } from "./categories.js";
import {
  composeArticleApplicationItems,
  composeSentenceValidationItems,
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

let _articlePool = null;
let _validationPool = null;

function articlePool() {
  if (!_articlePool) _articlePool = composeArticleApplicationItems();
  return _articlePool;
}

function validationPool() {
  if (!_validationPool) _validationPool = composeSentenceValidationItems();
  return _validationPool;
}

/** Clears composer caches (tests). */
export function resetCategoryPracticePools() {
  _articlePool = null;
  _validationPool = null;
}

export function getCategoryArticleItem(id) {
  return articlePool().find((x) => x.id === id) || null;
}

export function getCategoryValidationItem(id) {
  return validationPool().find((x) => x.id === id) || null;
}

export function categoryArticleItems() {
  const playable = new Set(practiceCategories().map((c) => c.id));
  return articlePool().filter((x) => playable.has(x.categoryId));
}

export function categoryValidationItems() {
  const playable = new Set(practiceCategories().map((c) => c.id));
  return validationPool().filter((x) => playable.has(x.categoryId));
}
