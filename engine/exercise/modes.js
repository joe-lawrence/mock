/**
 * Difficulty modes change scaffolding, never linguistic truth (spec §8).
 */

export const EXERCISE_LAYER_VERSION = "0.1.0";

/** @typedef {"assisted" | "core" | "overdrive"} DifficultyMode */

/**
 * @param {DifficultyMode} mode
 */
export function scaffoldingFor(templateId, mode = "assisted") {
  const base = {
    showEnglish: false,
    /** Mark stem|ending split in the lemma (pattern focus). */
    showSuffixMark: true,
    /** Explicit “-ung” badge beside the word — off; ending mark is enough. */
    showSuffixBadge: false,
    /** Gender encoding on the prompt lemma (stem/ending). */
    showPromptGenderColors: true,
    /** Gender encoding on der/die/das answer chips. */
    showChoiceGenderColors: true,
    showGenderLegend: true,
    showHintButton: true,
    showReferenceButton: true,
    choiceSet: "all-articles",
    chipTray: true,
    allowRetryWrongChoice: true,
  };

  if (mode === "assisted") {
    const showEnglish =
      templateId === "nouns.plural.construction" ||
      templateId === "numbers.cardinal.construction" ||
      templateId === "numbers.decimal.construction" ||
      templateId === "numbers.money.construction" ||
      templateId === "numbers.fraction.construction" ||
      templateId === "numbers.mixed-fraction.construction" ||
      templateId === "numbers.clock.construction" ||
      templateId === "numbers.digital-time.construction" ||
      templateId === "numbers.duration.construction" ||
      templateId === "numbers.ordinal.construction" ||
      templateId === "numbers.ordinal-am.construction" ||
      templateId === "numbers.weekday.construction" ||
      templateId === "numbers.month.construction" ||
      templateId === "numbers.calendar-date.construction" ||
      templateId === "numbers.measure.construction" ||
      templateId === "nouns.category.gender-recognition" ||
      templateId === "nouns.category.article-application" ||
      templateId === "nouns.category.gender-imposter" ||
      templateId === "nouns.category.sentence-validation";
    return { ...base, mode, templateId, showEnglish };
  }

  if (mode === "core") {
    return {
      ...base,
      mode,
      templateId,
      showEnglish: false,
      showSuffixMark: false,
      showSuffixBadge: false,
      showPromptGenderColors: false,
      showChoiceGenderColors: false,
      showGenderLegend: true,
      showHintButton: true,
      showReferenceButton: true,
      allowRetryWrongChoice: true,
    };
  }

  // overdrive — available for later UI; stricter support fade
  return {
    ...base,
    mode,
    templateId,
    showEnglish: false,
    showSuffixMark: false,
    showSuffixBadge: false,
    showPromptGenderColors: false,
    showChoiceGenderColors: false,
    showGenderLegend: false,
    showHintButton: false,
    showReferenceButton: false,
    allowRetryWrongChoice: false,
    chipTray: true,
  };
}

export const TEMPLATES = Object.freeze({
  NOUN_ARTICLE_CHOICE: "nouns.article.choice",
  NOUN_ASSOCIATION_CHOICE: "nouns.association.choice",
  NOUN_CATEGORY_GENDER_RECOGNITION: "nouns.category.gender-recognition",
  NOUN_CATEGORY_ARTICLE_APPLICATION: "nouns.category.article-application",
  NOUN_CATEGORY_GENDER_IMPOSTER: "nouns.category.gender-imposter",
  NOUN_CATEGORY_SENTENCE_VALIDATION: "nouns.category.sentence-validation",
  NOUN_WUG_CHOICE: "nouns.wug.choice",
  NOUN_PLURAL_CONSTRUCTION: "nouns.plural.construction",
  NUMBER_CARDINAL_CONSTRUCTION: "numbers.cardinal.construction",
  NUMBER_DECIMAL_CONSTRUCTION: "numbers.decimal.construction",
  NUMBER_MONEY_CONSTRUCTION: "numbers.money.construction",
  NUMBER_FRACTION_CONSTRUCTION: "numbers.fraction.construction",
  NUMBER_MIXED_FRACTION_CONSTRUCTION: "numbers.mixed-fraction.construction",
  NUMBER_CLOCK_CONSTRUCTION: "numbers.clock.construction",
  NUMBER_DIGITAL_TIME_CONSTRUCTION: "numbers.digital-time.construction",
  NUMBER_DURATION_CONSTRUCTION: "numbers.duration.construction",
  NUMBER_ORDINAL_CONSTRUCTION: "numbers.ordinal.construction",
  NUMBER_ORDINAL_AM_CONSTRUCTION: "numbers.ordinal-am.construction",
  NUMBER_WEEKDAY_CONSTRUCTION: "numbers.weekday.construction",
  NUMBER_MONTH_CONSTRUCTION: "numbers.month.construction",
  NUMBER_CALENDAR_DATE_CONSTRUCTION: "numbers.calendar-date.construction",
  NUMBER_MEASURE_CONSTRUCTION: "numbers.measure.construction",
});
