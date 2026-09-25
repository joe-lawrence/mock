/**
 * Noun lookup: lexical gender (truth) vs suffix pattern (prediction).
 */

import { ARTICLES, LEXICON, SUFFIX_PATTERNS, DATA_VERSION } from "./data.js";

export const ENGINE_VERSION = "0.1.0";
export { DATA_VERSION };

function normalizeLemma(lemma) {
  return String(lemma || "").trim();
}

/**
 * Longest matching suffix pattern, or null.
 * @param {string} lemma
 */
export function matchSuffixPattern(lemma) {
  const word = normalizeLemma(lemma).toLowerCase();
  let best = null;
  for (const p of SUFFIX_PATTERNS) {
    if (word.endsWith(p.suffix)) {
      if (!best || p.suffix.length > best.suffix.length) best = p;
    }
  }
  return best;
}

/**
 * @param {"masculine"|"feminine"|"neuter"} gender
 * @param {{ number?: "singular"|"plural", case?: string }} [opts]
 */
export function definiteArticle(gender, opts = {}) {
  const number = opts.number || "singular";
  const grammaticalCase = opts.case || "nominative";
  if (number === "plural" && grammaticalCase === "nominative") {
    return "die";
  }
  if (number !== "singular" || grammaticalCase !== "nominative") {
    throw new RangeError(
      `definiteArticle: only nominative singular/plural supported (got ${grammaticalCase} ${number})`
    );
  }
  const article = ARTICLES[gender];
  if (!article) throw new RangeError(`unknown gender: ${gender}`);
  return article;
}

/**
 * Full analysis for a lemma.
 * @param {string} lemma
 */
export function nounAnalysis(lemma) {
  const key = normalizeLemma(lemma);
  const entry = LEXICON[key] || null;
  const pattern = matchSuffixPattern(key);

  if (!entry) {
    return {
      lemma: key,
      known: false,
      gender: null,
      article: null,
      gloss: null,
      plural: null,
      pattern,
      patternAgrees: null,
      rules: pattern ? [pattern.id, "lexical.missing"] : ["lexical.missing"],
    };
  }

  const article = definiteArticle(entry.gender, {
    number: "singular",
    case: "nominative",
  });
  const patternAgrees = pattern ? pattern.gender === entry.gender : null;

  return {
    lemma: key,
    known: true,
    gender: entry.gender,
    article,
    gloss: entry.gloss,
    plural: entry.plural
      ? {
          form: entry.plural.form,
          stem: entry.plural.stem,
          ending: entry.plural.ending,
          article: definiteArticle(entry.gender, {
            number: "plural",
            case: "nominative",
          }),
        }
      : null,
    pattern,
    patternAgrees,
    rules: [
      `lexical.${key}.gender`,
      pattern ? pattern.id : "pattern.none",
      patternAgrees === false ? "pattern.conflicts-with-lexical" : null,
      patternAgrees === true ? "pattern.agrees-with-lexical" : null,
    ].filter(Boolean),
  };
}

/**
 * Authoritative nominative singular definite article, or null if unknown.
 * @param {string} lemma
 */
export function nounArticle(lemma) {
  const a = nounAnalysis(lemma);
  return a.known ? a.article : null;
}
