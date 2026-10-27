import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildCaseUnitQuestions,
  buildCasePlayDeck,
  caseAttemptEvidence,
  pickNextCaseQuestion,
  assessesFor,
  CASE_PROMPT,
} from "../case-questions.js";
import { CASE_TOPICS } from "../../../mock/js/case-curriculum.js";
import {
  emptyEvidenceStore,
  recordAttemptEvidence,
  grainsOfKind,
  EVIDENCE_GRAIN,
  isConceptEvidenceId,
} from "../../../mock/js/multi-grain-evidence.js";

describe("case accusative questions", () => {
  it("builds recognition, guided, and unguided prompts with distinct assesses ids", () => {
    const masc = buildCaseUnitQuestions("case.acc.masc");
    assert.ok(masc.length >= 3);
    assert.ok(masc.every((q) => q.gender === "masculine"));
    assert.equal(masc[0].promptKind, CASE_PROMPT.RECOGNIZE);
    const hund = masc.filter(
      (q) => q.lemma === "Hund" && q.contextId === "ich_sehe_acc_def"
    );
    assert.equal(hund.length, 3);
    const ids = hund.map((q) => q.assesses);
    assert.equal(new Set(ids).size, 3);
    assert.equal(
      hund.find((q) => q.promptKind === "guided").cue,
      "sehen takes the accusative."
    );
    assert.equal(hund.find((q) => q.promptKind === "unguided").cue, "");
    assert.equal(hund.find((q) => q.promptKind === "guided").correct, "den");
    assert.ok(
      masc.some(
        (q) =>
          q.lemma === "Hund" &&
          q.contextId === "ich_habe_acc_indef" &&
          q.correct === "einen"
      )
    );

    const unchanged = buildCaseUnitQuestions("case.acc.unchanged");
    assert.ok(unchanged.every((q) => q.gender !== "masculine"));
    const frau = unchanged.find(
      (q) =>
        q.lemma === "Frau" &&
        q.contextId === "ich_sehe_acc_indef" &&
        q.promptKind === "guided"
    );
    assert.equal(frau.correct, "eine");
    assert.equal(assessesFor(frau, "guided"), frau.assesses);
  });

  it("an unguided miss records only the combined skill", () => {
    const pool = buildCaseUnitQuestions("case.acc.masc");
    const unguided = pool.find(
      (q) =>
        q.lemma === "Mann" &&
        q.contextId === "ich_habe_acc_def" &&
        q.promptKind === "unguided"
    );
    const ev = caseAttemptEvidence(unguided, false);
    assert.deepEqual(ev.evidenceIds, [unguided.assesses]);
    assert.ok(ev.evidenceIds[0].startsWith("apply.haben.accusative."));
    assert.ok(
      ev.evidenceIds.every(
        (id) => !id.startsWith("article.") && !id.startsWith("construction.")
      )
    );
    assert.equal(ev.componentFollowup.reason, "component_followup");
    assert.ok(isConceptEvidenceId(ev.evidenceIds[0]));

    const store = emptyEvidenceStore();
    recordAttemptEvidence(store, {
      dealKey: "case:accusative:masc",
      presetId: "choose",
      evidenceIds: ev.evidenceIds,
      correct: false,
    });
    const concepts = grainsOfKind(store, EVIDENCE_GRAIN.CONCEPT).map(
      (g) => g.stat.conceptId
    );
    assert.deepEqual(concepts, [unguided.assesses]);

    const next = pickNextCaseQuestion(pool, {
      followup: ev.componentFollowup,
      excludeId: unguided.id,
    });
    assert.equal(next.reason, "component_followup");
    assert.equal(next.question.promptKind, "guided");
    assert.equal(next.question.lemma, "Mann");
    assert.equal(next.question.contextId, "ich_habe_acc_def");
    assert.ok(next.question.assesses.startsWith("article."));
  });
});

