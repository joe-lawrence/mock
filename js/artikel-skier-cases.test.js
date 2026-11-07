import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { articleForm } from "../engine/nouns/noun.js";
import { getVocabulary, vocabularyForTopic } from "./generated/vocabulary.js";
import { caseSkiNounsFromVocab } from "./artikel-climber-vocab.js";
import {
  SNOW_NOMEN_COMPATIBILITY,
  SNOW_NOMEN_CONSTRUCTION_IDS,
  SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS,
  SNOW_NOMEN_NOUN_IDS,
  isCompatiblePair,
} from "./artikel-skier-case-content.js";
import {
  buildCaseTrial,
  caseGovernorsFromVocabItems,
  constructionsForNoun,
  correctCaseArticle,
  gateRowForCase,
  GENDER_LANES,
  loadCaseConstruction,
  loadSnowNomenConstructions,
  pickCaseExercise,
  pickGovernorForNoun,
  singleCaseFromGoverns,
} from "./artikel-skier-cases.js";

function nounById(id) {
  const item = getVocabulary(id);
  assert.ok(item, `missing vocab ${id}`);
  const genderMap = {
    masculine: "masc",
    feminine: "fem",
    neuter: "neut",
  };
  const gender = genderMap[item.derived?.gender];
  assert.ok(gender, `missing gender for ${id}`);
  return {
    word: item.surface,
    article: item.derived.article,
    gender,
    vocabId: id,
    plural: item.derived?.plural || null,
  };
}

