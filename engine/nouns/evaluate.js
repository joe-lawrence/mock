/**
 * Evaluate article and plural constructions for nouns.
 */

import { nounAnalysis, definiteArticle } from "./noun.js";
import { PLURAL_ARTICLE } from "./data.js";

function normalizeArticle(a) {
  return String(a || "").trim().toLowerCase();
}

function normalizeParts(parts) {
  return (parts || []).map((p) => String(p).trim());
}

function joinPluralParts(parts) {
  return parts.map((t) => (t === "—" ? "" : t)).join("");
}

/**
 * @param {{ lemma: string, article: string }} input
 */
export function evaluateDefiniteArticle({ lemma, article }) {
  const analysis = nounAnalysis(lemma);
  const chosen = normalizeArticle(article);
  const evidenceIds = [...(analysis.rules || []), "eval.noun.article"];

  if (!analysis.known) {
    return {
      status: "incorrect",
      canonicalAnswers: [],
      explanation: `No lexical entry for “${lemma}” — cannot evaluate against linguistic truth.`,
      evidenceIds: [...evidenceIds, "eval.unknown-lemma"],
    };
  }

  const canonical = analysis.article;

  if (chosen === canonical) {
    return {
      status: "correct",
      canonicalAnswers: [canonical],
      matchedAnswer: chosen,
      explanation: `Nominative singular definite article for ${analysis.gender} is ${canonical}.`,
      evidenceIds,
      gender: analysis.gender,
    };
  }

  // Chose an article that would be correct for the *pattern* gender but not lexical
  if (
    analysis.pattern &&
    chosen === definiteArticle(analysis.pattern.gender) &&
    analysis.patternAgrees === false
  ) {
    return {
      status: "valid-but-unintended",
      canonicalAnswers: [canonical],
      matchedAnswer: chosen,
      explanation: `Suffix pattern ${analysis.pattern.suffix} suggests ${analysis.pattern.gender}, but lexical gender is ${analysis.gender} (${canonical}).`,
      evidenceIds: [...evidenceIds, "eval.pattern-vs-lexical"],
      gender: analysis.gender,
    };
  }

  const otherGenders = ["masculine", "feminine", "neuter"].filter(
    (g) => g !== analysis.gender
  );
  for (const g of otherGenders) {
    if (chosen === definiteArticle(g)) {
      return {
        status: "incorrect",
        canonicalAnswers: [canonical],
        matchedAnswer: chosen,
        explanation: `${chosen} marks ${g}; ${lemma} is ${analysis.gender} (${canonical}).`,
        evidenceIds: [...evidenceIds, "eval.wrong-gender"],
        gender: analysis.gender,
      };
    }
  }

  return {
    status: "incorrect",
    canonicalAnswers: [canonical],
    matchedAnswer: chosen,
    explanation: `Expected ${canonical}.`,
    evidenceIds: [...evidenceIds, "eval.incorrect"],
    gender: analysis.gender,
  };
}

/**
 * Evaluate a Wug article / insufficient-information response.
 * @param {{
 *   form: string,
 *   article: string,
 *   intendedGender: "masculine"|"feminine"|"neuter"|null,
 *   patternId?: string|null,
 * }} input
 */
export function evaluateWugArticle({
  form,
  article,
  intendedGender,
  patternId = null,
}) {
  const chosen = normalizeArticle(article);
  const evidenceIds = [
    "eval.noun.wug",
    patternId || "pattern.none",
    `wug.${form}`,
  ];
  const insufficient =
    chosen === "insufficient" || chosen === "?" || chosen === "—?—";

  if (!intendedGender) {
    if (insufficient) {
      return {
        status: "correct",
        canonicalAnswers: ["insufficient"],
        matchedAnswer: "insufficient",
        explanation:
          "No high-confidence suffix cue — “insufficient information” is the right call.",
        evidenceIds: [...evidenceIds, "eval.wug.insufficient-ok"],
        gender: null,
      };
    }
    return {
      status: "incorrect",
      canonicalAnswers: ["insufficient"],
      matchedAnswer: chosen,
      explanation:
        "This nonce form has no strong gender suffix — prefer insufficient information over guessing.",
      evidenceIds: [...evidenceIds, "eval.wug.guessed-without-cue"],
      gender: null,
    };
  }

  const canonical = definiteArticle(intendedGender, {
    number: "singular",
    case: "nominative",
  });

  if (insufficient) {
    return {
      status: "incorrect",
      canonicalAnswers: [canonical],
      matchedAnswer: "insufficient",
      explanation: `There is a strong pattern cue here — nominative singular is ${canonical}.`,
      evidenceIds: [...evidenceIds, "eval.wug.missed-cue"],
      gender: intendedGender,
    };
  }

  if (chosen === canonical) {
    return {
      status: "correct",
      canonicalAnswers: [canonical],
      matchedAnswer: chosen,
      explanation: `Applied the suffix pattern → ${intendedGender} → ${canonical}.`,
      evidenceIds: [...evidenceIds, "eval.wug.pattern-ok"],
      gender: intendedGender,
    };
  }

  return {
    status: "incorrect",
    canonicalAnswers: [canonical],
    matchedAnswer: chosen,
    explanation: `Pattern points to ${intendedGender} (${canonical}), not ${chosen}.`,
    evidenceIds: [...evidenceIds, "eval.wug.wrong-gender"],
    gender: intendedGender,
  };
}

