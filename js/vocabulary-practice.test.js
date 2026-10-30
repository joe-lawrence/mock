import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resetPhraseRotation, rotatePhrase } from "./phrase-rotation.js";
import {
  caseExamplePhrases,
  createVocabularyQuestion,
  evaluateVocabularyAnswer,
  factsForItem,
  nextCaseExample,
  pickQuestionType,
  questionTypesForItem,
  resetCaseExampleCursor,
} from "./vocabulary-practice.js";
import { vocabularyForScope } from "./generated/vocabulary.js";
import { flaggedCueHtml } from "./lang-flags.js";

const engineNoun = {
  id: "vocab.nouns.zeitung",
  heading: "die Zeitung",
  surface: "Zeitung",
  type: "noun",
  topic: "nouns",
  gloss: "newspaper",
  sense: "",
  introduced_by: ["nouns.suffixes"],
  reference: ["nouns.suffix.feminine"],
  engine: { lemma: "Zeitung" },
  engineJoin: "engine-backed",
  derived: {
    gender: "feminine",
    article: "die",
    gloss: "newspaper",
    plural: "Zeitungen",
  },
};

const wohnung = {
  id: "vocab.nouns.wohnung",
  heading: "die Wohnung",
  surface: "Wohnung",
  type: "noun",
  topic: "nouns",
  gloss: "apartment",
  sense: "",
  introduced_by: ["nouns.suffixes"],
  reference: ["nouns.suffix.feminine"],
  engine: { lemma: "Wohnung" },
  engineJoin: "engine-backed",
  derived: {
    gender: "feminine",
    article: "die",
    gloss: "apartment",
    plural: "Wohnungen",
  },
};

const lehrer = {
  id: "vocab.nouns.lehrer",
  heading: "der Lehrer",
  surface: "Lehrer",
  type: "noun",
  topic: "nouns",
  gloss: "teacher",
  sense: "",
  introduced_by: ["nouns.suffixes"],
  reference: ["nouns.suffix.masculine"],
  engine: { lemma: "Lehrer" },
  engineJoin: "engine-backed",
  derived: {
    gender: "masculine",
    article: "der",
    gloss: "teacher",
    plural: "Lehrer",
  },
};

const zahl = {
  id: "vocab.numbers.zahl",
  heading: "die Zahl",
  surface: "Zahl",
  type: "noun",
  topic: "numbers",
  gloss: "number",
  sense: "count / quantity (how many)",
  introduced_by: ["numbers.cardinals"],
  reference: ["numbers.overview"],
  engine: null,
  engineJoin: "content-only",
  derived: null,
};

const nummer = {
  id: "vocab.numbers.nummer",
  heading: "die Nummer",
  surface: "Nummer",
  type: "noun",
  topic: "numbers",
  gloss: "number",
  sense: "phone number / labeled numeral",
  introduced_by: ["numbers.cardinals"],
  reference: ["numbers.overview"],
  engine: null,
  engineJoin: "content-only",
  derived: null,
};

const stunde = {
  id: "vocab.numbers.stunde",
  heading: "die Stunde",
  surface: "Stunde",
  type: "noun",
  topic: "numbers",
  gloss: "hour",
  sense: "",
  introduced_by: ["numbers.time"],
  reference: ["numbers.time"],
  engine: null,
  engineJoin: "content-only",
  derived: null,
};

