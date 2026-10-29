import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { caseNavUnits } from "./case-curriculum.js";
import { unitMatchesPlayCaps } from "./nav-carousel.js";

describe("Play caps for Case", () => {
  it("counts a selected Case unit under the default pick caps", () => {
    const units = caseNavUnits().filter((unit) => unit.playable);
    assert.ok(units.length > 1);
    const caps = { keyboard: true, audio: true };
    assert.equal(units.filter((unit) => unitMatchesPlayCaps(unit, caps)).length, units.length);
    const writeOnly = { keyboard: "only", audio: true };
    const listenOnly = { keyboard: true, audio: "only" };
    assert.ok(units.every((unit) => unitMatchesPlayCaps(unit, writeOnly)));
    const heard = units.filter((unit) => unitMatchesPlayCaps(unit, listenOnly));
    assert.deepEqual(
      heard.map((unit) => unit.unitId).sort(),
      units.map((unit) => unit.unitId).filter((id) => id !== "case.analysis").sort()
    );
  });
});
