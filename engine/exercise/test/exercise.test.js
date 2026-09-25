import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createNounArticleExercise,
  createNounAssociationExercise,
  createNounWugExercise,
  createNounPluralExercise,
  createNumberConstructionExercise,
  createExercise,
  submitExerciseAttempt,
  scaffoldingFor,
  TEMPLATES,
} from "../index.js";

describe("scaffolding modes", () => {
  it("Assisted marks suffix + gender; Core is plain lemma", () => {
    const a = scaffoldingFor(TEMPLATES.NOUN_ARTICLE_CHOICE, "assisted");
    const c = scaffoldingFor(TEMPLATES.NOUN_ARTICLE_CHOICE, "core");
    assert.equal(a.showSuffixMark, true);
    assert.equal(a.showSuffixBadge, false);
    assert.equal(a.showEnglish, false);
    assert.equal(a.showPromptGenderColors, true);
    assert.equal(a.showChoiceGenderColors, true);
    assert.equal(c.showSuffixMark, false);
    assert.equal(c.showSuffixBadge, false);
    assert.equal(c.showPromptGenderColors, false);
    assert.equal(c.showChoiceGenderColors, false);
  });
});

describe("createNounArticleExercise", () => {
  it("same lemma, different modes, same linguistic resolution", () => {
    const assisted = createNounArticleExercise("Zeitung", { mode: "assisted" });
    const core = createNounArticleExercise("Zeitung", { mode: "core" });
    assert.equal(assisted.resolution.article, core.resolution.article);
    assert.equal(assisted.resolution.gender, "feminine");
    assert.equal(assisted.prompt.highlightSuffix, true);
    assert.equal(core.prompt.highlightSuffix, false);
    assert.equal(assisted.prompt.showSuffixBadge, false);
    assert.equal(core.prompt.showSuffixBadge, false);
    assert.equal(assisted.prompt.translation, null);
    assert.equal(core.prompt.translation, null);
    assert.equal(assisted.prompt.genderClass, "feminine");
    assert.equal(core.prompt.genderClass, null);
    assert.equal(assisted.prompt.ending, "ung");
    assert.equal(core.prompt.ending, "ung");
  });
});

describe("submitExerciseAttempt", () => {
  it("records scaffolding mode on noun article attempts", () => {
    const ex = createNounArticleExercise("Mädchen", { mode: "core" });
    const { evaluation, attempt, accepted, complete } = submitExerciseAttempt(
      ex,
      { article: "das" }
    );
    assert.equal(evaluation.status, "correct");
    assert.equal(accepted, true);
    assert.equal(complete, true);
    assert.equal(attempt.scaffolding.mode, "core");
    assert.equal(attempt.exerciseId, ex.id);
  });

  it("article wrong stays incomplete for retry UX", () => {
    const ex = createNounArticleExercise("Zeitung", { mode: "assisted" });
    const { accepted, complete, evaluation } = submitExerciseAttempt(ex, {
      article: "der",
    });
    assert.equal(evaluation.status, "incorrect");
    assert.equal(accepted, false);
    assert.equal(complete, false);
  });

  it("number construction via createExercise + submit", () => {
    const ex = createExercise({
      templateId: TEMPLATES.NUMBER_CARDINAL_CONSTRUCTION,
      target: { value: 24, grain: "construction" },
      mode: "assisted",
    });
    const { accepted, evaluation } = submitExerciseAttempt(ex, {
      parts: ["vier", "und", "zwanzig"],
    });
    assert.equal(accepted, true);
    assert.equal(evaluation.status, "correct");
  });

  it("plural construction submit", () => {
    const ex = createNounPluralExercise("Buch", {
      mode: "assisted",
      translation: "books",
    });
    assert.deepEqual(ex.materials.parts, ["die", "Büch", "er"]);
    const { accepted } = submitExerciseAttempt(ex, {
      parts: ["die", "Büch", "er"],
    });
    assert.equal(accepted, true);
  });
});

describe("createNumberConstructionExercise", () => {
  it("Core hides English in prompt", () => {
    const ex = createNumberConstructionExercise(42, {
      mode: "core",
      english: "forty-two",
    });
    assert.equal(ex.prompt.english, null);
    assert.equal(ex.resolution.form, "zweiundvierzig");
  });
});

describe("association and wugs", () => {
  it("association tracks pattern family", () => {
    const ex = createNounAssociationExercise("Zeitung", { mode: "assisted" });
    assert.equal(ex.templateId, TEMPLATES.NOUN_ASSOCIATION_CHOICE);
    assert.equal(ex.materials.patternId, "suf.ung");
    const { accepted } = submitExerciseAttempt(ex, { article: "die" });
    assert.equal(accepted, true);
  });

  it("wug accepts pattern application and insufficient-info", () => {
    const cued = createNounWugExercise("Murfling", { mode: "core" });
    assert.equal(cued.resolution.article, "der");
    assert.equal(
      submitExerciseAttempt(cued, { article: "der" }).accepted,
      true
    );
    const bare = createNounWugExercise("Plork", { mode: "assisted" });
    assert.equal(bare.resolution.article, "insufficient");
    assert.equal(
      submitExerciseAttempt(bare, { article: "insufficient" }).accepted,
      true
    );
  });
});
