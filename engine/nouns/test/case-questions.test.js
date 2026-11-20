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
import { CASE_ARC_UNIT_IDS } from "../case-unit-ids.js";

describe("case chart incidental sentences", () => {
  it("builds recognition, guided, and unguided prompts with distinct assesses ids", () => {
    const chart = buildCaseUnitQuestions("case.chart");
    assert.ok(chart.length >= 3);
    assert.ok(chart.some((q) => q.gender === "masculine"));
    assert.ok(chart.some((q) => q.gender !== "masculine"));
    assert.equal(chart[0].promptKind, CASE_PROMPT.RECOGNIZE);
    const hund = chart.filter(
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
      chart.some(
        (q) =>
          q.lemma === "Hund" &&
          q.contextId === "ich_habe_acc_indef" &&
          q.correct === "einen"
      )
    );

    const frau = chart.find(
      (q) =>
        q.lemma === "Frau" &&
        q.contextId === "ich_sehe_acc_indef" &&
        q.promptKind === "guided"
    );
    assert.equal(frau.correct, "eine");
    assert.equal(assessesFor(frau, "guided"), frau.assesses);
  });

  it("an unguided miss records only the combined skill", () => {
    const pool = buildCaseUnitQuestions("case.chart");
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
      dealKey: "case:chart:chart",
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

describe("case soft arc", () => {
  it("follows the 8-unit Appendix H arc", () => {
    const ids = CASE_TOPICS.flatMap((topic) => topic.steps.map((step) => step.unitId));
    assert.deepEqual(ids, [...CASE_ARC_UNIT_IDS]);
    assert.ok(ids.indexOf("case.chart") < ids.indexOf("case.prep.acc"));
    assert.ok(ids.indexOf("case.prep.acc") < ids.indexOf("case.verbs.dat"));
    assert.ok(ids.indexOf("case.dat.plural") < ids.indexOf("case.mixed"));
    assert.equal(ids.at(-1), "case.mixed");
  });

  it("keeps helfen definite and indefinite on separate assesses ids inside verbs.dat", () => {
    const helfen = buildCaseUnitQuestions("case.verbs.dat").filter(
      (q) => q.construction === "helfen"
    );
    const definite = helfen.filter((q) => q.articleKind === "definite");
    assert.ok(definite.every((q) => q.number === "singular"));
    assert.equal(
      helfen.find((q) => q.lemma === "Mann" && q.articleKind === "definite" && q.promptKind === "guided").correct,
      "dem"
    );
    assert.equal(
      helfen.find((q) => q.lemma === "Frau" && q.articleKind === "definite" && q.promptKind === "guided").cue,
      "helfen takes the dative."
    );
    assert.equal(
      helfen.find((q) => q.lemma === "Kind" && q.articleKind === "indefinite" && q.promptKind === "guided").correct,
      "einem"
    );
    assert.ok(!helfen.some((q) => q.lemma === "Bus"));

    const frau = helfen.find(
      (q) => q.lemma === "Frau" && q.articleKind === "indefinite" && q.promptKind === "unguided"
    );
    assert.equal(frau.assesses, "apply.helfen.dative.feminine.indefinite");
    assert.notEqual(
      frau.assesses,
      helfen.find((q) => q.lemma === "Frau" && q.articleKind === "indefinite" && q.promptKind === "guided").assesses
    );
  });

  it("tags per-construction skills inside unified OFUDGE and Blue Danube units", () => {
    const prepAcc = buildCaseUnitQuestions("case.prep.acc");
    assert.ok(prepAcc.some((q) => q.construction === "durch"));
    assert.ok(prepAcc.some((q) => q.construction === "gegen"));
    assert.ok(prepAcc.some((q) => q.construction === "um"));
    const durch = prepAcc.find(
      (q) => q.construction === "durch" && q.promptKind === "unguided"
    );
    assert.ok(durch.assesses.includes("durch"));
    const follow = caseAttemptEvidence(durch, false).componentFollowup.probes;
    assert.ok(follow.includes("construction.durch.accusative"));

    const prepDat = buildCaseUnitQuestions("case.prep.dat");
    assert.ok(prepDat.some((q) => q.construction === "seit"));
    assert.ok(prepDat.some((q) => q.construction === "zu"));
    assert.ok(prepDat.some((q) => q.construction === "passen-zu"));
    const seit = prepDat.find(
      (q) => q.construction === "seit" && q.promptKind === "unguided"
    );
    assert.ok(
      caseAttemptEvidence(seit, false).componentFollowup.probes.includes(
        "construction.seit.dative"
      )
    );

    const verbsDat = buildCaseUnitQuestions("case.verbs.dat");
    assert.ok(verbsDat.some((q) => q.construction === "antworten"));
    assert.ok(verbsDat.some((q) => q.construction === "gehoeren"));
    assert.ok(verbsDat.some((q) => q.construction === "passen"));
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

    const unguided = plural.find(
      (q) => q.target === "noun" && q.lemma === "Kind" && q.promptKind === "unguided"
    );
    const ev = caseAttemptEvidence(unguided, false);
    assert.deepEqual(ev.evidenceIds, [unguided.assesses]);
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
  it("grades OFUDGE, accusative verbs, Blue Danube, and passen zu", () => {
    const ofudge = buildCaseUnitQuestions("case.prep.acc");
    assert.equal(
      ofudge.find((q) => q.lemma === "Schlüssel" && q.articleKind === "definite" && q.construction === "ohne" && q.promptKind === "guided").correct,
      "den"
    );
    assert.equal(
      ofudge.find((q) => q.lemma === "Tasche" && q.construction === "ohne" && q.promptKind === "guided").sentence,
      "Ich gehe ohne die Tasche."
    );
    assert.equal(
      ofudge.find((q) => q.lemma === "Park" && q.construction === "durch" && q.promptKind === "guided").correct,
      "den"
    );

    const verbs = buildCaseUnitQuestions("case.verbs.acc");
    assert.equal(
      verbs.find((q) => q.lemma === "Hotel" && q.promptKind === "guided").sentence,
      "Ich finde das Hotel."
    );
    assert.equal(
      verbs.find((q) => q.lemma === "Bus" && q.promptKind === "guided").correct,
      "den"
    );

    const blue = buildCaseUnitQuestions("case.prep.dat");
    assert.equal(
      blue.find((q) => q.lemma === "Haus" && q.construction === "aus" && q.promptKind === "guided").sentence,
      "Er kommt aus dem Haus."
    );
    assert.equal(
      blue.find((q) => q.sentence === "Die Jacke passt zu dem Hemd." && q.promptKind === "guided").correct,
      "dem"
    );
    assert.equal(
      blue.find((q) => q.sentence === "Das passt zu einem Kleid." && q.promptKind === "guided").correct,
      "einem"
    );
    assert.ok(blue.every((q) => !/zum|zur/.test(q.sentence)));
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

    const zeigt = mixed.filter((q) => q.contextId === "zeigt_frau_mann_buch");
    assert.deepEqual(
      [...new Set(zeigt.map((q) => q.lemma))],
      ["Buch", "Mann"]
    );
    const mannGuided = zeigt.find((q) => q.lemma === "Mann" && q.promptKind === "guided");
    const buchGuided = zeigt.find((q) => q.lemma === "Buch" && q.promptKind === "guided");
    assert.equal(mannGuided.prompt, "Die Frau zeigt ___ Mann das Buch.");
    assert.equal(mannGuided.correct, "dem");
    assert.equal(buchGuided.correct, "das");
    assert.notEqual(mannGuided.assesses, buchGuided.assesses);

    const buchUnguided = zeigt.find((q) => q.lemma === "Buch" && q.promptKind === "unguided");
    const ev = caseAttemptEvidence(buchUnguided, false);
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
    assert.equal(subject.sentence, "Der Mann sieht den Hund.");
  });

  it("Build prompts keep the sentence frame for subject-initial sehen/helfen", () => {
    const play = buildCasePlayDeck(buildCaseUnitQuestions("case.mixed"));
    const sehenHund = play.find(
      (q) =>
        q.quizType === "build" &&
        q.contextId === "sehen_hund_mann" &&
        q.lemma === "Hund"
    );
    const sehenMann = play.find(
      (q) =>
        q.quizType === "build" &&
        q.contextId === "sehen_mann_hund" &&
        q.lemma === "Mann"
    );
    assert.ok(sehenHund);
    assert.equal(sehenHund.prompt, "___ sieht den Mann.");
    assert.equal(sehenHund.correct, "Der Hund");
    assert.equal(sehenHund.prompt.includes("sehen"), false);
    assert.ok(sehenMann);
    assert.equal(sehenMann.prompt, "___ sieht den Hund.");
    assert.equal(sehenMann.correct, "Der Mann");

    const geben = play.find(
      (q) => q.quizType === "build" && q.contextId === "geben_kind_ball" && q.lemma === "Kind"
    );
    assert.ok(geben);
    assert.equal(geben.prompt, "Ich gebe ___ den Ball.");
    assert.equal(geben.correct, "dem Kind");

    // helfen subject is the same empty-before shape; if Build is dealt, frame it.
    const helfenQ = buildCaseUnitQuestions("case.mixed").find(
      (q) =>
        q.contextId === "helfen_lehrer_schueler" &&
        q.lemma === "Lehrer" &&
        q.promptKind === "guided"
    );
    assert.equal(helfenQ?.prompt, "___ Lehrer hilft dem Schüler.");
  });
});

describe("case play deck", () => {
  it("judges a changed form without typing the article from the citation", () => {
    const play = buildCasePlayDeck(buildCaseUnitQuestions("case.prep.acc"));
    const types = new Set(play.map((q) => q.quizType));
    assert.equal(play.some((q) => q.quizType === "case-name"), false);
    assert.ok(types.has("proofread"));
    assert.ok(types.has("sentence"));
    assert.ok(types.has("listen"));
    assert.ok(types.has("build"));
    assert.ok(types.has("sentence-type"));
    assert.equal(
      play.some((q) => q.quizType === "type" && q.target === "article"),
      false
    );
    const prepModes = CASE_TOPICS.find((topic) => topic.id === "accusative").steps.find(
      (step) => step.id === "prep-acc"
    ).modes;
    assert.ok(prepModes.includes("proofread"));
    assert.equal(prepModes.includes("produce"), false);
  });

  it("does not ask for a typed article from the citation form", () => {
    for (const id of ["case.verbs.dat", "case.prep.acc", "case.dat.plural", "case.prep.dat"]) {
      const play = buildCasePlayDeck(buildCaseUnitQuestions(id));
      assert.equal(play.some((q) => q.quizType === "case-name"), false, id);
      assert.equal(
        play.some((q) => q.quizType === "type" && q.target === "article"),
        false,
        id
      );
      assert.ok(new Set(play.map((q) => q.quizType)).size >= 2, id);
    }
  });

  it("types the article from the heard sentence and from the written blank", () => {
    const play = buildCasePlayDeck(buildCaseUnitQuestions("case.prep.acc"));
    const heard = play.filter((card) => card.quizType === "listen" && card.construction === "fuer");
    const heardType = play.filter((card) => card.quizType === "listen-type" && card.construction === "fuer");
    assert.deepEqual(
      heardType.map((card) => card.sentence).sort(),
      heard.map((card) => card.sentence).sort()
    );
    const written = play.filter((card) => card.quizType === "sentence-type" && card.construction === "fuer");
    const frau = written.find((card) => card.sentence === "Das Geschenk ist für die Frau.");
    assert.equal(frau.prompt, "Das Geschenk ist für ___ Frau.");
    assert.equal(frau.correct, "die");
    const modes = CASE_TOPICS.find((topic) => topic.id === "accusative").steps.find(
      (step) => step.id === "prep-acc"
    ).modes;
    assert.ok(modes.includes("listen-type"));
    assert.ok(modes.includes("sentence-type"));
  });

  it("asks what case in mixed, with a nominative, accusative, and dative answer", () => {
    const play = buildCasePlayDeck(buildCaseUnitQuestions("case.mixed"));
    const names = play.filter((q) => q.quizType === "case-name");
    assert.deepEqual(
      [...new Set(names.map((q) => q.correct))].sort(),
      ["Accusative", "Dative", "Nominative"]
    );
    const dative = names.find((q) => q.correct === "Dative" && q.lemma === "Kind");
    assert.equal(dative.focusPhrase, "dem Kind");
    assert.equal(dative.sentence, "Ich gebe dem Kind den Ball.");
  });
});

describe("case listen sentences", () => {
  const MUST_HEAR = {
    "case.chart": [
      "Ich sehe den Hund.",
      "Ich sehe die Frau.",
      "Ich habe den Hund.",
      "Ich habe eine Katze.",
    ],
    "case.prep.acc": [
      "Das Geschenk ist für den Mann.",
      "Ich gehe ohne den Schlüssel.",
      "Wir gehen durch den Park.",
      "Das Medikament ist gegen den Husten.",
    ],
    "case.verbs.acc": [
      "Ich brauche den Schlüssel.",
      "Ich finde das Hotel.",
      "Ich nehme den Bus.",
    ],
    "case.prep.warten-auf": [
      "Ich warte auf den Mann.",
      "Ich warte auf die Frau.",
    ],
    "case.verbs.dat": [
      "Ich helfe dem Mann.",
      "Ich danke der Frau.",
      "Ich antworte dem Lehrer.",
      "Das Buch gefällt dem Kind.",
      "Das Buch gehört der Frau.",
      "Das Hemd passt dem Mann.",
    ],
    "case.prep.dat": [
      "Ich fahre mit dem Bus.",
      "Er kommt aus dem Haus.",
      "Ich gehe zu dem Arzt.",
      "Die Jacke passt zu dem Hemd.",
    ],
    "case.dat.plural": [
      "Ich helfe den Kindern.",
      "Ich spiele mit den Hunden.",
    ],
    "case.mixed": [
      "Der Hund sieht den Mann.",
      "Ich gebe dem Kind den Ball.",
    ],
  };

  for (const [unitId, sentences] of Object.entries(MUST_HEAR)) {
    it(`hears required sentences for ${unitId}`, () => {
      const play = buildCasePlayDeck(buildCaseUnitQuestions(unitId));
      const heard = new Set(
        play.filter((card) => card.quizType === "listen" || card.quizType === "listen-type").map((c) => c.sentence)
      );
      for (const sentence of sentences) {
        assert.ok(heard.has(sentence), `${unitId} missing listen: ${sentence}`);
      }
    });
  }
});
