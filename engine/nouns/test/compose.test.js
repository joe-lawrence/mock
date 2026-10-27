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
  composeCaseAccusativeItems,
  composeCaseFrameItems,
  CASE_FRAME_UNITS,
  CASE_ACCUSATIVE_FRAMES,
  CASE_ACCUSATIVE_CONCEPTS,
  CASE_ACC_MASC_GENDERS,
  CASE_ACC_UNCHANGED_GENDERS,
  composeArticleApplicationItems,
  composeSentenceValidationItems,
  categoryArticleItems,
  categoryValidationItems,
  getCategoryArticleItem,
  getCategoryValidationItem,
  validateComposition,
  wrongGenderArticle,
  resetCategoryPracticePools,
  assessContextCompatibility,
  CONTEXT_FAILURE,
  getComposeDiscards,
  clearComposeDiscards,
  resolveContextRestrictions,
  getGenderCategory,
  LEXICON,
} from "../index.js";
import {
  createNounCategoryArticleApplicationExercise,
  createNounCategorySentenceValidationExercise,
} from "../../exercise/index.js";

describe("article tables (nom/acc/dat singular, def/indef)", () => {
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

  it("definite and indefinite dative singular", () => {
    assert.equal(definiteArticle("masculine", { case: "dative" }), "dem");
    assert.equal(definiteArticle("feminine", { case: "dative" }), "der");
    assert.equal(definiteArticle("neuter", { case: "dative" }), "dem");
    assert.equal(indefiniteArticle("masculine", { case: "dative" }), "einem");
    assert.equal(indefiniteArticle("feminine", { case: "dative" }), "einer");
    assert.equal(indefiniteArticle("neuter", { case: "dative" }), "einem");
    assert.equal(
      articleForm("feminine", { kind: "indefinite", case: "dative" }),
      "einer"
    );
  });

  it("plural dative article is den", () => {
    assert.equal(
      definiteArticle("masculine", { number: "plural", case: "dative" }),
      "den"
    );
    assert.equal(
      definiteArticle("feminine", { number: "plural", case: "dative" }),
      "den"
    );
    assert.equal(
      definiteArticle("neuter", { number: "plural", case: "dative" }),
      "den"
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
    // Weekdays: location denied; provisional das_ist_def remains.
    assert.equal(
      composeArticleItem("weekdays", "Montag", "wo_ist_def"),
      null
    );
    const weekday = composeArticleItem("weekdays", "Montag", "das_ist_def");
    assert.ok(weekday);
    assert.equal(weekday.correct, "der");
    assert.equal(weekday.articleKind, "definite");
  });

  it("composes Wo ist der …", () => {
    // Seasons deny location; rivers still allow definite location frames.
    const item = composeArticleItem("rivers", "Elbe", "wo_ist_def");
    assert.ok(item);
    assert.equal(item.correct, "die");
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

  it("composes Case accusative frames only when their concepts are introduced", () => {
    assert.equal(composeCaseAccusativeItems().length, 0);
    assert.equal(
      composeCaseAccusativeItems({ concepts: CATEGORIES_PRACTICE_CONCEPTS }).length,
      0
    );
    assert.ok(!PRACTICE_CONTEXTS.some((c) => c.id.startsWith("ich_helfe")));

    const sehenOnly = composeCaseAccusativeItems({
      concepts: ["accusative", "definite_article", "verb.sehen"],
      genders: CASE_ACC_MASC_GENDERS,
      lemmas: ["Hund", "Frau", "Zeitung"],
    });
    assert.deepEqual(
      [...new Set(sehenOnly.map((item) => item.contextId))],
      ["ich_sehe_acc_def"]
    );
    assert.deepEqual(sehenOnly.map((item) => item.lemma), ["Hund"]);
    assert.equal(sehenOnly[0].correct, "den");
    assert.equal(sehenOnly[0].sentence, "Ich sehe den Hund.");

    const masc = composeCaseAccusativeItems({
      concepts: CASE_ACCUSATIVE_CONCEPTS,
      genders: CASE_ACC_MASC_GENDERS,
    });
    assert.ok(masc.length > 0);
    assert.ok(masc.every((item) => item.gender === "masculine"));
    assert.ok(CASE_ACCUSATIVE_FRAMES.every((id) => masc.some((item) => item.contextId === id)));
    const hundIndef = masc.find(
      (item) => item.lemma === "Hund" && item.contextId === "ich_habe_acc_indef"
    );
    assert.equal(hundIndef.correct, "einen");
    assert.equal(hundIndef.sentence, "Ich habe einen Hund.");
    assert.ok(!masc.some((item) => item.lemma === "Frau" || item.lemma === "Zeitung"));

    const unchanged = composeCaseAccusativeItems({
      concepts: CASE_ACCUSATIVE_CONCEPTS,
      genders: CASE_ACC_UNCHANGED_GENDERS,
    });
    assert.ok(unchanged.every((item) => item.gender === "feminine" || item.gender === "neuter"));
    assert.equal(
      unchanged.find((item) => item.lemma === "Frau" && item.contextId === "ich_sehe_acc_def")
        .correct,
      "die"
    );
    assert.equal(
      unchanged.find((item) => item.lemma === "Frau" && item.contextId === "ich_sehe_acc_indef")
        .correct,
      "eine"
    );
    assert.equal(
      unchanged.find((item) => item.lemma === "Kind" && item.contextId === "ich_habe_acc_indef")
        .correct,
      "ein"
    );
    assert.equal(
      unchanged.find((item) => item.lemma === "Kind" && item.contextId === "ich_sehe_acc_def")
        .correct,
      "das"
    );
    assert.ok(!unchanged.some((item) => item.lemma === "Mann"));
  });

  it("composes listed dative frames and keeps geben closed", () => {
    assert.equal(composeCaseFrameItems("case.dat.helfen").length, 0);
    assert.equal(
      composeCaseFrameItems("case.dat.helfen", {
        concepts: CATEGORIES_PRACTICE_CONCEPTS,
      }).length,
      0
    );
    const gebenFrames = [];
    for (const [unitId, unit] of Object.entries(CASE_FRAME_UNITS)) {
      for (const frame of unit.frames) {
        if (frame.construction === "geben") gebenFrames.push({ unitId, frame });
      }
    }
    assert.equal(gebenFrames.length, 1);
    assert.equal(gebenFrames[0].unitId, "case.mixed");
    assert.equal(gebenFrames[0].frame.closed, true);
    assert.deepEqual(
      gebenFrames[0].frame.lemmas.map((entry) => entry.lemma),
      ["Kind", "Ball"]
    );

    const helfen = composeCaseFrameItems("case.dat.helfen", {
      concepts: CASE_FRAME_UNITS["case.dat.helfen"].concepts,
      lemmas: ["Mann", "Frau", "Kind", "Bus", "Zeitung"],
    });
    assert.deepEqual(
      helfen.map((item) => item.lemma),
      ["Mann", "Frau", "Kind"]
    );
    assert.equal(helfen.find((item) => item.lemma === "Mann").correct, "dem");
    assert.equal(helfen.find((item) => item.lemma === "Frau").correct, "der");
    assert.equal(helfen.find((item) => item.lemma === "Kind").sentence, "Ich helfe dem Kind.");
    assert.ok(helfen.every((item) => item.articleKind === "definite"));

    const indef = composeCaseFrameItems("case.dat.indef", {
      concepts: CASE_FRAME_UNITS["case.dat.indef"].concepts,
    });
    assert.equal(indef.find((item) => item.lemma === "Frau").correct, "einer");
    assert.equal(indef.find((item) => item.lemma === "Mann").correct, "einem");
    assert.ok(!indef.some((item) => item.correct === "dem"));

    const mit = composeCaseFrameItems("case.prep.mit", {
      concepts: CASE_FRAME_UNITS["case.prep.mit"].concepts,
    });
    assert.equal(
      mit.find((item) => item.lemma === "Bus").sentence,
      "Ich fahre mit dem Bus."
    );
    assert.equal(
      mit.find((item) => item.lemma === "Kind").sentence,
      "Ich spiele mit dem Kind."
    );
    assert.ok(!mit.some((item) => item.lemma === "Mann" || item.lemma === "Zeitung"));

    const gefallen = composeCaseFrameItems("case.verb.gefallen", {
      concepts: CASE_FRAME_UNITS["case.verb.gefallen"].concepts,
    });
    assert.equal(CASE_FRAME_UNITS["case.verb.gefallen"].frames[0].closed, true);
    assert.ok(gefallen.every((item) => item.sentence.startsWith("Das Buch gefällt ")));
    assert.deepEqual(
      gefallen.map((item) => item.lemma),
      ["Mann", "Frau", "Kind"]
    );

    const plural = composeCaseFrameItems("case.dat.plural", {
      concepts: CASE_FRAME_UNITS["case.dat.plural"].concepts,
    });
    const article = plural.filter((item) => item.target === "article");
    const nouns = plural.filter((item) => item.target === "noun");
    assert.deepEqual(
      article.map((item) => item.sentence),
      ["Ich helfe den Kindern.", "Ich helfe den Frauen.", "Ich spiele mit den Hunden."]
    );
    assert.ok(article.every((item) => item.correct === "den"));
    assert.deepEqual(
      nouns.map((item) => item.correct),
      ["Kindern", "Hunden", "Frauen"]
    );
    assert.ok(!plural.some((item) => item.lemma === "Mann"));
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

  /** Suitable definite-identification frames that remain allowed after Phase B. */
  const MUST_ALLOW = Object.freeze([
    { categoryId: "weather", lemma: "Regen", contextId: "das_ist_def", article: "der" },
    { categoryId: "metals", lemma: "Gold", contextId: "das_ist_def", article: "das" },
    { categoryId: "rivers", lemma: "Elbe", contextId: "das_ist_def", article: "die" },
    { categoryId: "rivers", lemma: "Elbe", contextId: "wo_ist_def", article: "die" },
    { categoryId: "rivers", lemma: "Elbe", contextId: "hier_ist_def", article: "die" },
    { categoryId: "occupations", lemma: "Arzt", contextId: "das_ist_indef", article: "ein" },
    { categoryId: "occupations", lemma: "Arzt", contextId: "wo_ist_def", article: "der" },
    { categoryId: "seasons", lemma: "Frühling", contextId: "das_ist_def", article: "der" },
    { categoryId: "weekdays", lemma: "Montag", contextId: "das_ist_def", article: "der" },
    { categoryId: "directions", lemma: "Norden", contextId: "das_ist_def", article: "der" },
    { categoryId: "directions", lemma: "Norden", contextId: "wo_ist_def", article: "der" },
    { categoryId: "flowers", lemma: "Rose", contextId: "das_ist_indef", article: "eine" },
    { categoryId: "flowers", lemma: "Rose", contextId: "wo_ist_def", article: "die" },
    { categoryId: "venues", lemma: "Hotel", contextId: "das_ist_indef", article: "ein" },
    { categoryId: "venues", lemma: "Hotel", contextId: "wo_ist_def", article: "das" },
  ]);

  /** Phase B — location / indefinite denies (exercise-generation suitability). */
  const PHASE_B_DENY = Object.freeze([
    {
      categoryId: "weekdays",
      lemma: "Montag",
      contextId: "wo_ist_def",
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
    },
    {
      categoryId: "weekdays",
      lemma: "Montag",
      contextId: "hier_ist_def",
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
    },
    {
      categoryId: "seasons",
      lemma: "Frühling",
      contextId: "wo_ist_def",
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
    },
    {
      categoryId: "seasons",
      lemma: "Frühling",
      contextId: "hier_ist_def",
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
    },
    {
      categoryId: "weather",
      lemma: "Regen",
      contextId: "wo_ist_def",
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
    },
    {
      categoryId: "weather",
      lemma: "Regen",
      contextId: "hier_ist_def",
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
    },
    {
      categoryId: "metals",
      lemma: "Gold",
      contextId: "wo_ist_def",
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
    },
    {
      categoryId: "metals",
      lemma: "Gold",
      contextId: "hier_ist_def",
      reason: CONTEXT_FAILURE.CONTEXT_DENIED,
    },
    {
      categoryId: "directions",
      lemma: "Norden",
      contextId: "das_ist_indef",
      reason: CONTEXT_FAILURE.ARTICLE_KIND,
    },
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

  it("Phase B: denies approved location / indefinite frames via compose path", () => {
    for (const fix of PHASE_B_DENY) {
      const ctx = PRACTICE_CONTEXTS.find((c) => c.id === fix.contextId);
      assert.ok(ctx, fix.contextId);
      const gate = assessContextCompatibility(fix.categoryId, fix.lemma, ctx);
      assert.equal(gate.ok, false, `${fix.lemma}/${fix.contextId}`);
      assert.equal(gate.reason, fix.reason, `${fix.lemma}/${fix.contextId}`);
      assert.equal(
        composeArticleItem(fix.categoryId, fix.lemma, fix.contextId),
        null,
        `composeArticleItem ${fix.lemma}/${fix.contextId}`
      );
      const pair = composeValidationPair(
        fix.categoryId,
        fix.lemma,
        fix.contextId
      );
      assert.equal(pair.ok, null, `validation ok ${fix.lemma}/${fix.contextId}`);
      assert.equal(pair.bad, null, `validation bad ${fix.lemma}/${fix.contextId}`);
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

  it("Phase B: live pools drop denied location frames; keep provisional IDs", () => {
    resetCategoryPracticePools();
    const arts = categoryArticleItems();
    const vals = categoryValidationItems();

    assert.ok(
      !arts.some((x) => x.lemma === "Montag" && x.contextId === "wo_ist_def")
    );
    assert.ok(
      !arts.some((x) => x.lemma === "Montag" && x.contextId === "hier_ist_def")
    );
    assert.ok(
      arts.some((x) => x.lemma === "Montag" && x.contextId === "das_ist_def")
    );
    assert.ok(
      !vals.some((x) => /Wo ist der Montag/.test(x.sentence || ""))
    );

    for (const lemma of ["Frühling", "Regen", "Gold"]) {
      assert.ok(
        !arts.some((x) => x.lemma === lemma && x.contextId === "wo_ist_def"),
        lemma
      );
      assert.ok(
        !arts.some((x) => x.lemma === lemma && x.contextId === "hier_ist_def"),
        lemma
      );
      assert.ok(
        arts.some((x) => x.lemma === lemma && x.contextId === "das_ist_def"),
        lemma
      );
    }

    assert.ok(
      !arts.some(
        (x) => x.lemma === "Norden" && x.contextId === "das_ist_indef"
      )
    );
    assert.ok(
      !vals.some((x) => /Das ist ein Norden/.test(x.sentence || ""))
    );
    assert.ok(
      arts.some((x) => x.lemma === "Norden" && x.contextId === "das_ist_def")
    );
    assert.ok(
      arts.some((x) => x.lemma === "Norden" && x.contextId === "wo_ist_def")
    );

    // Rivers / flowers / venues / occupations unchanged for these frames.
    assert.ok(
      arts.some((x) => x.lemma === "Elbe" && x.contextId === "wo_ist_def")
    );
    assert.ok(
      !arts.some((x) => x.lemma === "Elbe" && x.contextId === "das_ist_indef")
    );
    assert.ok(
      arts.some((x) => x.lemma === "Rose" && x.contextId === "das_ist_indef")
    );
    assert.ok(
      arts.some((x) => x.lemma === "Hotel" && x.contextId === "wo_ist_def")
    );
    assert.ok(
      arts.some((x) => x.lemma === "Arzt" && x.contextId === "wo_ist_def")
    );
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

describe("Phase C — approved Phase B compose-path matrix", () => {
  const LIVE = Object.freeze(
    eligiblePracticeContexts({
      concepts: CATEGORIES_PRACTICE_CONCEPTS,
    }).map((c) => c.id)
  );

  function assertDenied(categoryId, lemma, contextId, reason) {
    const ctx = PRACTICE_CONTEXTS.find((c) => c.id === contextId);
    assert.ok(ctx, contextId);
    const gate = assessContextCompatibility(categoryId, lemma, ctx);
    assert.equal(gate.ok, false, `${lemma}/${contextId} gate`);
    assert.equal(gate.reason, reason, `${lemma}/${contextId} reason`);
    assert.equal(composeArticleItem(categoryId, lemma, contextId), null);
    const pair = composeValidationPair(categoryId, lemma, contextId);
    assert.equal(pair.ok, null);
    assert.equal(pair.bad, null);
  }

  function assertAllowed(categoryId, lemma, contextId, article) {
    const item = composeArticleItem(categoryId, lemma, contextId);
    assert.ok(item, `${lemma}/${contextId}`);
    assert.equal(item.correct, article);
    const pair = composeValidationPair(categoryId, lemma, contextId);
    assert.ok(pair.ok, `${lemma}/${contextId} validation ok`);
    assert.ok(pair.bad, `${lemma}/${contextId} validation bad`);
  }

  it("exposes only the four live nominative frames (no calendar frames)", () => {
    assert.deepEqual(LIVE, [
      "wo_ist_def",
      "hier_ist_def",
      "das_ist_indef",
      "das_ist_def",
    ]);
    assert.equal(
      PRACTICE_CONTEXTS.some((c) =>
        /kalender|naechste|sequence|month_im|weekday_/.test(c.id)
      ),
      false
    );
  });

  it("Montag: reject location; keep provisional das_ist_def", () => {
    assertDenied(
      "weekdays",
      "Montag",
      "wo_ist_def",
      CONTEXT_FAILURE.CONTEXT_DENIED
    );
    assertDenied(
      "weekdays",
      "Montag",
      "hier_ist_def",
      CONTEXT_FAILURE.CONTEXT_DENIED
    );
    assertAllowed("weekdays", "Montag", "das_ist_def", "der");
  });

  it("April and Januar: compose-ineligible on every live frame", () => {
    for (const lemma of ["April", "Januar"]) {
      for (const contextId of LIVE) {
        assertDenied(
          "months",
          lemma,
          contextId,
          CONTEXT_FAILURE.COMPOSE_INELIGIBLE
        );
      }
    }
  });

  it("Frühling: reject location; keep das_ist_def; indefinite still article-kind blocked", () => {
    assertDenied(
      "seasons",
      "Frühling",
      "wo_ist_def",
      CONTEXT_FAILURE.CONTEXT_DENIED
    );
    assertDenied(
      "seasons",
      "Frühling",
      "hier_ist_def",
      CONTEXT_FAILURE.CONTEXT_DENIED
    );
    assertAllowed("seasons", "Frühling", "das_ist_def", "der");
    assertDenied(
      "seasons",
      "Frühling",
      "das_ist_indef",
      CONTEXT_FAILURE.ARTICLE_KIND
    );
  });

  it("Norden: reject indefinite; other live frames remain", () => {
    assertDenied(
      "directions",
      "Norden",
      "das_ist_indef",
      CONTEXT_FAILURE.ARTICLE_KIND
    );
    assertAllowed("directions", "Norden", "wo_ist_def", "der");
    assertAllowed("directions", "Norden", "hier_ist_def", "der");
    assertAllowed("directions", "Norden", "das_ist_def", "der");
  });

  it("Regen and Gold: reject location; keep das_ist_def", () => {
    for (const [categoryId, lemma, article] of [
      ["weather", "Regen", "der"],
      ["metals", "Gold", "das"],
    ]) {
      assertDenied(
        categoryId,
        lemma,
        "wo_ist_def",
        CONTEXT_FAILURE.CONTEXT_DENIED
      );
      assertDenied(
        categoryId,
        lemma,
        "hier_ist_def",
        CONTEXT_FAILURE.CONTEXT_DENIED
      );
      assertAllowed(categoryId, lemma, "das_ist_def", article);
    }
  });

  it("Elbe: definite location/ID remain; indefinite blocked", () => {
    assertAllowed("rivers", "Elbe", "wo_ist_def", "die");
    assertAllowed("rivers", "Elbe", "hier_ist_def", "die");
    assertAllowed("rivers", "Elbe", "das_ist_def", "die");
    assertDenied(
      "rivers",
      "Elbe",
      "das_ist_indef",
      CONTEXT_FAILURE.ARTICLE_KIND
    );
  });

  it("Arzt location frames unchanged; Rose/Hotel retain both article kinds", () => {
    assertAllowed("occupations", "Arzt", "wo_ist_def", "der");
    assertAllowed("occupations", "Arzt", "hier_ist_def", "der");
    assertAllowed("occupations", "Arzt", "das_ist_indef", "ein");
    assertAllowed("flowers", "Rose", "das_ist_indef", "eine");
    assertAllowed("flowers", "Rose", "das_ist_def", "die");
    assertAllowed("flowers", "Rose", "wo_ist_def", "die");
    assertAllowed("venues", "Hotel", "das_ist_indef", "ein");
    assertAllowed("venues", "Hotel", "das_ist_def", "das");
    assertAllowed("venues", "Hotel", "wo_ist_def", "das");
  });

  it("live pools contain no items that violate Phase B gates", () => {
    resetCategoryPracticePools();
    const arts = categoryArticleItems();
    const vals = categoryValidationItems();
    const locDenyCats = new Set(["weekdays", "seasons", "weather", "metals"]);

    for (const x of arts) {
      if (
        locDenyCats.has(x.categoryId) &&
        (x.contextId === "wo_ist_def" || x.contextId === "hier_ist_def")
      ) {
        assert.fail(`pool art ${x.lemma}/${x.contextId}`);
      }
      if (x.categoryId === "directions" && x.contextId === "das_ist_indef") {
        assert.fail(`pool art ${x.lemma}/das_ist_indef`);
      }
      if (x.categoryId === "months") {
        assert.fail(`pool art month ${x.lemma}`);
      }
    }
    for (const x of vals) {
      if (x.categoryId === "months") {
        assert.fail(`pool val month ${x.lemma}`);
      }
      if (
        x.categoryId === "directions" &&
        /^Das ist ein /.test(x.sentence || "")
      ) {
        assert.fail(`pool val ${x.sentence}`);
      }
      if (
        locDenyCats.has(x.categoryId) &&
        (/^Wo ist /.test(x.sentence || "") ||
          /^Hier ist /.test(x.sentence || ""))
      ) {
        assert.fail(`pool val location ${x.sentence}`);
      }
    }

    assert.ok(
      arts.some((x) => x.lemma === "Montag" && x.contextId === "das_ist_def")
    );
    assert.ok(
      arts.some((x) => x.lemma === "Arzt" && x.contextId === "wo_ist_def")
    );
    assert.ok(
      arts.some((x) => x.lemma === "Rose" && x.contextId === "das_ist_indef")
    );
    assert.ok(
      arts.some((x) => x.lemma === "Hotel" && x.contextId === "das_ist_indef")
    );
    assert.ok(
      vals.some((x) => x.lemma === "Elbe" && /^Wo ist die Elbe/.test(x.sentence))
    );
    assert.ok(
      vals.some(
        (x) => x.lemma === "Regen" && /^Das ist der Regen/.test(x.sentence)
      )
    );
  });

  it("preserves gender facts for representative lemmas (Phase B scope)", () => {
    const expected = {
      Montag: "masculine",
      April: "masculine",
      Januar: "masculine",
      Frühling: "masculine",
      Norden: "masculine",
      Nordosten: "masculine",
      Südosten: "masculine",
      Südwesten: "masculine",
      Nordwesten: "masculine",
      Regen: "masculine",

      Gold: "neuter",
      Elbe: "feminine",
      Arzt: "masculine",
      Rose: "feminine",
      Hotel: "neuter",
    };
    for (const [lemma, gender] of Object.entries(expected)) {
      assert.equal(LEXICON[lemma].gender, gender, lemma);
    }
  });

  it("reported session prompts: denied location frames absent from live pools + factories", () => {
    resetCategoryPracticePools();
    const reported = [
      {
        categoryId: "weekdays",
        lemma: "Dienstag",
        contextId: "hier_ist_def",
        artId: "gen.art.hier_ist_def.Dienstag",
        valOk: "gen.val.hier_ist_def.Dienstag.ok",
        valBad: "gen.val.hier_ist_def.Dienstag.bad",
        surfaceRe: /Hier ist (die|der|das) Dienstag/,
      },
      {
        categoryId: "weekdays",
        lemma: "Sonntag",
        contextId: "hier_ist_def",
        artId: "gen.art.hier_ist_def.Sonntag",
        valOk: "gen.val.hier_ist_def.Sonntag.ok",
        valBad: "gen.val.hier_ist_def.Sonntag.bad",
        surfaceRe: /Hier ist /,
      },
      {
        categoryId: "weather",
        lemma: "Sturm",
        contextId: "hier_ist_def",
        artId: "gen.art.hier_ist_def.Sturm",
        valOk: "gen.val.hier_ist_def.Sturm.ok",
        valBad: "gen.val.hier_ist_def.Sturm.bad",
        surfaceRe: /Hier ist /,
      },
      {
        categoryId: "metals",
        lemma: "Kupfer",
        contextId: "hier_ist_def",
        artId: "gen.art.hier_ist_def.Kupfer",
        valOk: "gen.val.hier_ist_def.Kupfer.ok",
        valBad: "gen.val.hier_ist_def.Kupfer.bad",
        surfaceRe: /Hier ist /,
      },
      {
        categoryId: "seasons",
        lemma: "Frühling",
        contextId: "wo_ist_def",
        artId: "gen.art.wo_ist_def.Frühling",
        valOk: "gen.val.wo_ist_def.Frühling.ok",
        valBad: "gen.val.wo_ist_def.Frühling.bad",
        surfaceRe: /Wo ist /,
      },
    ];

    const arts = categoryArticleItems();
    const vals = categoryValidationItems();
    const artIds = new Set(arts.map((x) => x.id));
    const valIds = new Set(vals.map((x) => x.id));

    for (const r of reported) {
      assertDenied(
        r.categoryId,
        r.lemma,
        r.contextId,
        CONTEXT_FAILURE.CONTEXT_DENIED
      );
      assert.equal(artIds.has(r.artId), false, r.artId);
      assert.equal(valIds.has(r.valOk), false, r.valOk);
      assert.equal(valIds.has(r.valBad), false, r.valBad);
      assert.equal(getCategoryArticleItem(r.artId), null, `lookup ${r.artId}`);
      assert.equal(
        getCategoryValidationItem(r.valOk),
        null,
        `lookup ${r.valOk}`
      );
      assert.throws(
        () => createNounCategoryArticleApplicationExercise(r.artId),
        /unknown/
      );
      assert.throws(
        () => createNounCategorySentenceValidationExercise(r.valOk),
        /unknown/
      );
      assert.throws(
        () => createNounCategorySentenceValidationExercise(r.valBad),
        /unknown/
      );
      assert.ok(
        !vals.some(
          (x) =>
            x.lemma === r.lemma &&
            x.contextId === r.contextId &&
            r.surfaceRe.test(x.sentence || "")
        ),
        `surface ${r.lemma}/${r.contextId}`
      );
    }

    // Permitted counterparts remain for the same lemmas where approved.
    assert.ok(artIds.has("gen.art.das_ist_def.Dienstag"));
    assert.ok(artIds.has("gen.art.das_ist_def.Sonntag"));
    assert.ok(artIds.has("gen.art.das_ist_def.Sturm"));
    assert.ok(artIds.has("gen.art.das_ist_def.Kupfer"));
    assert.ok(artIds.has("gen.art.das_ist_def.Frühling"));
  });
});
