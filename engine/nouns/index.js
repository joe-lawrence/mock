export {
  ENGINE_VERSION,
  DATA_VERSION,
  matchSuffixPattern,
  definiteArticle,
  indefiniteArticle,
  articleForm,
  nounAnalysis,
  nounArticle,
} from "./noun.js";

export {
  evaluateDefiniteArticle,
  evaluatePluralConstruction,
  evaluateWugArticle,
  pluralConstructionParts,
} from "./evaluate.js";

export {
  PRODUCTIVE_PLURAL_RULES,
  productivePluralSpec,
  pluralMatchesProductiveRule,
} from "./plural-rules.js";

export { recordNounAttempt } from "./attempt.js";

export {
  articleExercise,
  pluralExercise,
  wugExercise,
  wugForms,
  associationLemmas,
  lexiconLemmas,
  lemmasWithPlural,
  categoryGenderRecognitionExercise,
  categoryArticleApplicationExercise,
  categoryGenderImposterExercise,
  categorySentenceValidationExercise,
  GENDER_IMPOSTER_VARIANTS,
} from "./exercise.js";

export {
  ARTICLES,
  PLURAL_ARTICLE,
  DEFINITE_ARTICLES,
  INDEFINITE_ARTICLES,
  SUFFIX_PATTERNS,
  LEXICON,
  WUGS,
} from "./data.js";

export {
  GENDER_CATEGORIES,
  getGenderCategory,
  practiceCategories,
  categoryMembers,
  categoryTransferMembers,
  categoryTeachingMembers,
  categoryMatchingMembers,
  withDefiniteArticle,
  associationChoiceLabel,
  CATEGORY_GENDER_CHOICES,
  CATEGORY_ASSOCIATION_CHOICES,
} from "./categories.js";

export {
  CATEGORY_ARTICLE_ITEMS,
  CATEGORY_VALIDATION_ITEMS,
  categoryArticleItems,
  categoryValidationItems,
  getCategoryArticleItem,
  getCategoryValidationItem,
  resetCategoryPracticePools,
} from "./category-practice.js";

export {
  COMPOSE_VERSION,
  PRACTICE_CONTEXTS,
  CATEGORIES_PRACTICE_CONCEPTS,
  contextIsEligible,
  eligiblePracticeContexts,
  articleChoices,
  validateComposition,
  wrongGenderArticle,
  composeArticleItem,
  composeValidationPair,
  composeCaseAccusativeItems,
  composeCaseFrameItems,
  CASE_FRAME_UNITS,
  DATIVE_PLURAL_FORMS,
  CASE_ACCUSATIVE_FRAMES,
  CASE_ACCUSATIVE_CONCEPTS,
  CASE_ACCUSATIVE_ALLOWLIST,
  CASE_ACC_MASC_GENDERS,
  CASE_ACC_UNCHANGED_GENDERS,
  composeArticleApplicationItems,
  composeSentenceValidationItems,
  CONTEXT_FAILURE,
  LEXEME_CONTEXT_RESTRICTIONS,
  resolveContextRestrictions,
  assessContextCompatibility,
  gateContextCompatibility,
  previewCompositionCandidate,
  recordComposeDiscard,
  getComposeDiscards,
  clearComposeDiscards,
  contextVerbFrame,
} from "./practice-compose.js";