describe("case dative questions", () => {
  it("follows the rewritten arc: accusative constructions, then dative, then mixed", () => {
    const ids = CASE_TOPICS.flatMap((topic) => topic.steps.map((step) => step.unitId));
    assert.deepEqual(ids, [
      "case.acc.masc",
      "case.acc.unchanged",
      "case.prep.fuer",
      "case.prep.ohne",
      "case.acc.verbs",
      "case.prep.warten-auf",
      "case.dat.helfen",
      "case.prep.mit",
      "case.prep.aus",
      "case.verb.danken",
      "case.verb.gefallen",
      "case.dat.indef",
      "case.dat.plural",
      "case.prep.passen-zu",
      "case.mixed",
    ]);
    assert.ok(ids.indexOf("case.dat.helfen") < ids.indexOf("case.dat.indef"));
    assert.ok(ids.indexOf("case.dat.indef") < ids.indexOf("case.dat.plural"));
    assert.ok(ids.indexOf("case.dat.plural") < ids.indexOf("case.prep.passen-zu"));
  });

  it("keeps helfen definite, then einem and einer, on separate assesses ids", () => {
    const helfen = buildCaseUnitQuestions("case.dat.helfen");
    assert.equal(helfen.length, 9);
    assert.ok(helfen.every((q) => q.articleKind === "definite" && q.number === "singular"));
    assert.equal(
      helfen.find((q) => q.lemma === "Mann" && q.promptKind === "guided").correct,
      "dem"
    );
    assert.equal(
      helfen.find((q) => q.lemma === "Frau" && q.promptKind === "guided").cue,
      "helfen takes the dative."
    );
    assert.ok(!helfen.some((q) => q.correct === "einem" || q.lemma === "Bus"));

    const indef = buildCaseUnitQuestions("case.dat.indef");
    assert.equal(
      indef.find((q) => q.lemma === "Frau" && q.promptKind === "guided").correct,
      "einer"
    );
    const frau = indef.find(
      (q) => q.lemma === "Frau" && q.promptKind === "unguided"
    );
    assert.equal(frau.assesses, "apply.helfen.dative.feminine.indefinite");
    assert.notEqual(
      frau.assesses,
      indef.find((q) => q.lemma === "Frau" && q.promptKind === "guided").assesses
    );
  });

  it("splits plural dative article den from the noun ending", () => {
    const plural = buildCaseUnitQuestions("case.dat.plural");
    assert.equal(plural[0].target, "article");
    assert.equal(plural[0].correct, "den");
    const articleGuided = plural.find(
      (q) => q.target === "article" && q.lemma === "Kind" && q.promptKind === "guided"
    );
    const nounGuided = plural.find(
      (q) => q.target === "noun" && q.lemma === "Kind" && q.promptKind === "guided"
    );
    const frauNoun = plural.find(
      (q) => q.target === "noun" && q.lemma === "Frau" && q.promptKind === "guided"
    );
    assert.equal(articleGuided.correct, "den");
    assert.equal(articleGuided.prompt, "Ich helfe ___ Kindern.");
    assert.equal(nounGuided.correct, "Kindern");
    assert.equal(nounGuided.prompt, "Ich helfe den ___.");
    assert.equal(frauNoun.correct, "Frauen");
    assert.equal(frauNoun.prompt, "Ich helfe den ___.");
    assert.equal(frauNoun.cue, "This plural already ends in -n.");
    assert.notEqual(articleGuided.assesses, nounGuided.assesses);
    assert.ok(
      plural.every(
        (q) =>
          q.target === "article" ||
          q.lemma === "Kind" ||
          q.lemma === "Hund" ||
          q.lemma === "Frau"
      )
    );
    const nounIndex = plural.findIndex((q) => q.target === "noun");
    const lastArticle = plural.reduce(
      (acc, q, i) => (q.target === "article" ? i : acc),
      -1
    );
    assert.ok(lastArticle < nounIndex);

    const unguided = plural.find(
      (q) => q.target === "noun" && q.lemma === "Kind" && q.promptKind === "unguided"
    );
    const ev = caseAttemptEvidence(unguided, false);
    assert.deepEqual(ev.evidenceIds, [unguided.assesses]);
    assert.ok(!ev.evidenceIds[0].startsWith("article."));
    assert.ok(!ev.evidenceIds[0].startsWith("lexical."));
    const next = pickNextCaseQuestion(plural, {
      followup: ev.componentFollowup,
      excludeId: unguided.id,
    });
    assert.equal(next.reason, "component_followup");
    assert.equal(next.question.promptKind, "guided");
    assert.equal(next.question.target, "noun");
    assert.equal(next.question.lemma, "Kind");
    assert.equal(next.question.assesses, "lexical.Kind.dative-plural");
  });
});

