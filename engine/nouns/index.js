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
  articleChoices,
  validateComposition,
  wrongGenderArticle,
  composeArticleItem,
  composeValidationPair,
  composeArticleApplicationItems,
  composeSentenceValidationItems,
} from "./practice-compose.js";
