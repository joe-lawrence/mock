/**
 * Noun lookup: lexical gender (truth) vs suffix pattern (prediction).
 */

import {
  DEFINITE_ARTICLES,
  INDEFINITE_ARTICLES,
  PLURAL_ARTICLE,
  LEXICON,
  SUFFIX_PATTERNS,
  DATA_VERSION,
} from "./data.js";

export const ENGINE_VERSION = "0.2.0";
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
 * @param {{ number?: "singular"|"plural", case?: "nominative"|"accusative" }} [opts]
 */
export function definiteArticle(gender, opts = {}) {
  const number = opts.number || "singular";
  const grammaticalCase = opts.case || "nominative";
  if (number === "plural") {
    if (grammaticalCase === "nominative" || grammaticalCase === "accusative") {
      return PLURAL_ARTICLE;
    }
    throw new RangeError(
      `definiteArticle: plural only nominative/accusative supported (got ${grammaticalCase})`
    );
  }
  if (number !== "singular") {
    throw new RangeError(`definiteArticle: unknown number ${number}`);
  }
  const byCase = DEFINITE_ARTICLES[grammaticalCase];
  if (!byCase) {
    throw new RangeError(
      `definiteArticle: unsupported case ${grammaticalCase}`
    );
  }
  const article = byCase[gender];
  if (!article) throw new RangeError(`unknown gender: ${gender}`);
  return article;
}

/**
 * @param {"masculine"|"feminine"|"neuter"} gender
 * @param {{ case?: "nominative"|"accusative" }} [opts]
 */
export function indefiniteArticle(gender, opts = {}) {
  const grammaticalCase = opts.case || "nominative";
  const byCase = INDEFINITE_ARTICLES[grammaticalCase];
  if (!byCase) {
    throw new RangeError(
      `indefiniteArticle: unsupported case ${grammaticalCase}`
    );
  }
  const article = byCase[gender];
  if (!article) throw new RangeError(`unknown gender: ${gender}`);
  return article;
}

/**
 * Resolve article form from authoritative tables.
 * @param {"masculine"|"feminine"|"neuter"} gender
 * @param {{ kind?: "definite"|"indefinite", number?: "singular"|"plural", case?: string }} [opts]
 */
export function articleForm(gender, opts = {}) {
  const kind = opts.kind || "definite";
  const number = opts.number || "singular";
  if (kind === "indefinite") {
    if (number !== "singular") {
      throw new RangeError("indefiniteArticle: plural not supported");
    }
    return indefiniteArticle(gender, { case: opts.case || "nominative" });
  }
  return definiteArticle(gender, {
    number,
    case: opts.case || "nominative",
  });
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
