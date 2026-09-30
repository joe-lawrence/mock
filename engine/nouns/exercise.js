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
 * Pick up to `count` lemmas of `gender` from practice categories, preferring
 * distinct categories so the set is not a thematic odd-one-out.
 * @param {string} gender
 * @param {number} count
 * @param {string} seed
 * @param {Set<string>} [exclude]
 * @returns {{ lemmas: string[], categoryIds: string[] }}
 */
function pickDiverseGenderLemmas(gender, count, seed, exclude = new Set()) {
  const pools = practiceCategories()
    .filter((c) => c.association === gender)
    .map((c) => ({
      id: c.id,
      members: categoryMatchingMembers(c.id).filter((m) => !exclude.has(m)),
    }))
    .filter((p) => p.members.length);

  const lemmas = [];
  const categoryIds = [];
  const usedCats = new Set();
  let guard = 0;
  while (lemmas.length < count && guard < 80) {
    guard += 1;
    let candidates = pools.filter(
      (p) =>
        !usedCats.has(p.id) &&
        p.members.some((m) => !lemmas.includes(m) && !exclude.has(m))
    );
    if (!candidates.length) {
      candidates = pools.filter((p) =>
        p.members.some((m) => !lemmas.includes(m) && !exclude.has(m))
      );
    }
    if (!candidates.length) break;
    const pool = candidates[stableIndex(`${seed}:cat:${lemmas.length}`, candidates.length)];
    const avail = pool.members.filter((m) => !lemmas.includes(m) && !exclude.has(m));
    const lemma = avail[stableIndex(`${seed}:lem:${lemmas.length}`, avail.length)];
    lemmas.push(lemma);
    categoryIds.push(pool.id);
    usedCats.add(pool.id);
    exclude.add(lemma);
  }

  // Lexicon fallback if not enough category-backed members.
  if (lemmas.length < count) {
    const extras = Object.keys(LEXICON)
      .filter(
        (lemma) =>
          LEXICON[lemma]?.gender === gender &&
          !exclude.has(lemma) &&
          !lemmas.includes(lemma)
      )
      .sort();
    let i = 0;
    while (lemmas.length < count && i < extras.length) {
      const start = stableIndex(`${seed}:lex:${lemmas.length}`, extras.length);
      const lemma = extras[(start + i) % extras.length];
      i += 1;
      if (lemmas.includes(lemma) || exclude.has(lemma)) continue;
      lemmas.push(lemma);
      categoryIds.push("");
      exclude.add(lemma);
    }
  }

  return { lemmas, categoryIds };
}

/**
 * Gender Imposter: 3 same-gender nouns from diverse categories + 1 other-gender
 * noun. Skill = spot the odd gender — not the odd semantic category, and never
 * by reading a “Category / Expected gender” spoiler.
 * @param {string} categoryId — focus category; its association is the majority gender
 */
export function categoryGenderImposterExercise(categoryId) {
  const cat = getGenderCategory(categoryId);
  if (!cat) throw new Error(`categoryGenderImposterExercise: unknown ${categoryId}`);
  if (!practiceCategories().some((c) => c.id === categoryId)) {
    throw new Error(`categoryGenderImposterExercise: not practice-eligible ${categoryId}`);
  }
  const majorityGender = cat.association;
  if (
    majorityGender !== "masculine" &&
    majorityGender !== "feminine" &&
    majorityGender !== "neuter"
  ) {
    throw new Error(
      `categoryGenderImposterExercise: no concrete gender for ${categoryId}`
    );
  }

  const exclude = new Set();
  const majority = pickDiverseGenderLemmas(
    majorityGender,
    3,
    `${categoryId}:maj`,
    exclude
  );
  if (majority.lemmas.length < 3) {
    throw new Error(
      `categoryGenderImposterExercise: need ≥3 ${majorityGender} nouns (got ${majority.lemmas.length})`
    );
  }

  const otherGenders = ["masculine", "feminine", "neuter"].filter(
    (g) => g !== majorityGender
  );
  const impGender =
    otherGenders[stableIndex(`${categoryId}:impG`, otherGenders.length)];
  const impPick = pickDiverseGenderLemmas(
    impGender,
    1,
    `${categoryId}:imp`,
    exclude
  );
  if (!impPick.lemmas.length) {
    throw new Error(
      `categoryGenderImposterExercise: no ${impGender} imposter for ${categoryId}`
    );
  }
  const imposter = impPick.lemmas[0];

  const lemmas = rotateList(
    [...majority.lemmas, imposter],
    `${categoryId}:order`
  );
  const displays = Object.fromEntries(lemmas.map((lemma) => [lemma, lemma]));
  const majorityLabel = associationChoiceLabel(majorityGender);
  const imposterLabel = associationChoiceLabel(LEXICON[imposter].gender);

  return {
    categoryId: cat.id,
    categoryName: cat.name,
    association: cat.association,
    strength: cat.strength,
    expectedAssociation: cat.association,
    expectedLemma: imposter,
    matches: majority.lemmas,
    matchCategoryIds: majority.categoryIds,
    imposter,
    imposterGender: LEXICON[imposter].gender,
    majorityGender,
    choices: lemmas,
    choiceLabels: displays,
    choiceLabel: majorityLabel,
    // No pre-answer spoiler — category/gender revealed only in feedback.
    header: "",
    feedbackOk: `Correct — ${imposter} is ${imposterLabel.toLowerCase()}; the others are ${majorityLabel.toLowerCase()}.`,
    feedbackBad: `The imposter is ${imposter} (${imposterLabel.toLowerCase()}). The other three are ${majorityLabel.toLowerCase()}.`,
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
