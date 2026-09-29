/**
 * Exercise shells from noun engine truth.
 */

import { LEXICON, WUGS, SUFFIX_PATTERNS } from "./data.js";
import { matchSuffixPattern, definiteArticle, nounAnalysis } from "./noun.js";
import { pluralConstructionParts } from "./evaluate.js";
import {
  getGenderCategory,
  associationChoiceLabel,
  practiceCategories,
  categoryMatchingMembers,
  categoryMembers,
  CATEGORY_GENDER_CHOICES,
} from "./categories.js";
import {
  getCategoryArticleItem,
  getCategoryValidationItem,
} from "./category-practice.js";

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function patternBlurb(analysis) {
  if (!analysis.pattern) {
    return "No high-confidence suffix cue — treat gender as lexical.";
  }
  const p = analysis.pattern;
  const cue = `-${p.suffix}`;
  if (analysis.patternAgrees === false) {
    return `${cue} often suggests ${p.gender}, but lexical gender for this word is ${analysis.gender}.`;
  }
  return `Words ending in ${cue} are ${p.note} — taught as a pattern (${p.strength}).`;
}

/**
 * @param {string} lemma
 */
export function articleExercise(lemma) {
  const analysis = nounAnalysis(lemma);
  if (!analysis.known) {
    throw new Error(`articleExercise: unknown lemma ${lemma}`);
  }
  const cue = analysis.pattern ? `-${analysis.pattern.suffix}` : null;
  return {
    lemma: analysis.lemma,
    translation: analysis.gloss,
    gender: analysis.gender,
    article: analysis.article,
    cue,
    patternId: analysis.pattern?.id || null,
    pattern: patternBlurb(analysis),
    rules: analysis.rules,
  };
}

/**
 * Lemmas that have a suffix-family cue — for Suffixes / Real Words drills.
 */
export function associationLemmas() {
  return Object.keys(LEXICON)
    .map((lemma) => {
      const pattern = matchSuffixPattern(lemma);
      if (!pattern) return null;
      return { lemma, patternId: pattern.id, suffix: pattern.suffix, gender: pattern.gender };
    })
    .filter(Boolean);
}

/**
 * Stable 0..n-1 index from a string (for deterministic choice rotation).
 * @param {string} seed
 * @param {number} n
 */
function stableIndex(seed, n) {
  if (n <= 0) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % n;
}

function rotateList(list, seed) {
  if (!list.length) return [];
  const rot = stableIndex(seed, list.length);
  return [...list.slice(rot), ...list.slice(0, rot)];
}

/**
 * Gender Recognition: category examples → associated gender (M/F/N).
 * @param {string} categoryId
 */
export function categoryGenderRecognitionExercise(categoryId) {
  const cat = getGenderCategory(categoryId);
  if (!cat) throw new Error(`categoryGenderRecognitionExercise: unknown ${categoryId}`);
  if (!practiceCategories().some((c) => c.id === categoryId)) {
    throw new Error(`categoryGenderRecognitionExercise: not practice-eligible ${categoryId}`);
  }
  const expectedAssociation = cat.association;
  return {
    categoryId: cat.id,
    categoryName: cat.name,
    association: cat.association,
    strength: cat.strength,
    expectedAssociation,
    choices: [...CATEGORY_GENDER_CHOICES],
    choiceLabels: Object.fromEntries(
      CATEGORY_GENDER_CHOICES.map((id) => [id, associationChoiceLabel(id)])
    ),
    choiceLabel: associationChoiceLabel(expectedAssociation),
    description: cat.description || "",
  };
}

/**
 * Article Application: authored blanked sentence → article choice.
 * @param {string} itemId
 */
export function categoryArticleApplicationExercise(itemId) {
  const item = getCategoryArticleItem(itemId);
  if (!item) throw new Error(`categoryArticleApplicationExercise: unknown ${itemId}`);
  const cat = getGenderCategory(item.categoryId);
  if (!cat) throw new Error(`categoryArticleApplicationExercise: bad category ${item.categoryId}`);
  const blank = "___";
  return {
    itemId: item.id,
    categoryId: cat.id,
    categoryName: cat.name,
    association: cat.association,
    strength: cat.strength,
    lemma: item.lemma,
    articleKind: item.articleKind,
    before: item.before,
    after: item.after,
    promptText: `${item.before}${blank}${item.after}`.trim(),
    choices: [...item.choices],
    correct: item.correct,
    expectedAssociation: cat.association,
    choiceLabel: associationChoiceLabel(cat.association),
  };
}

/**
 * Gender Imposter: 3 matching-gender members + 1 wrong-gender noun.
 * @param {string} categoryId
 */
