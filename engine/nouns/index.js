export {
  ENGINE_VERSION,
  DATA_VERSION,
  matchSuffixPattern,
  definiteArticle,
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
} from "./exercise.js";

export {
  ARTICLES,
  PLURAL_ARTICLE,
  SUFFIX_PATTERNS,
  LEXICON,
  WUGS,
} from "./data.js";
