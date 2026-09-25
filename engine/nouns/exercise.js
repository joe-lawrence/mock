/**
 * Exercise shells from noun engine truth.
 */

import { LEXICON, WUGS, SUFFIX_PATTERNS } from "./data.js";
import { matchSuffixPattern, definiteArticle, nounAnalysis } from "./noun.js";
import { pluralConstructionParts } from "./evaluate.js";

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
 * Lemmas that have a suffix-family cue — for Association drills.
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
