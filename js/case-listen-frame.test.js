import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCaseUnitQuestions } from "../../engine/nouns/case-questions.js";
import { caseListenFrameHtml, caseListenFrameText } from "./answer-placeholders.js";

function guided(unitId, sentence, lemma) {
  return buildCaseUnitQuestions(unitId).find(
    (question) =>
      question.promptKind === "guided" &&
      question.sentence === sentence &&
      (!lemma || question.lemma === lemma)
  );
}

describe("case listen frame", () => {
  it("blanks the article and shows the noun", () => {
    const fuer = guided("case.prep.fuer", "Das Geschenk ist für die Frau.", "Frau");
    assert.equal(
      caseListenFrameText(fuer),
      "Das Geschenk ist für [ article ] Frau."
    );
    assert.equal(caseListenFrameText(fuer).includes("die Frau"), false);

    const zeigt = guided(
      "case.mixed",
      "Die Frau zeigt dem Mann das Buch.",
      "Mann"
    );
    assert.equal(
      caseListenFrameText(zeigt),
      "Die Frau zeigt [ article ] Mann das Buch."
    );
    assert.equal(caseListenFrameText(zeigt).includes("dem Mann"), false);

    const gibt = guided("case.mixed", "Ich gebe dem Kind den Ball.", "Ball");
    assert.equal(
      caseListenFrameText(gibt),
      "Ich gebe dem Kind [ article ] Ball."
    );
    assert.equal(caseListenFrameText(gibt).includes("den Ball"), false);

    const subject = guided("case.mixed", "Der Mann sieht den Hund.", "Mann");
    assert.equal(
      caseListenFrameText(subject),
      "[ article ] Mann sieht den Hund."
    );
    assert.equal(caseListenFrameText(subject).includes("Der Mann"), false);
  });

  it("marks the article as an English slot and leaves the noun in German", () => {
    const html = caseListenFrameHtml({
      before: "Das Geschenk ist für ",
      after: " Frau.",
      nounForm: "Frau",
    });
    assert.match(html, /class="case-listen-sentence"/);
    assert.match(html, /lang="de"/);
    assert.match(html, /class="slot" lang="en">article<\/span>/);
    assert.equal(html.includes(">noun<"), false);
    assert.match(html, /Das Geschenk ist für/);
    assert.match(html, /Frau\./);
    assert.equal(html.includes("die"), false);
  });
});
