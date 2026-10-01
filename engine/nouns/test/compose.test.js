import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  definiteArticle,
  indefiniteArticle,
  articleForm,
  PRACTICE_CONTEXTS,
  composeArticleItem,
  composeValidationPair,
  composeArticleApplicationItems,
  composeSentenceValidationItems,
  categoryArticleItems,
  categoryValidationItems,
  getCategoryArticleItem,
  validateComposition,
  wrongGenderArticle,
  resetCategoryPracticePools,
} from "../index.js";

describe("article tables (nom/acc, def/indef)", () => {
  it("definite nominative", () => {
    assert.equal(definiteArticle("masculine"), "der");
    assert.equal(definiteArticle("feminine"), "die");
    assert.equal(definiteArticle("neuter"), "das");
  });

  it("definite accusative", () => {
    assert.equal(
      definiteArticle("masculine", { case: "accusative" }),
      "den"
    );
    assert.equal(
      definiteArticle("feminine", { case: "accusative" }),
      "die"
    );
    assert.equal(definiteArticle("neuter", { case: "accusative" }), "das");
  });

  it("indefinite nominative and accusative", () => {
    assert.equal(indefiniteArticle("masculine"), "ein");
    assert.equal(indefiniteArticle("feminine"), "eine");
    assert.equal(
      indefiniteArticle("masculine", { case: "accusative" }),
      "einen"
    );
    assert.equal(
      articleForm("masculine", {
        kind: "indefinite",
        case: "accusative",
      }),
      "einen"
    );
  });

  it("plural definite remains die", () => {
    assert.equal(
      definiteArticle("masculine", { number: "plural", case: "nominative" }),
      "die"
    );
    assert.equal(
      definiteArticle("feminine", { number: "plural", case: "accusative" }),
      "die"
    );
  });
});

describe("practice composer", () => {
  it("exposes a small beginner context library", () => {
    assert.ok(PRACTICE_CONTEXTS.length >= 7);
    assert.ok(PRACTICE_CONTEXTS.some((c) => c.id === "wo_ist_def"));
    assert.ok(PRACTICE_CONTEXTS.some((c) => c.id === "ich_sehe_acc_def"));
    assert.ok(PRACTICE_CONTEXTS.some((c) => c.id === "es_gibt_acc_indef"));
  });

  it("composes Ich sehe den … for masculine", () => {
    // weekdays are masculine
    const item = composeArticleItem("weekdays", "Dienstag", "ich_sehe_acc_def");
    assert.ok(item);
    assert.equal(item.correct, "den");
    assert.equal(item.before, "Ich sehe ");
    assert.ok(item.after.includes("Dienstag"));
    assert.deepEqual(item.choices, ["den", "die", "das"]);
  });

  it("composes Es gibt einen … for masculine accusative indefinite", () => {
    const item = composeArticleItem("weekdays", "Montag", "es_gibt_acc_indef");
    assert.ok(item);
    assert.equal(item.correct, "einen");
    assert.ok(item.choices.includes("einen"));
  });

  it("composes Wo ist der …", () => {
    const item = composeArticleItem("seasons", "Herbst", "wo_ist_def");
    assert.ok(item);
    assert.equal(item.correct, "der");
    assert.equal(item.before, "Wo ist ");
  });

  it("validation ok/bad uses wrong-gender foil — not ein↔der", () => {
    const { ok, bad } = composeValidationPair(
      "seasons",
      "Herbst",
      "das_ist_indef"
    );
    assert.ok(ok);
    assert.equal(ok.correct, true);
    assert.match(ok.sentence, /^Das ist ein Herbst\.$/);
    assert.ok(bad);
    assert.equal(bad.correct, false);
    // foil must differ from correct "ein" → feminine "eine"
    assert.match(bad.sentence, /^Das ist eine Herbst\.$/);
    assert.notEqual(bad.foilArticle, "der");
  });

  it("discards compositions that lack plural forms", () => {
    const v = validateComposition("Dienstag", {
      id: "wo_sind_pl_def",
      articleKind: "definite",
      case: "nominative",
      number: "plural",
      before: "Wo sind ",
      after: (n) => ` ${n}?`,
      sentence: (a, n) => `Wo sind ${a} ${n}?`,
      requires: [],
      label: "test",
    });
    // Dienstag may or may not have plural in lexicon
    if (!v.ok) assert.equal(v.reason, "missing_noun_form");
  });

  it("wrongGenderArticle avoids identical surfaces", () => {
    const foil = wrongGenderArticle("masculine", {
      articleKind: "indefinite",
      case: "nominative",
      number: "singular",
    });
    // masculine and neuter both "ein" — foil should be feminine "eine"
    assert.equal(foil, "eine");
  });

  it("builds non-empty live pools for the mock", () => {
    resetCategoryPracticePools();
    const arts = categoryArticleItems();
    const vals = categoryValidationItems();
    assert.ok(arts.length > 50, `got ${arts.length} article items`);
    assert.ok(vals.length > 50, `got ${vals.length} validation items`);
    assert.ok(arts.every((x) => x.id.startsWith("gen.art.")));
    assert.ok(vals.every((x) => x.id.startsWith("gen.val.")));
    const sample = getCategoryArticleItem(arts[0].id);
    assert.equal(sample.correct, arts[0].correct);
  });

  it("compose pools match category accessors", () => {
    resetCategoryPracticePools();
    assert.equal(
      composeArticleApplicationItems().length,
      categoryArticleItems().length
    );
    assert.equal(
      composeSentenceValidationItems().length,
      categoryValidationItems().length
    );
  });
});
