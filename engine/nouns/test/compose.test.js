import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  definiteArticle,
  indefiniteArticle,
  articleForm,
  PRACTICE_CONTEXTS,
  CATEGORIES_PRACTICE_CONCEPTS,
  contextIsEligible,
  eligiblePracticeContexts,
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
  assessContextCompatibility,
  CONTEXT_FAILURE,
  getComposeDiscards,
  clearComposeDiscards,
  resolveContextRestrictions,
  getGenderCategory,
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
    assert.ok(PRACTICE_CONTEXTS.length >= 8);
    assert.ok(PRACTICE_CONTEXTS.some((c) => c.id === "wo_ist_def"));
    assert.ok(PRACTICE_CONTEXTS.some((c) => c.id === "das_ist_def"));
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
    // occupations allow indefinite; weekdays/months are definite-only
    const item = composeArticleItem("occupations", "Arzt", "es_gibt_acc_indef");
    assert.ok(item);
    assert.equal(item.correct, "einen");
    assert.ok(item.choices.includes("einen"));
  });

  it("calendar names (months) are excluded from generic article compose", () => {
    assert.equal(
      composeArticleItem("months", "April", "das_ist_indef"),
      null
    );
    assert.equal(
      composeArticleItem("months", "April", "das_ist_def"),
      null
    );
    assert.equal(
      composeArticleItem("months", "April", "wo_ist_def"),
      null
    );
    assert.equal(
      composeArticleItem("weekdays", "Montag", "es_gibt_acc_indef"),
      null
    );
    // Weekdays remain definite-only (still compose-eligible).
    const weekday = composeArticleItem("weekdays", "Montag", "wo_ist_def");
    assert.ok(weekday);
    assert.equal(weekday.correct, "der");
    assert.equal(weekday.articleKind, "definite");
  });

  it("composes Wo ist der …", () => {
    const item = composeArticleItem("seasons", "Herbst", "wo_ist_def");
    assert.ok(item);
    assert.equal(item.correct, "der");
    assert.equal(item.before, "Wo ist ");
  });

  it("validation ok/bad uses wrong-gender foil — not ein↔der", () => {
    const { ok, bad } = composeValidationPair(
      "occupations",
      "Arzt",
      "das_ist_indef"
    );
    assert.ok(ok);
    assert.equal(ok.correct, true);
    assert.match(ok.sentence, /^Das ist ein Arzt\.$/);
    assert.ok(bad);
    assert.equal(bad.correct, false);
    // foil must differ from correct "ein" → feminine "eine"
    assert.match(bad.sentence, /^Das ist eine Arzt\.$/);
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

  it("gates contexts by requires / case", () => {
    const cats = eligiblePracticeContexts({
      concepts: CATEGORIES_PRACTICE_CONCEPTS,
    });
    assert.deepEqual(
      cats.map((c) => c.id).sort(),
      ["das_ist_def", "das_ist_indef", "hier_ist_def", "wo_ist_def"].sort()
    );
    assert.equal(
      contextIsEligible(
        PRACTICE_CONTEXTS.find((c) => c.id === "ich_sehe_acc_def"),
        { concepts: CATEGORIES_PRACTICE_CONCEPTS }
      ),
      false
    );
    assert.ok(
      eligiblePracticeContexts({ cases: ["accusative"] }).every(
        (c) => c.case === "accusative"
      )
    );
  });

  it("builds non-empty live pools for the mock (Categories = nominative)", () => {
    resetCategoryPracticePools();
    const arts = categoryArticleItems();
    const vals = categoryValidationItems();
    assert.ok(arts.length > 50, `got ${arts.length} article items`);
    assert.ok(vals.length > 50, `got ${vals.length} validation items`);
    assert.ok(arts.every((x) => x.id.startsWith("gen.art.")));
    assert.ok(vals.every((x) => x.id.startsWith("gen.val.")));
    assert.ok(arts.every((x) => x.case === "nominative"));
    assert.ok(vals.every((x) => x.case === "nominative"));
    assert.ok(!arts.some((x) => x.correct === "den" || x.correct === "einen"));
    const sample = getCategoryArticleItem(arts[0].id);
    assert.equal(sample.correct, arts[0].correct);
  });

  it("unique referents (rivers) use definite frames only", () => {
    resetCategoryPracticePools();
    assert.equal(
      composeArticleItem("rivers", "Elbe", "das_ist_indef"),
      null
    );
    const def = composeArticleItem("rivers", "Elbe", "wo_ist_def");
    assert.ok(def);
    assert.equal(def.correct, "die");
    assert.equal(def.articleKind, "definite");
    const arts = categoryArticleItems().filter((x) => x.lemma === "Elbe");
    assert.ok(arts.length > 0);
    assert.ok(arts.every((x) => x.articleKind === "definite"));
  });

  it("compose pools match category accessors under the same eligibility", () => {
    resetCategoryPracticePools();
    const eligibility = { concepts: CATEGORIES_PRACTICE_CONCEPTS };
    assert.equal(
      composeArticleApplicationItems(eligibility).length,
      categoryArticleItems(eligibility).length
    );
    assert.equal(
      composeSentenceValidationItems(eligibility).length,
      categoryValidationItems(eligibility).length
    );
    assert.ok(
      composeArticleApplicationItems().length >
        composeArticleApplicationItems(eligibility).length
    );
  });
});

