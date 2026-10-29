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
      "case.analysis",
    ]);
    assert.ok(ids.indexOf("case.dat.helfen") < ids.indexOf("case.dat.indef"));
    assert.ok(ids.indexOf("case.dat.indef") < ids.indexOf("case.dat.plural"));
    assert.ok(ids.indexOf("case.dat.plural") < ids.indexOf("case.prep.passen-zu"));
  });

  it("keeps helfen definite and indefinite on separate assesses ids", () => {
    const helfen = buildCaseUnitQuestions("case.dat.helfen");
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
      passen.find((q) => q.sentence === "Die Jacke passt zu dem Hemd." && q.promptKind === "guided").correct,
      "dem"
    );
    assert.equal(
      passen.find((q) => q.sentence === "Das passt zu einem Kleid." && q.promptKind === "guided").correct,
      "einem"
    );
    assert.ok(passen.every((q) => !/zum|zur/.test(q.sentence)));
  });
});

describe("case mixed questions", () => {
  it("asks one slot at a time and withholds the case on the unguided prompt", () => {
    const order = CASE_TOPICS.flatMap((topic) => topic.steps.map((step) => step.unitId));
    assert.ok(order.indexOf("case.dat.plural") < order.indexOf("case.mixed"));
    assert.ok(order.indexOf("case.mixed") < order.indexOf("case.analysis"));
    assert.equal(order.at(-1), "case.analysis");

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
    assert.ok(unchanged.some((q) => q.quizType === "sentence-type"));
    assert.ok(types.has("proofread"));
    assert.ok(types.has("sentence") || types.has("build") || types.has("listen"));
    assert.ok(types.size >= 2);
    for (const id of ["case.dat.helfen", "case.prep.fuer", "case.dat.plural", "case.prep.ohne"]) {
      const play = buildCasePlayDeck(buildCaseUnitQuestions(id));
      assert.equal(play.some((q) => q.quizType === "case-name"), false, id);
      assert.ok(new Set(play.map((q) => q.quizType)).size >= 2, id);
    }
  });

  it("types the article from the heard sentence and from the written blank", () => {
    const play = buildCasePlayDeck(buildCaseUnitQuestions("case.prep.fuer"));
    const heard = play.filter((card) => card.quizType === "listen");
    const heardType = play.filter((card) => card.quizType === "listen-type");
    assert.deepEqual(
      heardType.map((card) => card.sentence).sort(),
      heard.map((card) => card.sentence).sort()
    );
    for (const card of heardType) {
      assert.equal(card.interaction.presetId, "listen-type");
      assert.equal(card.interaction.stimulus, "tts");
      assert.equal(card.interaction.response, "freeform");
      assert.equal(card.choices.length, 0);
      assert.ok(card.assesses.startsWith("produce.heard."));
      assert.equal(card.prompt, card.sentence);
    }
    const written = play.filter((card) => card.quizType === "sentence-type");
    const articles = play.filter(
      (card) => card.quizType === "proofread" && card.target !== "noun"
    );
    assert.equal(written.length, articles.length);
    const frau = written.find((card) => card.sentence === "Das Geschenk ist für die Frau.");
    assert.equal(frau.prompt, "Das Geschenk ist für ___ Frau.");
    assert.equal(frau.correct, "die");
    assert.equal(frau.interaction.presetId, "sentence-type");
    assert.equal(frau.interaction.stimulus, "sentence");
    assert.equal(frau.interaction.response, "freeform");
    assert.ok(frau.assesses.startsWith("produce.sentence."));
    assert.equal(frau.choices.length, 0);
    const modes = CASE_TOPICS.find((topic) => topic.id === "accusative").steps.find(
      (step) => step.id === "fuer"
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

describe("case listen sentences", () => {
  const MUST_HEAR = {
    "case.acc.masc": [
      "Ich sehe den Ball.",
      "Ich sehe den Bus.",
      "Ich sehe den Hund.",
      "Ich sehe den Mann.",
      "Ich sehe den Schlüssel.",
      "Ich sehe den Stift.",
      "Ich sehe den Zug.",
      "Ich sehe einen Ball.",
      "Ich sehe einen Bus.",
      "Ich sehe einen Hund.",
      "Ich sehe einen Mann.",
      "Ich sehe einen Schlüssel.",
      "Ich sehe einen Stift.",
      "Ich sehe einen Zug.",
      "Ich habe den Ball.",
      "Ich habe den Hund.",
      "Ich habe den Schlüssel.",
      "Ich habe den Stift.",
      "Ich habe einen Ball.",
      "Ich habe einen Hund.",
      "Ich habe einen Schlüssel.",
      "Ich habe einen Stift.",
    ],
    "case.acc.unchanged": [
      "Ich sehe das Buch.",
      "Ich sehe die Frau.",
      "Ich sehe die Katze.",
      "Ich sehe das Kind.",
      "Ich sehe ein Buch.",
      "Ich sehe eine Frau.",
      "Ich sehe eine Katze.",
      "Ich sehe ein Kind.",
      "Ich habe das Buch.",
      "Ich habe die Katze.",
      "Ich habe ein Buch.",
      "Ich habe eine Katze.",
    ],
    "case.prep.fuer": [
      "Das Geschenk ist für den Mann.",
      "Das Geschenk ist für die Frau.",
      "Das Geschenk ist für das Kind.",
      "Das Geschenk ist für den Hund.",
      "Das Geschenk ist für die Katze.",
      "Das ist für einen Mann.",
      "Das ist für eine Frau.",
      "Das ist für ein Kind.",
    ],
    "case.prep.ohne": [
      "Ich gehe ohne den Schlüssel.",
      "Ich gehe ohne die Tasche.",
      "Ich gehe ohne das Ticket.",
      "Ich gehe ohne das Buch.",
      "Ich gehe ohne die Jacke.",
      "Ich gehe ohne das Hemd.",
      "Ich gehe ohne den Stift.",
      "Ich gehe ohne den Ball.",
      "Ich gehe ohne den Hund.",
      "Ich gehe ohne die Katze.",
      "Ich gehe ohne das Auto.",
      "Ich gehe ohne einen Schlüssel.",
    ],
    "case.acc.verbs": [
      "Ich brauche den Schlüssel.",
      "Ich brauche die Tasche.",
      "Ich brauche das Ticket.",
      "Ich brauche das Buch.",
      "Ich brauche das Auto.",
      "Ich suche einen Schlüssel.",
      "Ich nehme den Bus.",
      "Ich nehme den Zug.",
      "Ich nehme die Tasche.",
      "Ich nehme das Auto.",
      "Ich finde das Hotel.",
      "Ich finde den Schlüssel.",
      "Ich finde die Tasche.",
      "Ich finde das Buch.",
      "Ich finde den Bus.",
    ],
    "case.prep.warten-auf": [
      "Ich warte auf den Mann.",
      "Ich warte auf die Frau.",
      "Ich warte auf das Kind.",
      "Ich warte auf den Zug.",
      "Ich warte auf den Bus.",
      "Ich warte auf den Arzt.",
      "Ich warte auf den Lehrer.",
      "Ich warte auf einen Mann.",
      "Ich warte auf eine Frau.",
      "Ich warte auf ein Kind.",
      "Ich warte auf einen Zug.",
      "Ich warte auf einen Bus.",
      "Ich warte auf einen Arzt.",
      "Ich warte auf einen Lehrer.",
    ],
    "case.dat.helfen": [
      "Ich helfe dem Mann.",
      "Ich helfe der Frau.",
      "Ich helfe dem Kind.",
      "Ich helfe dem Arzt.",
      "Ich helfe dem Lehrer.",
      "Ich helfe dem Hund.",
      "Ich helfe der Katze.",
      "Ich helfe einem Mann.",
      "Ich helfe einer Frau.",
      "Ich helfe einem Kind.",
      "Ich helfe einem Arzt.",
      "Ich helfe einem Lehrer.",
      "Ich helfe einem Hund.",
      "Ich helfe einer Katze.",
    ],
    "case.prep.mit": [
      "Ich fahre mit dem Bus.",
      "Ich fahre mit dem Zug.",
      "Ich fahre mit dem Auto.",
      "Ich spiele mit dem Kind.",
      "Ich spiele mit dem Hund.",
      "Ich spiele mit der Katze.",
      "Ich spiele mit dem Ball.",
      "Ich fahre mit einem Bus.",
      "Ich fahre mit einem Zug.",
      "Ich fahre mit einem Auto.",
      "Ich spiele mit einem Kind.",
      "Ich spiele mit einem Hund.",
      "Ich spiele mit einer Katze.",
      "Ich spiele mit einem Ball.",
    ],
    "case.verb.danken": [
      "Ich danke dem Mann.",
      "Ich danke der Frau.",
      "Ich danke dem Kind.",
      "Ich danke dem Arzt.",
      "Ich danke dem Lehrer.",
      "Ich danke einem Mann.",
      "Ich danke einer Frau.",
      "Ich danke einem Kind.",
      "Ich danke einem Arzt.",
      "Ich danke einem Lehrer.",
    ],
    "case.verb.gefallen": [
      "Das Buch gefällt dem Mann.",
      "Das Buch gefällt der Frau.",
      "Das Buch gefällt dem Kind.",
    ],
    "case.prep.aus": [
      "Er kommt aus der Stadt.",
      "Er kommt aus dem Haus.",
      "Er kommt aus dem Hotel.",
      "Er kommt aus dem Büro.",
      "Er kommt aus dem Museum.",
      "Er kommt aus dem Kino.",
      "Er kommt aus dem Theater.",
      "Er kommt aus dem Restaurant.",
      "Er kommt aus dem Café.",
      "Er kommt aus dem Krankenhaus.",
      "Er kommt aus einer Stadt.",
      "Er kommt aus einem Haus.",
      "Er kommt aus einem Hotel.",
      "Er kommt aus einem Büro.",
      "Er kommt aus einem Museum.",
      "Er kommt aus einem Kino.",
      "Er kommt aus einem Theater.",
      "Er kommt aus einem Restaurant.",
      "Er kommt aus einem Café.",
      "Er kommt aus einem Krankenhaus.",
    ],
    "case.dat.indef": [
      "Ich helfe einem Kind.",
      "Ich helfe einer Frau.",
      "Ich helfe einem Mann.",
      "Ich helfe einem Arzt.",
      "Ich fahre mit einem Bus.",
      "Ich fahre mit einem Auto.",
      "Er kommt aus einer Stadt.",
      "Er kommt aus einem Haus.",
      "Er kommt aus einem Hotel.",
    ],
    "case.dat.plural": [
      "Ich helfe den Kindern.",
      "Ich helfe den Frauen.",
      "Ich helfe den Hunden.",
      "Ich spiele mit den Hunden.",
      "Ich spiele mit den Kindern.",
      "Ich spiele mit den Frauen.",
      "Ich fahre mit den Autos.",
      "Ich komme aus den Büros.",
    ],
    "case.prep.passen-zu": [
      "Die Jacke passt zu dem Hemd.",
      "Die Farbe passt zu der Tasche.",
      "Das passt zu einem Kleid.",
      "Die Farbe passt zu dem Hemd.",
      "Die Farbe passt zu der Jacke.",
      "Die Farbe passt zu dem Kleid.",
      "Das passt zu einem Hemd.",
      "Das passt zu einer Jacke.",
      "Das passt zu einer Tasche.",
    ],
    "case.mixed": [
      "Ich gebe dem Kind den Ball.",
      "Der Hund sieht den Mann.",
    ],
  };

  for (const [unitId, sentences] of Object.entries(MUST_HEAR)) {
    it(`${unitId} hears each curated sentence once`, () => {
      const play = buildCasePlayDeck(buildCaseUnitQuestions(unitId));
      const heard = play.filter((card) => card.quizType === "listen").map((card) => card.sentence);
      const unique = new Set(heard);
      assert.ok(unique.size >= 3, `${unitId} has ${unique.size} listen sentences`);
      assert.equal(unique.size, heard.length, `${unitId} repeats a listen sentence`);
      for (const sentence of sentences) {
        assert.ok(unique.has(sentence), `${unitId} missing ${sentence}`);
      }
      assert.ok(heard.every((sentence) => !sentence.includes("Wald")));
      assert.ok(
        play
          .filter((card) => card.quizType === "listen")
          .every((card) => card.target !== "noun")
      );
    });
  }
});
