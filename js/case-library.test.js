import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getVocabulary } from "./generated/vocabulary.js";
import {
  constructionIdsForNoun,
  declinedArticle,
  isCaseGovernor,
  nounHasCaseFrames,
  pickCaseFrameForNoun,
  singleCaseFromGoverns,
} from "./case-library.js";

describe("case-library", () => {
  it("treats only constructions as case governors", () => {
    assert.equal(isCaseGovernor(getVocabulary("vocab.case.fuer")), true);
    assert.equal(isCaseGovernor(getVocabulary("vocab.case.helfen")), true);
    assert.equal(isCaseGovernor(getVocabulary("vocab.case.mann")), false);
    assert.equal(isCaseGovernor(getVocabulary("vocab.case.geben")), true);
  });

  it("reads case from construction governs, not noun intro metadata", () => {
    assert.equal(singleCaseFromGoverns(["accusative"]), "acc");
    assert.equal(singleCaseFromGoverns(["dative"]), "dat");
    assert.equal(singleCaseFromGoverns(["accusative", "dative"]), null);
    const haus = getVocabulary("vocab.case.haus");
    assert.equal(singleCaseFromGoverns(haus.governs), "dat");
    assert.ok(constructionIdsForNoun("vocab.case.haus").includes("vocab.case.haben"));
    const frame = pickCaseFrameForNoun(haus, {
      preferredConstructionId: "vocab.case.haben",
      parity: "def",
    });
    assert.ok(frame);
    assert.equal(frame.case, "acc");
    assert.equal(frame.article, "das");
    assert.equal(frame.noun, "Haus");
  });

  it("keeps gefallen on experiencers only", () => {
    assert.ok(nounHasCaseFrames(getVocabulary("vocab.case.mann")));
    const frame = pickCaseFrameForNoun(getVocabulary("vocab.case.mann"), {
      preferredConstructionId: "vocab.case.gefallen",
      parity: "def",
    });
    assert.equal(frame.trigger, "gefallen");
    assert.equal(frame.case, "dat");
    assert.equal(frame.article, "dem");
    assert.equal(
      constructionIdsForNoun("vocab.case.kleid").includes("vocab.case.gefallen"),
      false
    );
  });

  it("declines articles from the noun engine", () => {
    assert.equal(
      declinedArticle({ caseId: "acc", gender: "masc", parity: "def" }),
      "den"
    );
    assert.equal(
      declinedArticle({ caseId: "dat", gender: "fem", parity: "def" }),
      "der"
    );
    assert.equal(
      declinedArticle({ caseId: "acc", gender: "neut", parity: "indef" }),
      "ein"
    );
  });
});