describe("artikel-skier-cases curriculum alignment", () => {
  it("keeps fixed masc/fem/neut/plur lane order", () => {
    assert.deepEqual(GENDER_LANES, ["masc", "fem", "neut", "plur"]);
  });

  it("loads only allowlisted single-case Case constructions", () => {
    const constructions = loadSnowNomenConstructions();
    assert.equal(constructions.length, SNOW_NOMEN_CONSTRUCTION_IDS.length);
    for (const c of constructions) {
      assert.ok(SNOW_NOMEN_CONSTRUCTION_IDS.includes(c.id));
      assert.ok(!SNOW_NOMEN_EXCLUDED_CONSTRUCTION_IDS.includes(c.id));
      const item = getVocabulary(c.id);
      assert.equal(item.topic, "case");
      assert.equal(c.case, singleCaseFromGoverns(item.governs));
      assert.ok(c.case === "acc" || c.case === "dat");
    }
  });

  it("excludes mixed-case zeigen and geben", () => {
    assert.equal(loadCaseConstruction("vocab.case.zeigen"), null);
    assert.equal(loadCaseConstruction("vocab.case.geben"), null);
    const fromTopic = caseGovernorsFromVocabItems(vocabularyForTopic("case"));
    assert.ok(!fromTopic.some((c) => c.id === "vocab.case.zeigen"));
    assert.ok(!fromTopic.some((c) => c.id === "vocab.case.geben"));
    assert.equal(singleCaseFromGoverns(["accusative", "dative"]), null);
  });

  it("ski nouns are Case curriculum records on the compatibility whitelist", () => {
    const nouns = caseSkiNounsFromVocab();
    assert.ok(nouns.length > 0);
    for (const n of nouns) {
      assert.ok(SNOW_NOMEN_NOUN_IDS.includes(n.vocabId), n.vocabId);
      const item = getVocabulary(n.vocabId);
      assert.ok(item);
      assert.equal(item.type, "noun");
      assert.equal(item.topic, "case");
      assert.equal(item.surface, n.word);
      const long =
        n.gender === "masc"
          ? "masculine"
          : n.gender === "fem"
            ? "feminine"
            : "neuter";
      assert.equal(item.derived.gender, long);
      const onWhitelist = Object.values(SNOW_NOMEN_COMPATIBILITY).some((list) =>
        list.includes(n.vocabId)
      );
      assert.ok(onWhitelist, `${n.vocabId} missing from whitelist`);
    }
    // Stift/Stadt are curriculum nouns but not yet on any pairing — stay out of deck.
    assert.ok(!nouns.some((n) => n.vocabId === "vocab.case.stift"));
    assert.ok(!nouns.some((n) => n.vocabId === "vocab.case.stadt"));
  });

  it("every whitelist noun id resolves to a canonical Case noun", () => {
    for (const [cid, nounIds] of Object.entries(SNOW_NOMEN_COMPATIBILITY)) {
      assert.ok(SNOW_NOMEN_CONSTRUCTION_IDS.includes(cid));
      for (const nid of nounIds) {
        const item = getVocabulary(nid);
        assert.ok(item, nid);
        assert.equal(item.type, "noun");
        assert.equal(item.topic, "case");
        assert.ok(SNOW_NOMEN_NOUN_IDS.includes(nid));
        assert.ok(isCompatiblePair(cid, nid));
      }
    }
  });

  it("case comes from the construction, not the noun governs metadata", () => {
    const haus = nounById("vocab.case.haus");
    // Haus intro metadata is dative, but haben governs accusative.
    assert.equal(
      singleCaseFromGoverns(getVocabulary("vocab.case.haus").governs),
      "dat"
    );
    const haben = loadCaseConstruction("vocab.case.haben");
    assert.equal(haben.case, "acc");
    const trial = buildCaseTrial([], haus, {
      construction: haben,
      indefChance: 0,
      pluralChance: 0,
    });
    assert.equal(trial.case, "acc");
    assert.equal(trial.constructionId, "vocab.case.haben");
    assert.equal(trial.correctArticle, "das");
    assert.equal(trial.gender, "neut");
  });

  it("gender comes from the noun lexicon record", () => {
    for (const id of [
      "vocab.case.mann",
      "vocab.case.frau",
      "vocab.case.kind",
      "vocab.case.auto",
    ]) {
      const n = nounById(id);
      const item = getVocabulary(id);
      const expected =
        item.derived.gender === "masculine"
          ? "masc"
          : item.derived.gender === "feminine"
            ? "fem"
            : "neut";
      assert.equal(n.gender, expected);
    }
  });

  it("definite and indefinite articles match the engine for all genders × cases", () => {
    for (const caseId of /** @type {const} */ (["acc", "dat"])) {
      for (const parity of /** @type {const} */ (["def", "indef"])) {
        const row = gateRowForCase(caseId, parity);
        for (const gender of /** @type {const} */ (["masc", "fem", "neut"])) {
          const got = correctCaseArticle(caseId, gender, "sg", parity);
          const long =
            gender === "masc"
              ? "masculine"
              : gender === "fem"
                ? "feminine"
                : "neuter";
          const want = articleForm(long, {
            kind: parity === "indef" ? "indefinite" : "definite",
            number: "singular",
            case: caseId === "dat" ? "dative" : "accusative",
          });
          assert.equal(got, want, `${parity} ${caseId} ${gender}`);
          const idx = GENDER_LANES.indexOf(gender);
          assert.equal(row[idx], want);
        }
      }
    }
  });

  it("generated trials stay inside curriculum + compatibility", () => {
    const constructions = loadSnowNomenConstructions();
    const nouns = caseSkiNounsFromVocab();
    for (let i = 0; i < 80; i++) {
      const noun = nouns[i % nouns.length];
      const trial = buildCaseTrial(constructions, noun, {
        indefChance: 0.5,
        pluralChance: 0,
      });
      assert.ok(SNOW_NOMEN_CONSTRUCTION_IDS.includes(trial.constructionId));
      assert.ok(
        isCompatiblePair(trial.constructionId, noun.vocabId),
        `${trial.constructionId} + ${noun.vocabId}`
      );
      assert.equal(trial.lemma, noun.word);
      assert.equal(trial.gender, noun.gender);
      const c = constructions.find((x) => x.id === trial.constructionId);
      assert.equal(trial.case, c.case);
    }
  });

  it("gefallen only targets experiencers Mann/Frau/Kind", () => {
    const gefallen = loadCaseConstruction("vocab.case.gefallen");
    assert.ok(gefallen);
    assert.deepEqual(
      [...SNOW_NOMEN_COMPATIBILITY["vocab.case.gefallen"]],
      ["vocab.case.mann", "vocab.case.frau", "vocab.case.kind"]
    );
    for (const bad of [
      "vocab.case.kleid",
      "vocab.case.buch",
      "vocab.case.auto",
      "vocab.case.hund",
    ]) {
      assert.equal(isCompatiblePair("vocab.case.gefallen", bad), false);
      assert.deepEqual(
        constructionsForNoun([gefallen], nounById(bad)).map((c) => c.id),
        []
      );
    }
    for (const ok of [
      "vocab.case.mann",
      "vocab.case.frau",
      "vocab.case.kind",
    ]) {
      const trial = buildCaseTrial([], nounById(ok), {
        construction: gefallen,
        indefChance: 0,
        pluralChance: 0,
      });
      assert.equal(trial.trigger, "gefallen");
      assert.equal(trial.case, "dat");
      assert.ok(["Mann", "Frau", "Kind"].includes(trial.noun));
    }
  });

  it("pickCaseExercise is construction-first and whitelist-bound", () => {
    for (let i = 0; i < 40; i++) {
      const ex = pickCaseExercise({ nounById });
      assert.ok(ex);
      assert.ok(SNOW_NOMEN_CONSTRUCTION_IDS.includes(ex.construction.id));
      assert.ok(isCompatiblePair(ex.construction.id, ex.nounId));
      assert.equal(ex.case, ex.construction.case);
      assert.ok(ex.noun);
      assert.equal(ex.noun.vocabId, ex.nounId);
    }
    const forced = pickCaseExercise({
      preferredNounId: "vocab.case.auto",
      nounById,
    });
    assert.ok(forced);
    assert.equal(forced.nounId, "vocab.case.auto");
    assert.ok(isCompatiblePair(forced.construction.id, "vocab.case.auto"));
  });

  it("only uses plural when a plural surface exists", () => {
    const mann = nounById("vocab.case.mann");
    const sehen = loadCaseConstruction("vocab.case.sehen");
    for (let i = 0; i < 30; i++) {
      const noPl = buildCaseTrial([], mann, {
        construction: sehen,
        pluralChance: 1,
        indefChance: 0,
      });
      assert.equal(noPl.number, "sg");
      assert.equal(noPl.noun, "Mann");
      assert.equal(noPl.correctArticle, "den");
    }
    const frau = {
      ...nounById("vocab.case.frau"),
      plural: "Frauen",
    };
    for (let i = 0; i < 30; i++) {
      const withPl = buildCaseTrial([], frau, {
        construction: sehen,
        pluralChance: 1,
        indefChance: 0,
      });
      assert.equal(withPl.number, "pl");
      assert.equal(withPl.noun, "Frauen");
      assert.equal(withPl.correctArticle, "die");
      assert.equal(withPl.tint, "plur");
    }
  });

  it("pickGovernorForNoun stays on the whitelist for a noun", () => {
    const constructions = loadSnowNomenConstructions();
    const auto = nounById("vocab.case.auto");
    for (let i = 0; i < 40; i++) {
      const gov = pickGovernorForNoun(constructions, auto);
      assert.ok(isCompatiblePair(gov.id, auto.vocabId));
      assert.notEqual(gov.surface, "gefallen");
      assert.notEqual(gov.surface, "helfen");
      assert.notEqual(gov.surface, "danken");
    }
  });

  it("does not introduce vocabulary outside the Case curriculum", () => {
    const constructions = loadSnowNomenConstructions();
    for (const c of constructions) {
      assert.equal(getVocabulary(c.id).topic, "case");
      assert.equal(getVocabulary(c.id).source, "content/vocabulary/case.md");
    }
    for (const n of caseSkiNounsFromVocab()) {
      assert.equal(getVocabulary(n.vocabId).source, "content/vocabulary/case.md");
    }
    assert.ok(
      !constructions.some((c) =>
        ["durch", "bei", "zeigen", "geben"].includes(c.surface)
      )
    );
  });
});
