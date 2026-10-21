/**
 * Evaluate article and plural constructions for nouns.
 */

import { nounAnalysis, definiteArticle } from "./noun.js";
import { PLURAL_ARTICLE } from "./data.js";
import { productivePluralSpec } from "./plural-rules.js";

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
        "This wug has no strong gender suffix — prefer insufficient information over guessing.",
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
 * Lexical plural when recorded; otherwise a productive suffix rule (wugs).
 * @param {string} lemma
 */
function resolvePluralTarget(lemma) {
  const analysis = nounAnalysis(lemma);
  if (analysis.known && analysis.plural) {
    return {
      analysis,
      missing: false,
      lexical: true,
      form: analysis.plural.form,
      stem: analysis.plural.stem,
      ending: analysis.plural.ending,
      rules: analysis.rules || [],
    };
  }
  const spec = productivePluralSpec(lemma);
  if (spec) {
    return {
      analysis,
      missing: false,
      lexical: false,
      form: spec.form,
      stem: spec.stem,
      ending: spec.ending,
      rules: [...(analysis.rules || []), `plural.rule.${spec.patternId}`],
    };
  }
  return { analysis, missing: true, rules: analysis.rules || [] };
}

/**
 * Expected construction parts: [die, stem, ending].
 * @param {string} lemma
 * @returns {string[] | null}
 */
export function pluralConstructionParts(lemma) {
  const target = resolvePluralTarget(lemma);
  if (target.missing) return null;
  return [PLURAL_ARTICLE, target.stem, target.ending];
}

/**
 * @param {{ lemma: string, parts: string[] }} input
 */
export function evaluatePluralConstruction({ lemma, parts }) {
  const target = resolvePluralTarget(lemma);
  const analysis = target.analysis;
  const evidenceIds = [...target.rules, "eval.noun.plural"];
  const normalized = normalizeParts(parts);

  if (target.missing && !analysis.known) {
    return {
      status: "incorrect",
      canonicalAnswers: [],
      explanation: `No lexical entry for “${lemma}”.`,
      evidenceIds: [...evidenceIds, "eval.unknown-lemma"],
      slotMatch: null,
    };
  }

  if (target.missing) {
    return {
      status: "incorrect",
      canonicalAnswers: [],
      explanation: `No plural recorded for “${lemma}”.`,
      evidenceIds: [...evidenceIds, "eval.plural.missing"],
      slotMatch: null,
    };
  }

  const expected = [PLURAL_ARTICLE, target.stem, target.ending];
  const canonicalForm = `${PLURAL_ARTICLE} ${target.form}`;
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
      explanation: target.lexical
        ? "Plural construction matches lexical form."
        : "Plural construction matches the productive pattern.",
      evidenceIds: [
        ...evidenceIds,
        target.lexical ? "lexical.plural" : "plural.rule",
      ],
      slotMatch: expected.map(() => true),
    };
  }

  // Same plural noun orthography with different chips / fused stem+ending
  if (
    normalizeArticle(normalized[0]) === PLURAL_ARTICLE &&
    builtNoun === target.form
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
  if (builtNoun === target.form && normalizeArticle(normalized[0]) !== PLURAL_ARTICLE) {
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