/**
 * Expected construction parts: [die, stem, ending].
 * @param {string} lemma
 * @returns {string[] | null}
 */
export function pluralConstructionParts(lemma) {
  const analysis = nounAnalysis(lemma);
  if (!analysis.known || !analysis.plural) return null;
  return [PLURAL_ARTICLE, analysis.plural.stem, analysis.plural.ending];
}

/**
 * @param {{ lemma: string, parts: string[] }} input
 */
export function evaluatePluralConstruction({ lemma, parts }) {
  const analysis = nounAnalysis(lemma);
  const evidenceIds = [...(analysis.rules || []), "eval.noun.plural"];
  const normalized = normalizeParts(parts);

  if (!analysis.known) {
    return {
      status: "incorrect",
      canonicalAnswers: [],
      explanation: `No lexical entry for “${lemma}”.`,
      evidenceIds: [...evidenceIds, "eval.unknown-lemma"],
      slotMatch: null,
    };
  }

  if (!analysis.plural) {
    return {
      status: "incorrect",
      canonicalAnswers: [],
      explanation: `No plural recorded for “${lemma}”.`,
      evidenceIds: [...evidenceIds, "eval.plural.missing"],
      slotMatch: null,
    };
  }

  const expected = pluralConstructionParts(lemma);
  const canonicalForm = `${PLURAL_ARTICLE} ${analysis.plural.form}`;
  const builtNoun = joinPluralParts(normalized.slice(1));
  const builtPhrase = `${normalizeArticle(normalized[0]) || ""} ${builtNoun}`.trim();

  if (
    normalized.length === expected.length &&
    normalized.every((p, i) => p === expected[i])
  ) {
    return {
      status: "correct",
      canonicalAnswers: [canonicalForm],
      matchedAnswer: builtPhrase,
      explanation: "Plural construction matches lexical form.",
      evidenceIds: [...evidenceIds, "lexical.plural"],
      slotMatch: expected.map(() => true),
    };
  }

  // Same plural noun orthography with different chips / fused stem+ending
  if (
    normalizeArticle(normalized[0]) === PLURAL_ARTICLE &&
    builtNoun === analysis.plural.form
  ) {
    return {
      status: "accepted-alternative",
      canonicalAnswers: [canonicalForm],
      matchedAnswer: builtPhrase,
      explanation:
        "Plural orthography matches, but chip boundaries differ from the target segmentation.",
      evidenceIds: [...evidenceIds, "eval.alt.segmentation"],
      slotMatch: null,
    };
  }

  // Wrong article but right plural noun
  if (builtNoun === analysis.plural.form && normalizeArticle(normalized[0]) !== PLURAL_ARTICLE) {
    return {
      status: "valid-but-unintended",
      canonicalAnswers: [canonicalForm],
      matchedAnswer: builtPhrase,
      explanation: `Plural noun is correct, but nominative plural article must be ${PLURAL_ARTICLE}.`,
      evidenceIds: [...evidenceIds, "eval.wrong-plural-article"],
      slotMatch: expected.map((p, i) => normalized[i] === p),
    };
  }

  return {
    status: "incorrect",
    canonicalAnswers: [canonicalForm],
    matchedAnswer: builtPhrase,
    explanation: `Expected ${canonicalForm}.`,
    evidenceIds: [...evidenceIds, "eval.incorrect"],
    slotMatch: expected.map((p, i) => normalized[i] === p),
  };
}