export function categoryGenderImposterExercise(categoryId) {
  const cat = getGenderCategory(categoryId);
  if (!cat) throw new Error(`categoryGenderImposterExercise: unknown ${categoryId}`);
  if (!practiceCategories().some((c) => c.id === categoryId)) {
    throw new Error(`categoryGenderImposterExercise: not practice-eligible ${categoryId}`);
  }
  const matching = categoryMatchingMembers(categoryId);
  if (matching.length < 3) {
    throw new Error(
      `categoryGenderImposterExercise: need ≥3 matching members for ${categoryId}`
    );
  }
  const matchStart = stableIndex(`${categoryId}:match`, matching.length);
  const matches = [];
  for (let i = 0; i < matching.length && matches.length < 3; i++) {
    matches.push(matching[(matchStart + i) % matching.length]);
  }

  const memberSet = new Set(categoryMembers(categoryId));
  const imposters = Object.keys(LEXICON)
    .filter(
      (lemma) =>
        !memberSet.has(lemma) &&
        LEXICON[lemma]?.gender &&
        LEXICON[lemma].gender !== cat.association
    )
    .sort();
  if (!imposters.length) {
    throw new Error(`categoryGenderImposterExercise: no imposters for ${categoryId}`);
  }
  const imposter = imposters[stableIndex(`${categoryId}:imp`, imposters.length)];

  const lemmas = rotateList([...matches, imposter], `${categoryId}:order`);
  const displays = Object.fromEntries(lemmas.map((lemma) => [lemma, lemma]));

  return {
    categoryId: cat.id,
    categoryName: cat.name,
    association: cat.association,
    strength: cat.strength,
    expectedAssociation: cat.association,
    expectedLemma: imposter,
    matches,
    imposter,
    imposterGender: LEXICON[imposter].gender,
    choices: lemmas,
    choiceLabels: displays,
    choiceLabel: associationChoiceLabel(cat.association),
    header: `Category: ${cat.name} · Expected gender: ${associationChoiceLabel(cat.association)}`,
  };
}

/**
 * Sentence Validation: authored sentence → correct / incorrect.
 * @param {string} itemId
 */
export function categorySentenceValidationExercise(itemId) {
  const item = getCategoryValidationItem(itemId);
  if (!item) throw new Error(`categorySentenceValidationExercise: unknown ${itemId}`);
  const cat = getGenderCategory(item.categoryId);
  if (!cat) throw new Error(`categorySentenceValidationExercise: bad category ${item.categoryId}`);
  return {
    itemId: item.id,
    categoryId: cat.id,
    categoryName: cat.name,
    association: cat.association,
    strength: cat.strength,
    lemma: item.lemma,
    sentence: item.sentence,
    correct: item.correct,
    expected: item.correct ? "correct" : "incorrect",
    choices: ["correct", "incorrect"],
    choiceLabels: Object.freeze({ correct: "Correct", incorrect: "Incorrect" }),
    choiceLabel: associationChoiceLabel(cat.association),
  };
}

/**
 * @param {string} form — nonce from WUGS
 */
export function wugExercise(form) {
  const entry = WUGS.find((w) => w.form === form);
  if (!entry) throw new Error(`wugExercise: unknown wug ${form}`);
  const pattern = entry.patternId
    ? SUFFIX_PATTERNS.find((p) => p.id === entry.patternId) || null
    : null;
  const article = entry.intendedGender
    ? definiteArticle(entry.intendedGender, {
        number: "singular",
        case: "nominative",
      })
    : null;
  const ending = pattern?.suffix || "";
  const stem =
    ending && entry.form.toLowerCase().endsWith(ending)
      ? entry.form.slice(0, -ending.length)
      : entry.form;

  return {
    form: entry.form,
    patternId: entry.patternId,
    intendedGender: entry.intendedGender,
    article,
    cue: pattern ? `-${pattern.suffix}` : null,
    stem,
    ending,
    note: entry.note,
    allowInsufficient: !entry.intendedGender,
    hint: entry.intendedGender
      ? `Nominative singular. Use the suffix cue (${pattern ? `-${pattern.suffix}` : "pattern"}).`
      : "Nominative singular. No high-confidence suffix — choose insufficient information.",
    rules: [entry.patternId || "pattern.none", `wug.${entry.form}`].filter(
      Boolean
    ),
  };
}

export function wugForms() {
  return WUGS.map((w) => w.form);
}

/**
 * @param {string} lemma
 * @param {{ translation?: string }} [opts]
 */
export function pluralExercise(lemma, opts = {}) {
  const analysis = nounAnalysis(lemma);
  if (!analysis.known || !analysis.plural) {
    throw new Error(`pluralExercise: no plural for ${lemma}`);
  }
  const parts = pluralConstructionParts(lemma);
  const distractors = unique([
    "e",
    "en",
    "er",
    "s",
    "n",
    analysis.lemma !== analysis.plural.stem ? analysis.lemma : null,
  ])
    .filter((d) => !parts.includes(d))
    .slice(0, 3);

  let hint = `Nominative plural always uses die (given here — number, not gender). Build the stem and ending.`;
  if (analysis.plural.ending === "—") {
    hint += ` This noun keeps the same form (use — for no ending).`;
  } else if (analysis.plural.stem !== analysis.lemma) {
    hint += ` Stem changes (umlaut/spelling) — use the stem chip as given.`;
  } else {
    hint += ` Ending tendencies track the singular noun’s gender (e.g. many masculines take -e).`;
  }

  return {
    lemma: analysis.lemma,
    singularArticle: analysis.article,
    translation: opts.translation || analysis.gloss || "",
    parts,
    form: analysis.plural.form,
    distractors,
    hint,
    rules: analysis.rules,
  };
}

export function lexiconLemmas() {
  return Object.keys(LEXICON);
}

export function lemmasWithPlural() {
  return Object.entries(LEXICON)
    .filter(([, e]) => e.plural)
    .map(([lemma]) => lemma);
}
