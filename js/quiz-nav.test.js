import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  emptyQuizNav,
  noteQuizNavEntry,
  quizNavAtTip,
  quizNavBackDisabled,
  stepQuizNavBack,
  stepQuizNavForward,
} from "./quiz-nav.js";

describe("quiz nav trail", () => {
  it("starts with Back disabled and Forward ready to deal", () => {
    const nav = emptyQuizNav();
    assert.equal(quizNavBackDisabled(nav), true);
    assert.equal(quizNavAtTip(nav), true);
    assert.equal(stepQuizNavForward(nav).kind, "tip");
  });

  it("walks back to the previous unit and forward along the same trail", () => {
    let nav = noteQuizNavEntry(emptyQuizNav(), {
      view: "numbers",
      key: "n1",
    });
    nav = noteQuizNavEntry(nav, { view: "case", key: "c1" });
    assert.equal(quizNavBackDisabled(nav), false);
    const back = stepQuizNavBack(nav);
    assert.equal(back.entry.view, "numbers");
    assert.equal(quizNavAtTip(back.nav), false);
    const forward = stepQuizNavForward(back.nav);
    assert.equal(forward.kind, "history");
    assert.equal(forward.entry.view, "case");
    assert.equal(stepQuizNavForward(forward.nav).kind, "tip");
  });

  it("does not grow the trail while a past question is on screen", () => {
    let nav = noteQuizNavEntry(emptyQuizNav(), { view: "nouns", key: "a" });
    nav = noteQuizNavEntry(nav, { view: "sounds", key: "b" });
    nav = stepQuizNavBack(nav).nav;
    const stayed = noteQuizNavEntry(nav, { view: "numbers", key: "new" });
    assert.equal(stayed.trail.length, 2);
    assert.equal(stayed.index, 0);
  });

  it("refreshes the tip when the same question renders again", () => {
    let nav = noteQuizNavEntry(emptyQuizNav(), {
      view: "case",
      key: "row",
      mark: 1,
    });
    nav = noteQuizNavEntry(nav, { view: "case", key: "row", mark: 2 });
    assert.equal(nav.trail.length, 1);
    assert.equal(nav.trail[0].mark, 2);
  });

  it("does not move before the first question", () => {
    const nav = noteQuizNavEntry(emptyQuizNav(), { view: "sounds", key: "0" });
    assert.equal(stepQuizNavBack(nav).entry, null);
    assert.equal(quizNavBackDisabled(nav), true);
  });
});
