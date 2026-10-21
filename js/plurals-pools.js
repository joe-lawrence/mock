/**
 * Nominative plural decks for the Plurals topic.
 * Wugs are nonce nouns. Real words follow a productive rule.
 * Patterns is one lexicon example per rule. Lexical is everything else recorded.
 */

import { LEXICON, WUGS } from "../../engine/nouns/data.js";
import { lemmasWithPlural } from "../../engine/nouns/exercise.js";
import {
  productivePluralSpec,
  pluralMatchesProductiveRule,
} from "../../engine/nouns/plural-rules.js";

const SURFACE_ENDINGS = ["e", "en", "er", "n", "s", "—"];

const PATTERN_EXEMPLARS = {
  ung: "Zeitung",
  heit: "Freiheit",
  keit: "Möglichkeit",
  schaft: "Freundschaft",
  ion: "Nation",
  chen: "Mädchen",
  lein: "Fräulein",
  ner: "Rentner",
  er: "Fahrer",
};

const LEXICAL_NOTE = "This plural is a lexical fact — learn the form.";

export function surfacePlural(stem, ending) {
  return ending === "—" ? stem : `${stem}${ending}`;
}

function hashString(text) {
  let n = 0;
  for (const ch of String(text || "")) n = (n + ch.charCodeAt(0) * 17) % 997;
  return n;
}

function stableOrder(seed, items) {
  return items
    .map((item, i) => ({
      item,
      k: (seed * (i + 3) + String(item).length * 13) % 997,
    }))
    .sort((a, b) => a.k - b.k || String(a.item).localeCompare(String(b.item), "de"))
    .map((row) => row.item);
}

export function pluralChoiceForms(item) {
  const correct = item.form;
  const wrongs = [];
  for (const ending of SURFACE_ENDINGS) {
    if (ending === item.ending) continue;
    const form = surfacePlural(item.stem, ending);
    if (!form || form === correct || wrongs.includes(form)) continue;
    wrongs.push(form);
    if (wrongs.length === 2) break;
  }
  return stableOrder(hashString(item.lemma), [correct, ...wrongs]);
}

export function pluralProofread(item) {
  let wrong = "";
  for (const ending of SURFACE_ENDINGS) {
    if (ending === item.ending) continue;
    const form = surfacePlural(item.stem, ending);
    if (form && form !== item.form) {
      wrong = form;
      break;
    }
  }
  const showWrong = hashString(item.lemma) % 2 === 0;
  const shown = showWrong && wrong ? wrong : item.form;
  return {
    shown,
    answer: shown === item.form ? "Richtig" : "Falsch",
  };
}

function decorate(item) {
  const proof = pluralProofread(item);
  return Object.freeze({
    ...item,
    chooseForms: Object.freeze(pluralChoiceForms(item)),
    proofShown: proof.shown,
    proofAnswer: proof.answer,
  });
}

function lexiconItem(lemma, entry, spec, productive) {
  const plural = entry.plural;
  return decorate({
    lemma,
    translation: entry.gloss || "",
    stem: plural.stem,
    ending: plural.ending,
    form: plural.form,
    patternId: productive ? spec.patternId : null,
    patternNote: productive ? spec.note : LEXICAL_NOTE,
    wug: false,
  });
}

function buildPools() {
  const real = [];
  const lexical = [];
  /** @type {Map<string, object>} */
  const byPattern = new Map();
  const lemmas = lemmasWithPlural().slice().sort((a, b) => a.localeCompare(b, "de"));
  for (const lemma of lemmas) {
    const entry = LEXICON[lemma];
    const spec = productivePluralSpec(lemma);
    const productive = pluralMatchesProductiveRule(lemma, entry?.plural);
    const item = lexiconItem(lemma, entry, spec, productive);
    if (productive) {
      real.push(item);
      if (!byPattern.has(spec.patternId)) byPattern.set(spec.patternId, item);
    } else lexical.push(item);
  }
  for (const [patternId, preferred] of Object.entries(PATTERN_EXEMPLARS)) {
    const picked = real.find((item) => item.lemma === preferred);
    if (picked) byPattern.set(patternId, picked);
  }

  const wugs = [];
  for (const wug of WUGS) {
    const spec = productivePluralSpec(wug.form);
    if (!spec) continue;
    wugs.push(
      decorate({
        lemma: spec.lemma,
        translation: "",
        stem: spec.stem,
        ending: spec.ending,
        form: spec.form,
        patternId: spec.patternId,
        patternNote: spec.note,
        wug: true,
      })
    );
  }

  return {
    "plural-wugs": Object.freeze(wugs),
    "plural-real-words": Object.freeze(real),
    "plural-patterns": Object.freeze([...byPattern.values()]),
    "plural-lexical": Object.freeze(lexical),
  };
}

const POOLS = buildPools();

export function pluralPool(stepId) {
  return POOLS[stepId] || [];
}

export function pluralPoolIds() {
  return Object.keys(POOLS);
}
