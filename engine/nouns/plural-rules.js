/**
 * Productive nominative plural rules for suffix-cued nouns.
 * Lexical plurals stay authoritative when a lexicon entry records a different form.
 * No case endings — nominative `die` + stem + ending only.
 */

export const PRODUCTIVE_PLURAL_RULES = Object.freeze([
  Object.freeze({
    id: "ung",
    suffix: "ung",
    ending: "en",
    note: "-ung adds -en",
  }),
  Object.freeze({
    id: "heit",
    suffix: "heit",
    ending: "en",
    note: "-heit adds -en",
  }),
  Object.freeze({
    id: "keit",
    suffix: "keit",
    ending: "en",
    note: "-keit adds -en",
  }),
  Object.freeze({
    id: "schaft",
    suffix: "schaft",
    ending: "en",
    note: "-schaft adds -en",
  }),
  Object.freeze({
    id: "ion",
    suffix: "ion",
    ending: "en",
    note: "-ion adds -en",
  }),
  Object.freeze({
    id: "chen",
    suffix: "chen",
    ending: "—",
    note: "-chen stays the same",
  }),
  Object.freeze({
    id: "lein",
    suffix: "lein",
    ending: "—",
    note: "-lein stays the same",
  }),
  Object.freeze({
    id: "ner",
    suffix: "ner",
    ending: "—",
    note: "-ner stays the same",
  }),
  Object.freeze({
    id: "er",
    suffix: "er",
    ending: "—",
    note: "-er stays the same",
  }),
]);

/**
 * Predicted plural for a singular form, or null when no simple rule applies.
 * Longer suffixes win (`keit` before `heit`, `ner` before `er`).
 * @param {string} form
 * @returns {{ lemma: string, stem: string, ending: string, form: string, patternId: string, note: string } | null}
 */
export function productivePluralSpec(form) {
  const lemma = String(form || "").trim();
  if (!lemma) return null;
  const lower = lemma.toLowerCase();
  let best = null;
  for (const rule of PRODUCTIVE_PLURAL_RULES) {
    if (!lower.endsWith(rule.suffix)) continue;
    if (!best || rule.suffix.length > best.suffix.length) best = rule;
  }
  if (!best) return null;
  const ending = best.ending;
  const pluralForm = ending === "—" ? lemma : `${lemma}${ending}`;
  return {
    lemma,
    stem: lemma,
    ending,
    form: pluralForm,
    patternId: best.id,
    note: best.note,
  };
}

/**
 * Lexicon plural matches the productive prediction (same stem, ending, and form).
 * @param {string} lemma
 * @param {{ stem?: string, ending?: string, form?: string } | null | undefined} plural
 */
export function pluralMatchesProductiveRule(lemma, plural) {
  const spec = productivePluralSpec(lemma);
  if (!spec || !plural) return false;
  return (
    plural.stem === lemma &&
    plural.ending === spec.ending &&
    plural.form === spec.form
  );
}