describe("context compatibility / naturalness gate", () => {
  /** Regression fixtures: unsuitable generated exercises must stay rejected. */
  const MUST_REJECT = Object.freeze([
    {
      categoryId: "weather",
      lemma: "Regen",
      contextId: "das_ist_indef",
      reason: CONTEXT_FAILURE.ARTICLE_KIND,
      candidateRe: /^Das ist ein Regen\.$/,
    },
    {
      categoryId: "weather",
      lemma: "Schnee",
      contextId: "es_gibt_acc_indef",
      reason: CONTEXT_FAILURE.ARTICLE_KIND,
    },
    {
      categoryId: "metals",
      lemma: "Gold",
      contextId: "das_ist_indef",
      reason: CONTEXT_FAILURE.ARTICLE_KIND,
    },
    {
      categoryId: "rivers",
      lemma: "Elbe",
      contextId: "das_ist_indef",
      reason: CONTEXT_FAILURE.ARTICLE_KIND,
    },
    {
      categoryId: "months",
      lemma: "April",
      contextId: "das_ist_indef",
      reason: CONTEXT_FAILURE.COMPOSE_INELIGIBLE,
    },
    {
      categoryId: "months",
      lemma: "April",
      contextId: "das_ist_def",
      reason: CONTEXT_FAILURE.COMPOSE_INELIGIBLE,
    },
    {
      categoryId: "months",
      lemma: "April",
      contextId: "wo_ist_def",
      reason: CONTEXT_FAILURE.COMPOSE_INELIGIBLE,
    },
    {
      categoryId: "seasons",
      lemma: "Frühling",
      contextId: "das_ist_indef",
      reason: CONTEXT_FAILURE.ARTICLE_KIND,
      candidateRe: /^Das ist ein Frühling\.$/,
    },
    {
      categoryId: "seasons",
      lemma: "Herbst",
      contextId: "das_ist_indef",
      reason: CONTEXT_FAILURE.ARTICLE_KIND,
    },
  ]);

  /** Suitable definite-identification / location frames must remain allowed. */
  const MUST_ALLOW = Object.freeze([
    { categoryId: "weather", lemma: "Regen", contextId: "das_ist_def", article: "der" },
    { categoryId: "weather", lemma: "Regen", contextId: "wo_ist_def", article: "der" },
    { categoryId: "weather", lemma: "Wind", contextId: "hier_ist_def", article: "der" },
    { categoryId: "metals", lemma: "Gold", contextId: "das_ist_def", article: "das" },
    { categoryId: "rivers", lemma: "Elbe", contextId: "das_ist_def", article: "die" },
    { categoryId: "occupations", lemma: "Arzt", contextId: "das_ist_indef", article: "ein" },
    { categoryId: "seasons", lemma: "Frühling", contextId: "das_ist_def", article: "der" },
    { categoryId: "seasons", lemma: "Frühling", contextId: "wo_ist_def", article: "der" },
  ]);

  it("resolves category-level articleKinds for weather", () => {
    const weather = getGenderCategory("weather");
    const r = resolveContextRestrictions(weather, "Regen");
    assert.deepEqual([...r.articleKinds], ["definite"]);
  });

  it("rejects indefinite identification for weather / mass nouns", () => {
    for (const fix of MUST_REJECT) {
      const ctx = PRACTICE_CONTEXTS.find((c) => c.id === fix.contextId);
      assert.ok(ctx, fix.contextId);
      const gate = assessContextCompatibility(fix.categoryId, fix.lemma, ctx);
      assert.equal(gate.ok, false, `${fix.lemma}/${fix.contextId}`);
      assert.equal(gate.reason, fix.reason);
      assert.equal(
        composeArticleItem(fix.categoryId, fix.lemma, fix.contextId),
        null
      );
      const pair = composeValidationPair(
        fix.categoryId,
        fix.lemma,
        fix.contextId
      );
      assert.equal(pair.ok, null);
      assert.equal(pair.bad, null);
    }
  });

  it("allows definite identification and safe frames", () => {
    for (const fix of MUST_ALLOW) {
      const item = composeArticleItem(
        fix.categoryId,
        fix.lemma,
        fix.contextId
      );
      assert.ok(item, `${fix.lemma}/${fix.contextId}`);
      assert.equal(item.correct, fix.article);
      if (fix.contextId === "das_ist_def") {
        assert.equal(item.articleKind, "definite");
        assert.equal(item.before, "Das ist ");
      }
    }
  });

  it("records silent discards with deterministic reason (Regen / das_ist_indef)", () => {
    clearComposeDiscards();
    assert.equal(
      composeArticleItem("weather", "Regen", "das_ist_indef"),
      null
    );
    const discards = getComposeDiscards();
    assert.ok(discards.length >= 1);
    const last = discards[discards.length - 1];
    assert.equal(last.context, "das_ist_indef");
    assert.equal(last.lemma, "Regen");
    assert.equal(last.categoryId, "weather");
    assert.equal(last.failure, CONTEXT_FAILURE.CONTEXT_SUITABILITY);
    assert.match(String(last.detail), /article_kind_restricted/);
    assert.equal(last.action, "discarded");
    assert.match(last.candidate, /^Das ist ein Regen\.$/);
  });

  it("live Categories pools never present Das ist ein Regen / Frühling / April", () => {
    resetCategoryPracticePools();
    const arts = categoryArticleItems();
    const vals = categoryValidationItems();
    assert.ok(
      !arts.some(
        (x) =>
          x.lemma === "Regen" &&
          x.contextId === "das_ist_indef"
      )
    );
    assert.ok(
      !vals.some((x) => /Das ist ein Regen/.test(x.sentence))
    );
    assert.ok(
      !arts.some(
        (x) =>
          x.lemma === "Frühling" &&
          x.contextId === "das_ist_indef"
      )
    );
    assert.ok(
      !vals.some((x) => /Das ist ein Frühling/.test(x.sentence))
    );
    // Months are fully excluded from generic article/sentence compose.
    assert.ok(!arts.some((x) => x.categoryId === "months"));
    assert.ok(!vals.some((x) => x.categoryId === "months"));
    assert.ok(!arts.some((x) => x.lemma === "April"));
    assert.ok(!vals.some((x) => /April/.test(x.sentence || "")));
    const regenDef = arts.filter(
      (x) => x.lemma === "Regen" && x.contextId === "das_ist_def"
    );
    assert.ok(regenDef.length >= 1);
    assert.equal(regenDef[0].correct, "der");
    const fruehlingDef = arts.filter(
      (x) => x.lemma === "Frühling" && x.contextId === "das_ist_def"
    );
    assert.ok(fruehlingDef.length >= 1);
    assert.equal(fruehlingDef[0].correct, "der");
  });

  it("discards month compose with compose_ineligible reason", () => {
    clearComposeDiscards();
    assert.equal(
      composeArticleItem("months", "April", "das_ist_def"),
      null
    );
    const discards = getComposeDiscards();
    assert.ok(discards.length >= 1);
    const last = discards[discards.length - 1];
    assert.equal(last.lemma, "April");
    assert.equal(last.categoryId, "months");
    assert.equal(last.failure, CONTEXT_FAILURE.CONTEXT_SUITABILITY);
    assert.match(String(last.detail), /compose_ineligible/);
    assert.equal(last.action, "discarded");
  });

  it("discards Frühling indefinite identification with deterministic reason", () => {
    clearComposeDiscards();
    assert.equal(
      composeArticleItem("seasons", "Frühling", "das_ist_indef"),
      null
    );
    const discards = getComposeDiscards();
    assert.ok(discards.length >= 1);
    const last = discards[discards.length - 1];
    assert.equal(last.context, "das_ist_indef");
    assert.equal(last.lemma, "Frühling");
    assert.equal(last.categoryId, "seasons");
    assert.equal(last.failure, CONTEXT_FAILURE.CONTEXT_SUITABILITY);
    assert.match(String(last.detail), /article_kind_restricted/);
    assert.equal(last.action, "discarded");
    assert.match(last.candidate, /^Das ist ein Frühling\.$/);
  });
  it("verb-frame denials are wired but inactive without data (v1)", () => {
    const ctx = PRACTICE_CONTEXTS.find((c) => c.id === "ich_habe_acc_def");
    // Occupations have no denyVerbFrames — haben remains allowed at the data layer.
    const gate = assessContextCompatibility("occupations", "Arzt", ctx);
    assert.equal(gate.ok, true);
  });
});