describe("case rewritten constructions", () => {
  it("grades ohne, the accusative verbs, aus dem Haus, and passen zu", () => {
    const ohne = buildCaseUnitQuestions("case.prep.ohne");
    assert.equal(
      ohne.find((q) => q.lemma === "Schlüssel" && q.articleKind === "definite" && q.promptKind === "guided").correct,
      "den"
    );
    assert.equal(
      ohne.find((q) => q.lemma === "Tasche" && q.promptKind === "guided").sentence,
      "Ich gehe ohne die Tasche."
    );
    assert.equal(
      ohne.find((q) => q.lemma === "Ticket" && q.promptKind === "guided").correct,
      "das"
    );
    assert.equal(
      ohne.find((q) => q.lemma === "Schlüssel" && q.articleKind === "indefinite" && q.promptKind === "guided").correct,
      "einen"
    );

    const verbs = buildCaseUnitQuestions("case.acc.verbs");
    assert.equal(
      verbs.find((q) => q.lemma === "Hotel" && q.promptKind === "guided").sentence,
      "Ich finde das Hotel."
    );
    assert.equal(
      verbs.find((q) => q.lemma === "Bus" && q.promptKind === "guided").correct,
      "den"
    );
    assert.equal(
      verbs.find((q) => q.lemma === "Schlüssel" && q.articleKind === "indefinite" && q.promptKind === "guided").correct,
      "einen"
    );

    const aus = buildCaseUnitQuestions("case.prep.aus");
    assert.equal(
      aus.find((q) => q.lemma === "Haus" && q.promptKind === "guided").sentence,
      "Er kommt aus dem Haus."
    );

    const passen = buildCaseUnitQuestions("case.prep.passen-zu");
    assert.equal(
      passen.find((q) => q.lemma === "Hemd" && q.promptKind === "guided").correct,
      "dem"
    );
    assert.equal(
      passen.find((q) => q.lemma === "Kleid" && q.promptKind === "guided").correct,
      "einem"
    );
    assert.ok(passen.every((q) => !/zum|zur/.test(q.sentence)));
  });
});

describe("case mixed questions", () => {
  it("asks one slot at a time and withholds the case on the unguided prompt", () => {
    const order = CASE_TOPICS.flatMap((topic) => topic.steps.map((step) => step.unitId));
    assert.ok(order.indexOf("case.dat.plural") < order.indexOf("case.mixed"));
    assert.equal(order.at(-1), "case.mixed");

    const mixed = buildCaseUnitQuestions("case.mixed");
    assert.equal(mixed.length, 30);
    assert.ok(mixed.every((q) => q.cue === "" || q.promptKind === "guided"));
    assert.ok(
      mixed
        .filter((q) => q.promptKind === "unguided")
        .every((q) => q.cue === "" && !/dative|accusative|nominative/i.test(q.prompt))
    );
    assert.ok(!mixed.some((q) => q.sentence === "Den Mann sieht der Hund."));
    assert.ok(!mixed.some((q) => q.sentence.includes("sieht der")));

    const zeigt = mixed.filter((q) => q.contextId === "zeigt_frau_mann_buch");
    assert.deepEqual(
      [...new Set(zeigt.map((q) => q.lemma))],
      ["Buch", "Mann"]
    );
    const mannGuided = zeigt.find((q) => q.lemma === "Mann" && q.promptKind === "guided");
    const buchGuided = zeigt.find((q) => q.lemma === "Buch" && q.promptKind === "guided");
    assert.equal(mannGuided.prompt, "Die Frau zeigt ___ Mann das Buch.");
    assert.equal(mannGuided.correct, "dem");
    assert.equal(mannGuided.cue, "zeigen takes the dative.");
    assert.equal(buchGuided.prompt, "Die Frau zeigt dem Mann ___ Buch.");
    assert.equal(buchGuided.correct, "das");
    assert.notEqual(mannGuided.assesses, buchGuided.assesses);

    const buchUnguided = zeigt.find((q) => q.lemma === "Buch" && q.promptKind === "unguided");
    const ev = caseAttemptEvidence(buchUnguided, false);
    assert.deepEqual(ev.evidenceIds, [buchUnguided.assesses]);
    assert.equal(ev.evidenceIds[0], "apply.zeigen.accusative.neuter.definite");
    const next = pickNextCaseQuestion(mixed, {
      followup: ev.componentFollowup,
      excludeId: buchUnguided.id,
    });
    assert.equal(next.question.id, buchGuided.id);

    const subject = mixed.find(
      (q) =>
        q.contextId === "sehen_mann_hund" &&
        q.lemma === "Mann" &&
        q.promptKind === "guided"
    );
    assert.equal(subject.correct, "Der");
    assert.equal(subject.prompt, "___ Mann sieht den Hund.");
    assert.equal(subject.cue, "The subject is nominative.");
    assert.equal(subject.sentence, "Der Mann sieht den Hund.");

    const geben = mixed.filter((q) => q.contextId === "geben_kind_ball");
    assert.deepEqual([...new Set(geben.map((q) => q.lemma))].sort(), ["Ball", "Kind"]);
    assert.ok(geben.every((q) => q.sentence === "Ich gebe dem Kind den Ball."));
    assert.ok(!mixed.some((q) => q.lemma === "Zeitung" || q.lemma === "Frau"));
  });
});

