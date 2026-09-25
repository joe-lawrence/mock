import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  nounAnalysis,
  nounArticle,
  matchSuffixPattern,
  definiteArticle,
  evaluateDefiniteArticle,
  evaluatePluralConstruction,
  evaluateWugArticle,
  pluralConstructionParts,
  articleExercise,
  pluralExercise,
  wugExercise,
  associationLemmas,
  recordNounAttempt,
  ENGINE_VERSION,
  DATA_VERSION,
  LEXICON,
} from "../index.js";

describe("suffix patterns", () => {
  it("matches longest suffix", () => {
    assert.equal(matchSuffixPattern("Möglichkeit").suffix, "keit");
    assert.equal(matchSuffixPattern("Zeitung").suffix, "ung");
    assert.equal(matchSuffixPattern("Mädchen").suffix, "chen");
  });

  it("returns null when no high-confidence cue", () => {
    assert.equal(matchSuffixPattern("Tag"), null);
    assert.equal(matchSuffixPattern("Buch"), null);
  });
});

describe("lexical gender authority", () => {
  it("returns nominative singular articles for lexicon", () => {
    assert.equal(nounArticle("Zeitung"), "die");
    assert.equal(nounArticle("Mädchen"), "das");
    assert.equal(nounArticle("Frühling"), "der");
    assert.equal(nounArticle("Tag"), "der");
    assert.equal(nounArticle("Buch"), "das");
  });

  it("pattern agrees on strong suffixes", () => {
    assert.equal(nounAnalysis("Zeitung").patternAgrees, true);
    assert.equal(nounAnalysis("Mädchen").patternAgrees, true);
    assert.equal(nounAnalysis("Frühling").patternAgrees, true);
  });

  it("definiteArticle plural nominative is die", () => {
    assert.equal(
      definiteArticle("masculine", { number: "plural", case: "nominative" }),
      "die"
    );
  });
});

describe("evaluateDefiniteArticle", () => {
  it("accepts correct article", () => {
    const r = evaluateDefiniteArticle({ lemma: "Zeitung", article: "die" });
    assert.equal(r.status, "correct");
  });

  it("rejects wrong gender article", () => {
    const r = evaluateDefiniteArticle({ lemma: "Zeitung", article: "der" });
    assert.equal(r.status, "incorrect");
    assert.deepEqual(r.canonicalAnswers, ["die"]);
  });

  it("handles unknown lemma", () => {
    const r = evaluateDefiniteArticle({ lemma: "Quuxblatt", article: "das" });
    assert.equal(r.status, "incorrect");
    assert.ok(r.evidenceIds.includes("eval.unknown-lemma"));
  });
});

describe("plural construction", () => {
  it("builds expected parts including —", () => {
    assert.deepEqual(pluralConstructionParts("Zeitung"), [
      "die",
      "Zeitung",
      "en",
    ]);
    assert.deepEqual(pluralConstructionParts("Mädchen"), [
      "die",
      "Mädchen",
      "—",
    ]);
    assert.deepEqual(pluralConstructionParts("Buch"), ["die", "Büch", "er"]);
  });

  it("marks exact construction correct", () => {
    const r = evaluatePluralConstruction({
      lemma: "Tag",
      parts: ["die", "Tag", "e"],
    });
    assert.equal(r.status, "correct");
  });

  it("accepts fused plural noun with die", () => {
    const r = evaluatePluralConstruction({
      lemma: "Zeitung",
      parts: ["die", "Zeitungen"],
    });
    assert.equal(r.status, "accepted-alternative");
  });

  it("flags wrong plural article", () => {
    const r = evaluatePluralConstruction({
      lemma: "Zeitung",
      parts: ["das", "Zeitung", "en"],
    });
    assert.equal(r.status, "valid-but-unintended");
  });

  it("marks wrong form incorrect", () => {
    const r = evaluatePluralConstruction({
      lemma: "Buch",
      parts: ["die", "Buch", "e"],
    });
    assert.equal(r.status, "incorrect");
  });
});

describe("exercises + attempts", () => {
  it("articleExercise mirrors lexical truth", () => {
    const ex = articleExercise("Frühling");
    assert.equal(ex.article, "der");
    assert.equal(ex.cue, "-ling");
  });

  it("pluralExercise for Auto", () => {
    const ex = pluralExercise("Auto", { translation: "cars" });
    assert.deepEqual(ex.parts, ["die", "Auto", "s"]);
    assert.equal(ex.translation, "cars");
  });

  it("recordNounAttempt stamps versions", () => {
    const evaluation = evaluateDefiniteArticle({
      lemma: "Mädchen",
      article: "das",
    });
    const attempt = recordNounAttempt({
      exerciseId: "nouns.article.definite",
      prompt: { lemma: "Mädchen" },
      rawInput: { article: "das" },
      evaluation,
      appVersion: "test",
    });
    assert.equal(attempt.versions.engine, ENGINE_VERSION);
    assert.equal(attempt.versions.data, DATA_VERSION);
    assert.equal(attempt.evaluation.status, "correct");
  });

  it("every lexicon entry with gender has a definable article", () => {
    for (const lemma of Object.keys(LEXICON)) {
      assert.ok(nounArticle(lemma), lemma);
    }
  });
});

describe("wugs and association", () => {
  it("associationLemmas only include suffix-cued nouns", () => {
    const pool = associationLemmas();
    assert.ok(pool.some((x) => x.lemma === "Zeitung"));
    assert.ok(!pool.some((x) => x.lemma === "Tag"));
  });

  it("wug with -ung cue accepts die", () => {
    const truth = wugExercise("Klappung");
    assert.equal(truth.article, "die");
    const ok = evaluateWugArticle({
      form: "Klappung",
      article: "die",
      intendedGender: "feminine",
      patternId: "suf.ung",
    });
    assert.equal(ok.status, "correct");
  });

  it("wug without cue accepts insufficient information", () => {
    const truth = wugExercise("Plork");
    assert.equal(truth.article, null);
    const ok = evaluateWugArticle({
      form: "Plork",
      article: "insufficient",
      intendedGender: null,
      patternId: null,
    });
    assert.equal(ok.status, "correct");
    const bad = evaluateWugArticle({
      form: "Plork",
      article: "der",
      intendedGender: null,
      patternId: null,
    });
    assert.equal(bad.status, "incorrect");
  });
});
