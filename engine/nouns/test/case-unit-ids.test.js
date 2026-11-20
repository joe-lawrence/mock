import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CASE_ARC_UNIT_IDS,
  caseAccusativeUnlocked,
  caseDativeUnlocked,
  migrateCaseUnitIds,
  resolveCaseUnitId,
} from "../case-unit-ids.js";

describe("case unit id map", () => {
  it("resolves old fine-grained ids onto the 8-unit arc", () => {
    assert.equal(resolveCaseUnitId("case.acc.masc"), "case.chart");
    assert.equal(resolveCaseUnitId("case.prep.fuer"), "case.prep.acc");
    assert.equal(resolveCaseUnitId("case.dat.helfen"), "case.verbs.dat");
    assert.equal(resolveCaseUnitId("case.prep.warten-auf"), "case.prep.warten-auf");
    assert.deepEqual(
      migrateCaseUnitIds(["case.acc.masc", "case.prep.ohne", "case.dat.helfen", "case.mixed"]),
      ["case.chart", "case.prep.acc", "case.verbs.dat", "case.mixed"]
    );
    assert.deepEqual(CASE_ARC_UNIT_IDS.length, 8);
  });

  it("unlocks accusative after chart/Topic 2 and dative after Topic 3", () => {
    assert.equal(caseAccusativeUnlocked([]), false);
    assert.equal(caseAccusativeUnlocked(["case.chart"]), true);
    assert.equal(caseAccusativeUnlocked(["case.prep.acc"]), true);
    assert.equal(caseDativeUnlocked(["case.chart", "case.prep.acc"]), false);
    assert.equal(caseDativeUnlocked(["case.verbs.dat"]), true);
    assert.equal(caseDativeUnlocked(["case.acc.masc", "case.dat.helfen"]), true);
  });
});