describe("vocabulary practice question types", () => {
  it("exposes engine facts without forcing all into quizzes", () => {
    const facts = factsForItem(engineNoun);
    assert.equal(facts.article, "die");
    assert.equal(facts.plural, "Zeitungen");
  });

  it("derives article from heading for content-only nouns", () => {
    const facts = factsForItem(zahl);
    assert.equal(facts.article, "die");
    assert.equal(facts.gender, "feminine");
  });

  it("offers article/gender plus MC meaning/form", () => {
    const peers = [engineNoun, wohnung, lehrer];
    const types = questionTypesForItem(engineNoun, { topic: "nouns", peers });
    assert.ok(types.includes("article"));
    assert.ok(types.includes("gender"));
    assert.ok(types.includes("meaning"));
    assert.ok(types.includes("form"));
    assert.ok(!types.includes("de_to_en"));
    assert.ok(!types.includes("plural"));
  });

  it("allows gender drills on numbers content-only items", () => {
    const peers = [zahl, nummer, stunde];
    const types = questionTypesForItem(zahl, { topic: "numbers", peers });
    assert.ok(types.includes("article"));
    assert.ok(types.includes("gender"));
    assert.ok(types.includes("meaning"));
    assert.ok(types.includes("form"));
  });

  it("evaluates article choice", () => {
    const q = createVocabularyQuestion(engineNoun, "article", { topic: "nouns" });
    assert.equal(q.choiceKind, "articles");
    assert.equal(evaluateVocabularyAnswer(q, "die").status, "correct");
    assert.equal(evaluateVocabularyAnswer(q, "der").status, "incorrect");
  });

  it("builds meaning MC with peer distractors", () => {
    const peers = [zahl, nummer, stunde];
    const q = createVocabularyQuestion(zahl, "meaning", {
      topic: "numbers",
      peers,
    });
    assert.equal(q.input, "choice");
    assert.equal(q.choiceKind, "grid");
    assert.ok(q.choices.length >= 2);
    assert.equal(evaluateVocabularyAnswer(q, zahl.id).status, "correct");
    assert.equal(evaluateVocabularyAnswer(q, stunde.id).status, "incorrect");
    // Ambiguous glosses stay distinct via sense.
    const labels = q.choices.map((c) => c.label);
    assert.ok(labels.some((l) => /count|quantity/i.test(l)));
  });

  it("builds form MC with article+lemma labels", () => {
    const peers = [zahl, nummer, stunde];
    const q = createVocabularyQuestion(zahl, "form", {
      topic: "numbers",
      peers,
    });
    assert.match(q.prompt, /number/i);
    assert.ok(q.choices.some((c) => c.label === "die Zahl"));
    assert.equal(evaluateVocabularyAnswer(q, zahl.id).status, "correct");
  });

  it("weights picks toward morphology", () => {
    const peers = [engineNoun, wohnung, lehrer];
    const counts = { article: 0, gender: 0, meaning: 0, form: 0 };
    for (let i = 0; i < 200; i++) {
      const t = pickQuestionType(engineNoun, { topic: "nouns", peers });
      counts[t] += 1;
    }
    assert.ok(counts.article + counts.gender > counts.meaning + counts.form);
  });
});

describe("Vocabulary direction flags", () => {
  it("puts the German flag before a German prompt and the British flag before an English prompt", () => {
    const de = flaggedCueHtml("de", "die Hälfte");
    const en = flaggedCueHtml("en", "half");
    assert.match(de, /^<strong class="prompt-lang prompt-de"/);
    assert.ok(de.indexOf('fill="#000"') < de.indexOf("die Hälfte"));
    assert.match(en, /^<span class="prompt-lang prompt-en"/);
    assert.ok(en.indexOf('fill="#0052B4"') < en.indexOf("half"));
  });
});