describe("case play deck", () => {
  it("judges a changed form, then types it from the citation", () => {
    const play = buildCasePlayDeck(buildCaseUnitQuestions("case.acc.masc"));
    const types = new Set(play.map((q) => q.quizType));
    assert.equal(play.some((q) => q.quizType === "case-name"), false);
    assert.ok(types.has("proofread"));
    assert.ok(types.has("sentence"));
    assert.ok(types.has("type"));
    assert.ok(types.has("listen"));
    assert.ok(types.has("build"));
    assert.ok(types.size >= 2);
    const typed = play.find(
      (q) => q.quizType === "type" && q.lemma === "Bus" && q.articleKind === "definite"
    );
    assert.equal(typed.prompt, "der Bus");
    assert.equal(typed.correct, "den");
    assert.equal(typed.interaction.presetId, "produce");
    assert.equal(typed.interaction.response, "freeform");
    assert.equal(typed.prompt.includes("___"), false);
    const judged = play.filter((q) => q.quizType === "proofread");
    assert.ok(judged.some((q) => q.correct === "Richtig"));
    assert.ok(judged.some((q) => q.correct === "Falsch"));
    assert.ok(play.some((q) => q.quizType === "sentence" && q.cueLocked));
    const mascModes = CASE_TOPICS.find((topic) => topic.id === "accusative").steps.find(
      (step) => step.id === "masc"
    ).modes;
    assert.ok(mascModes.includes("proofread"));
    assert.ok(mascModes.includes("produce"));
    assert.equal(mascModes.every((mode) => mode === "choose"), false);
  });

  it("does not ask for a typed article when the form does not change", () => {
    const unchanged = buildCasePlayDeck(buildCaseUnitQuestions("case.acc.unchanged"));
    const types = new Set(unchanged.map((q) => q.quizType));
    assert.equal(unchanged.some((q) => q.quizType === "type"), false);
    assert.ok(types.has("proofread"));
    assert.ok(types.has("sentence") || types.has("build") || types.has("listen"));
    assert.ok(types.size >= 2);
    for (const id of ["case.dat.helfen", "case.prep.fuer", "case.dat.plural", "case.prep.ohne"]) {
      const play = buildCasePlayDeck(buildCaseUnitQuestions(id));
      assert.equal(play.some((q) => q.quizType === "case-name"), false, id);
      assert.ok(new Set(play.map((q) => q.quizType)).size >= 2, id);
    }
  });

  it("asks what case in mixed, with a nominative, accusative, and dative answer", () => {
    const play = buildCasePlayDeck(buildCaseUnitQuestions("case.mixed"));
    const names = play.filter((q) => q.quizType === "case-name");
    assert.deepEqual(
      [...new Set(names.map((q) => q.correct))].sort(),
      ["Accusative", "Dative", "Nominative"]
    );
    assert.ok(names.every((q) => q.choices.join() === "Nominative,Accusative,Dative"));
    const dative = names.find((q) => q.correct === "Dative" && q.lemma === "Kind");
    assert.equal(dative.focusPhrase, "dem Kind");
    assert.equal(dative.sentence, "Ich gebe dem Kind den Ball.");

    const subject = play.filter(
      (q) => q.contextId === "sehen_mann_hund" && q.lemma === "Mann"
    );
    assert.ok(subject.some((q) => q.quizType === "proofread"));
    assert.equal(play.some((q) => q.quizType === "convert"), false);
    assert.ok(play.some((q) => q.quizType === "sentence"));
    const groups = new Map();
    for (const card of play.filter((q) => q.quizType === "sentence")) {
      const key = `${card.contextId}\0${card.lemma}`;
      groups.set(key, true);
    }
    const pool = buildCaseUnitQuestions("case.mixed").filter(
      (q) => q.promptKind === "guided"
    );
    assert.ok(groups.size > 0 && groups.size < pool.length);
  });
});
