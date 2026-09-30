import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createVocabularyQuestion,
  evaluateVocabularyAnswer,
  factsForItem,
  pickQuestionType,
  questionTypesForItem,
} from "./vocabulary-practice.js";

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
