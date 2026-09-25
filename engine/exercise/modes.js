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
      templateId === "numbers.cardinal.construction";
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
  NOUN_WUG_CHOICE: "nouns.wug.choice",
  NOUN_PLURAL_CONSTRUCTION: "nouns.plural.construction",
  NUMBER_CARDINAL_CONSTRUCTION: "numbers.cardinal.construction",
});