describe("Case answer-key examples", () => {
  it("rotates lesson phrases across gender and definite or indefinite", () => {
    const finden = caseExamplePhrases("finden");
    assert.deepEqual(finden, [
      "Ich finde das Hotel.",
      "Ich finde den Schlüssel.",
      "Ich finde die Tasche.",
      "Ich finde ein Hotel.",
      "Ich finde einen Schlüssel.",
      "Ich finde eine Tasche.",
    ]);
    const fuer = caseExamplePhrases("für");
    assert.deepEqual(fuer.slice(0, 3), [
      "Das Geschenk ist für den Mann.",
      "Das Geschenk ist für die Frau.",
      "Das Geschenk ist für das Kind.",
    ]);
    assert.ok(fuer.includes("Das ist für einen Mann."));
    assert.ok(fuer.includes("Das ist für eine Frau."));
    assert.ok(fuer.includes("Das ist für ein Kind."));
    const aus = caseExamplePhrases("aus");
    assert.ok(aus.includes("Er kommt aus der Stadt."));
    assert.ok(aus.includes("Er kommt aus dem Haus."));
    assert.ok(aus.includes("Er kommt aus einer Stadt."));
    assert.equal(aus.some((sentence) => sentence.includes("Hund")), false);
    const geben = caseExamplePhrases("geben");
    assert.ok(geben.includes("Ich gebe dem Kind den Ball."));
    assert.ok(geben.includes("Ich gebe einem Kind den Ball."));
    assert.ok(geben.includes("Ich gebe dem Kind einen Ball."));
    resetCaseExampleCursor();
    assert.equal(nextCaseExample("für"), fuer[0]);
    assert.equal(nextCaseExample("für"), fuer[1]);
    assert.notEqual(fuer[0], fuer[1]);
    resetPhraseRotation();
    assert.equal(rotatePhrase("other-key", ["one", "two"]), "one");
    assert.equal(rotatePhrase("case:für", ["skip"]), "skip");
    assert.equal(rotatePhrase("other-key", ["one", "two"]), "two");
  });
});

describe("Case vocabulary words", () => {
  it("quizzes the selected case words", () => {
    assert.deepEqual(
      vocabularyForScope("case", { introducedBy: ["case.declension"] }),
      []
    );
    const accusative = vocabularyForScope("case", {
      introducedBy: ["case.accusative"],
    });
    assert.ok(accusative.some((item) => item.surface === "für"));
    assert.ok(accusative.every((item) => item.type !== "noun"));
    const fuer = accusative.find((item) => item.surface === "für");
    const types = questionTypesForItem(fuer, {
      topic: "case",
      peers: accusative,
    });
    assert.ok(types.includes("meaning"), fuer.id);
    const question = createVocabularyQuestion(fuer, "meaning", {
      topic: "case",
      peers: accusative,
    });
    assert.equal(evaluateVocabularyAnswer(question, fuer.id).status, "correct");
    assert.ok(types.includes("case"));
    const orders = new Set();
    for (let i = 0; i < 24; i++) {
      const caseQuestion = createVocabularyQuestion(fuer, "case", {
        topic: "case",
        peers: accusative,
      });
      assert.equal(caseQuestion.prompt, "für takes the");
      assert.equal(caseQuestion.instruction, "Choose the case");
      assert.equal(caseQuestion.slotLabel, "Case");
      assert.deepEqual(
        caseQuestion.choices.map((choice) => choice.id).sort(),
        ["accusative", "dative", "nominative"]
      );
      orders.add(caseQuestion.choices.map((choice) => choice.id).join(","));
      assert.ok(caseExamplePhrases("für").includes(caseQuestion.revealDe));
      assert.equal(
        evaluateVocabularyAnswer(caseQuestion, "accusative").status,
        "correct"
      );
      assert.equal(
        evaluateVocabularyAnswer(caseQuestion, "dative").status,
        "incorrect"
      );
      assert.equal(
        evaluateVocabularyAnswer(caseQuestion, "nominative").status,
        "incorrect"
      );
    }
    assert.ok(orders.size > 1);
    const geben = vocabularyForScope("case", {
      introducedBy: ["case.mixed"],
    }).find((item) => item.surface === "geben");
    const mixed = createVocabularyQuestion(geben, "case", {
      topic: "case",
      peers: [geben],
    });
    assert.equal(mixed.revealEn, "geben takes the accusative and the dative.");
    assert.ok(caseExamplePhrases("geben").includes(mixed.revealDe));
    assert.equal(evaluateVocabularyAnswer(mixed, "accusative").status, "correct");
    assert.equal(evaluateVocabularyAnswer(mixed, "dative").status, "correct");
    assert.equal(evaluateVocabularyAnswer(mixed, "nominative").status, "incorrect");
  });
});
