/**
 * Dealer v1 — pure scheduling over candidates + multi-grain evidence (spec §15).
 *
 * Inputs are data-only (curriculum shape owned by the UI). Output is pick +
 * reason code + audit trace. Legacy `{ candidates, seen, stats }` still works
 * as a fallback when evidence / seeds are omitted.
 */

/**
 * @typedef {object} DealCandidate
 * @property {string} key
 * @property {string} territory
 * @property {string} [topicId]
 * @property {string} [stepId]
 * @property {string} [learnUnitId]
 * @property {string} [mode]
 * @property {string} [modeId]
 * @property {string} [family]
 * @property {string[]} [presets] — allowlisted preset ids for this unit
 */

/**
 * @typedef {object} ReasonCode
 * @property {string} code
 * @property {string} label
 * @property {string} hint
 */

/**
 * @typedef {object} DealAudit
 * @property {string} tier
 * @property {Record<string, unknown>} features
 * @property {number} candidateCount
 */

/** @type {Record<string, ReasonCode>} */
export const DEALER_REASONS = {
  review: {
    code: "review",
    label: "Review",
    hint: "You missed this recently — let’s lock it in.",
  },
  new: {
    code: "new",
    label: "New",
    hint: "Fresh material for this session.",
  },
  continue: {
    code: "continue",
    label: "Continue",
    hint: "Keep the streak going.",
  },
  probe_mastery: {
    code: "probe_mastery",
    label: "Probe",
    hint: "Checking independence with less support on material you already know.",
  },
  edge_of_competence: {
    code: "edge_of_competence",
    label: "Edge",
    hint: "Working where you still need support — stretch without overwhelm.",
  },
  scaffold_adjust: {
    code: "scaffold_adjust",
    label: "Scaffold",
    hint: "Recent hint depth was high — easing the next item.",
  },
  felt_too_hard: {
    code: "felt_too_hard",
    label: "Ease up",
    hint: "You marked the last item too hard — trying an easier angle.",
  },
  felt_too_easy: {
    code: "felt_too_easy",
    label: "Stretch",
    hint: "You marked the last item too easy — probing a harder angle.",
  },
};

/** Mastery threshold — accuracy below this on a seen key is due for review/edge. */
export const WEAK_ACCURACY = 0.67;

/** Hint depth at/above this steers toward easier presets (scaffold_adjust). */
export const HIGH_HINT_DEPTH = 2;

/** Contrast pairs — when one side is weak, prefer it (confusion maintenance). */
export const CONTRAST_PAIRS = Object.freeze([
  ["numbers:decimals:komma-read", "numbers:decimals:money-euros"],
  ["numbers:decimals:komma-read", "numbers:decimals:money-cents"],
]);

function accuracy(stat) {
  if (!stat || !stat.total) return null;
  return stat.correct / stat.total;
}

function clonePick(c, mode) {
  if (!mode || mode === c.mode || mode === c.modeId) return { ...c };
  return {
    ...c,
    mode,
    modeId: mode,
  };
}

function presetsFor(c) {
  if (Array.isArray(c.presets) && c.presets.length) return c.presets;
  const m = c.mode || c.modeId;
  return m ? [m] : [];
}

function unitPresetKey(dealKey, presetId) {
  return `${dealKey}×${presetId}`;
}

function grainStat(evidence, key) {
  return evidence?.grains?.[key] || null;
}

function unitStatsFromInput(input, candidates) {
  if (input.stats && Object.keys(input.stats).length) return input.stats;
  /** @type {Record<string, { correct: number, total: number }>} */
  const stats = {};
  const grains = input.evidence?.grains || {};
  for (const c of candidates) {
    const g = grains[c.key];
    if (g?.total) stats[c.key] = { correct: g.correct, total: g.total };
  }
  for (const [key, g] of Object.entries(grains)) {
    if (g.kind && g.kind !== "unit") continue;
    if (!g.total) continue;
    if (!stats[key] && !key.includes("×") && !key.startsWith("concept:")) {
      stats[key] = { correct: g.correct, total: g.total };
    }
  }
  return stats;
}

function seedOf(presetId, presetSeeds) {
  const n = presetSeeds?.[presetId];
  return typeof n === "number" ? n : 0.5;
}

/** Easiest allowlisted preset by seed difficulty. */
function easiestPreset(c, presetSeeds) {
  const list = presetsFor(c);
  if (!list.length) return null;
  let best = list[0];
  let bestSeed = seedOf(best, presetSeeds);
  for (const p of list) {
    const s = seedOf(p, presetSeeds);
    if (s < bestSeed) {
      best = p;
      bestSeed = s;
    }
  }
  return best;
}

/** Hardest allowlisted preset by seed difficulty. */
function hardestPreset(c, presetSeeds) {
  const list = presetsFor(c);
  if (!list.length) return null;
  let best = list[0];
  let bestSeed = seedOf(best, presetSeeds);
  for (const p of list) {
    const s = seedOf(p, presetSeeds);
    if (s > bestSeed) {
      best = p;
      bestSeed = s;
    }
  }
  return best;
}

function applyOverlays(list, overlays = {}) {
  let out = list.slice();
  const exclude = new Set(overlays.excludeKeys || []);
  if (exclude.size) out = out.filter((c) => !exclude.has(c.key));
  const pins = overlays.pinKeys || [];
  if (pins.length) {
    const pinSet = new Set(pins);
    const pinned = out.filter((c) => pinSet.has(c.key));
    if (pinned.length) out = pinned;
  }
  return out;
}

function orderBySoftArc(list, softArc) {
  if (!Array.isArray(softArc) || !softArc.length) return list;
  const rank = new Map(softArc.map((k, i) => [k, i]));
  return list
    .slice()
    .sort((a, b) => (rank.get(a.key) ?? 1e9) - (rank.get(b.key) ?? 1e9));
}

function weakestSeen(list, seenSet, stats, skipKey = null) {
  let weakest = null;
  for (const c of list) {
    if (skipKey && c.key === skipKey) continue;
    if (!seenSet.has(c.key)) continue;
    const acc = accuracy(stats[c.key]);
    if (acc == null || acc >= WEAK_ACCURACY) continue;
    if (!weakest || acc < weakest.acc) weakest = { c, acc };
  }
  return weakest;
}

/**
 * Freeform/hard preset weak while easier preset OK → edge on hard preset.
 */
function findEdgePresetContrast(list, seenSet, evidence, presetSeeds, skipKey = null) {
  let best = null;
  for (const c of list) {
    if (skipKey && c.key === skipKey) continue;
    if (!seenSet.has(c.key)) continue;
    const easy = easiestPreset(c, presetSeeds);
    const hard = hardestPreset(c, presetSeeds);
    if (!easy || !hard || easy === hard) continue;
    const easyG = grainStat(evidence, unitPresetKey(c.key, easy));
    const hardG = grainStat(evidence, unitPresetKey(c.key, hard));
    if (!easyG?.total || !hardG?.total) continue;
    const easyAcc = accuracy(easyG);
    const hardAcc = accuracy(hardG);
    if (easyAcc == null || hardAcc == null) continue;
    if (easyAcc >= WEAK_ACCURACY && hardAcc < WEAK_ACCURACY) {
      const gap = easyAcc - hardAcc;
      if (!best || gap > best.gap) {
        best = { c, preset: hard, easy, hardAcc, easyAcc, gap };
      }
    }
  }
  return best;
}

/**
 * Weakest allowlisted preset grain for a unit (needs attempts).
 * @returns {{ preset: string, acc: number, total: number } | null}
 */
function weakestPresetForUnit(c, evidence) {
  let best = null;
  for (const p of presetsFor(c)) {
    const g = grainStat(evidence, unitPresetKey(c.key, p));
    if (!g?.total) continue;
    const acc = accuracy(g);
    if (acc == null) continue;
    if (!best || acc < best.acc) best = { preset: p, acc, total: g.total };
  }
  return best;
}

/**
 * Any weak unit×preset → re-deal that preset (don't jump to hardest).
 */
function findWeakPreset(list, seenSet, evidence, skipKey = null) {
  let best = null;
  for (const c of list) {
    if (skipKey && c.key === skipKey) continue;
    if (!seenSet.has(c.key)) continue;
    const w = weakestPresetForUnit(c, evidence);
    if (!w || w.acc >= WEAK_ACCURACY) continue;
    if (!best || w.acc < best.acc) best = { c, preset: w.preset, acc: w.acc };
  }
  return best;
}

/**
 * Unit OK overall; hardest preset untested or thin → probe that preset.
 */
function findProbe(list, seenSet, stats, evidence, presetSeeds, skipKey = null) {
  let best = null;
  for (const c of list) {
    if (skipKey && c.key === skipKey) continue;
    if (!seenSet.has(c.key)) continue;
    const unitAcc = accuracy(stats[c.key]);
    if (unitAcc == null || unitAcc < WEAK_ACCURACY) continue;
    const hard = hardestPreset(c, presetSeeds);
    const easy = easiestPreset(c, presetSeeds);
    if (!hard || hard === easy) continue;
    const hardG = grainStat(evidence, unitPresetKey(c.key, hard));
    const hardTotal = hardG?.total || 0;
    const hardAcc = accuracy(hardG);
    // Probe when hard preset lacks evidence, or is strong enough to confirm independence.
    const untested = hardTotal === 0;
    const confirm =
      hardTotal >= 1 && hardAcc != null && hardAcc >= WEAK_ACCURACY;
    if (!untested && !confirm) continue;
    // Prefer untested hard presets first.
    const score = untested ? 2 : 1;
    if (!best || score > best.score) {
      best = { c, preset: hard, untested, unitAcc, score };
    }
  }
  return best;
}

/**
 * Related confusion pair — prefer the weaker side when both seen.
 */
function findContrast(list, seenSet, stats, skipKey = null) {
  const byKey = new Map(list.map((c) => [c.key, c]));
  let best = null;
  for (const [aKey, bKey] of CONTRAST_PAIRS) {
    if (skipKey && (aKey === skipKey || bKey === skipKey)) continue;
    if (!seenSet.has(aKey) || !seenSet.has(bKey)) continue;
    const a = byKey.get(aKey);
    const b = byKey.get(bKey);
    if (!a || !b) continue;
    const aAcc = accuracy(stats[aKey]);
    const bAcc = accuracy(stats[bKey]);
    if (aAcc == null && bAcc == null) continue;
    const aWeak = aAcc != null && aAcc < WEAK_ACCURACY;
    const bWeak = bAcc != null && bAcc < WEAK_ACCURACY;
    if (aWeak && !bWeak) {
      const gap = (bAcc ?? 1) - aAcc;
      if (!best || gap > best.gap) best = { c: a, other: bKey, gap, acc: aAcc };
    } else if (bWeak && !aWeak) {
      const gap = (aAcc ?? 1) - bAcc;
      if (!best || gap > best.gap) best = { c: b, other: aKey, gap, acc: bAcc };
    } else if (aWeak && bWeak) {
      const pick = aAcc <= bAcc ? a : b;
      const acc = Math.min(aAcc, bAcc);
      const gap = Math.abs(aAcc - bAcc);
      if (!best || acc < best.acc) best = { c: pick, other: pick === a ? bKey : aKey, gap, acc };
    }
  }
  return best;
}

function result(candidate, reason, tier, features, candidateCount) {
  return {
    candidate,
    reasonCode: reason,
    audit: {
      tier,
      features: features || {},
      candidateCount,
    },
  };
}

/**
 * Pick the next candidate + reason.
 *
 * Policy tiers (§15):
 *   0) felt_too_hard / felt_too_easy — optional post-answer difficulty rating
 *   1) scaffold_adjust — recent deep hints → easier preset
 *   2) edge_of_competence — hard preset weak while easy preset OK
 *   3) review — weakest unit×preset (re-deal the failing modality)
 *   4) edge/review — weak unit (fallback; prefer weak preset over hardest)
 *   5) contrast pair (komma vs euro) when one side weak
 *   6) new — first unseen along soft arc
 *   7) probe_mastery — strong unit, test harder / untested preset
 *   8) continue — maintenance on weakest
 *
 * @param {object} [input]
 * @returns {{ candidate: DealCandidate, reasonCode: ReasonCode, audit: DealAudit } | null}
 */
export function dealExercise({
  candidates,
  seen = [],
  stats: statsIn,
  evidence = null,
  softArc = null,
  presetSeeds = {},
  recentHintDepth = 0,
  recentDealKey = null,
  /**
   * Unit just answered in a listen deck. Review tiers skip it for this deal
   * so one prompt is not the next card. The 67% gate applies again after.
   */
  listenCooldownKey = null,
  /** @type {"too-easy"|"about-right"|"too-hard"|null|undefined} */
  recentFeltDifficulty = null,
  overlays = {},
} = {}) {
  const raw = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  const list = applyOverlays(raw, overlays);
  if (!list.length) return null;
  const seenSet = new Set(seen);
  const stats = unitStatsFromInput({ stats: statsIn, evidence }, list);
  const n = list.length;

  const focusKey = recentDealKey || [...seenSet].slice(-1)[0];
  const focusCand =
    list.find((c) => c.key === focusKey) ||
    list.find((c) => seenSet.has(c.key));

  // 0a) Learner said too hard → ease next preset on focus unit.
  if (recentFeltDifficulty === "too-hard" && focusCand) {
    const easy = easiestPreset(focusCand, presetSeeds);
    if (easy) {
      return result(
        clonePick(focusCand, easy),
        DEALER_REASONS.felt_too_hard,
        "felt",
        {
          recentFeltDifficulty,
          focusKey: focusCand.key,
          preset: easy,
          seed: seedOf(easy, presetSeeds),
        },
        n
      );
    }
  }

  // 0b) Learner said too easy → stretch with harder / untested preset.
  if (recentFeltDifficulty === "too-easy" && focusCand) {
    const hard = hardestPreset(focusCand, presetSeeds);
    if (hard) {
      return result(
        clonePick(focusCand, hard),
        DEALER_REASONS.felt_too_easy,
        "felt",
        {
          recentFeltDifficulty,
          focusKey: focusCand.key,
          preset: hard,
          seed: seedOf(hard, presetSeeds),
        },
        n
      );
    }
  }

  // 1) Scaffold — deep recent hints → ease next preset on focus unit.
  if (recentHintDepth >= HIGH_HINT_DEPTH) {
    const focus = focusCand;
    if (focus) {
      const easy = easiestPreset(focus, presetSeeds);
      if (easy) {
        return result(
          clonePick(focus, easy),
          DEALER_REASONS.scaffold_adjust,
          "scaffold",
          {
            recentHintDepth,
            focusKey: focus.key,
            preset: easy,
            seed: seedOf(easy, presetSeeds),
          },
          n
        );
      }
    }
  }

  // 2) Edge — hard preset weak while easy preset OK (freeform vs MC).
  const edgeIx = findEdgePresetContrast(
    list,
    seenSet,
    evidence,
    presetSeeds,
    listenCooldownKey
  );
  if (edgeIx) {
    return result(
      clonePick(edgeIx.c, edgeIx.preset),
      DEALER_REASONS.edge_of_competence,
      "edge",
      {
        unitKey: edgeIx.c.key,
        preset: edgeIx.preset,
        hardAcc: edgeIx.hardAcc,
        easyPreset: edgeIx.easy,
        easyAcc: edgeIx.easyAcc,
      },
      n
    );
  }

  // 3) Review — re-deal the weakest unit×preset (e.g. Build miss, Convert OK).
  const weakPreset = findWeakPreset(list, seenSet, evidence, listenCooldownKey);
  if (weakPreset) {
    return result(
      clonePick(weakPreset.c, weakPreset.preset),
      DEALER_REASONS.review,
      "review",
      {
        unitKey: weakPreset.c.key,
        preset: weakPreset.preset,
        presetAcc: weakPreset.acc,
      },
      n
    );
  }

  // 4) Weak unit fallback — prefer that unit's weakest preset, else hardest.
  const weak = weakestSeen(list, seenSet, stats, listenCooldownKey);
  if (weak) {
    const weakIx = weakestPresetForUnit(weak.c, evidence);
    const hard = hardestPreset(weak.c, presetSeeds);
    const preset =
      (weakIx && weakIx.acc < WEAK_ACCURACY && weakIx.preset) ||
      hard ||
      weak.c.mode ||
      weak.c.modeId;
    const fromWeakPreset = weakIx && weakIx.preset === preset;
    const reason = fromWeakPreset
      ? DEALER_REASONS.review
      : hard && hard !== (weak.c.mode || weak.c.modeId)
        ? DEALER_REASONS.edge_of_competence
        : DEALER_REASONS.review;
    return result(clonePick(weak.c, preset), reason, "edge", {
      unitKey: weak.c.key,
      unitAcc: weak.acc,
      preset: preset || null,
      presetAcc: weakIx?.acc ?? null,
    }, n);
  }

  // 5) Contrast pairs (komma vs euro).
  const contrast = findContrast(list, seenSet, stats, listenCooldownKey);
  if (contrast) {
    return result(
      contrast.c,
      DEALER_REASONS.edge_of_competence,
      "contrast",
      {
        unitKey: contrast.c.key,
        otherKey: contrast.other,
        unitAcc: contrast.acc,
      },
      n
    );
  }

  // 6) New — first unseen along soft arc (before probing seen units).
  const ordered = orderBySoftArc(list, softArc);
  const fresh = ordered.find((c) => !seenSet.has(c.key));
  if (fresh) {
    return result(fresh, DEALER_REASONS.new, "new", { unitKey: fresh.key }, n);
  }

  // 7) Probe mastery on harder / untested preset (all units already seen).
  const probe = findProbe(
    list,
    seenSet,
    stats,
    evidence,
    presetSeeds,
    listenCooldownKey
  );
  if (probe) {
    return result(
      clonePick(probe.c, probe.preset),
      DEALER_REASONS.probe_mastery,
      "probe",
      {
        unitKey: probe.c.key,
        preset: probe.preset,
        untested: probe.untested,
        unitAcc: probe.unitAcc,
      },
      n
    );
  }

  // 8) Continue — maintenance on lowest accuracy.
  let pick = null;
  const continueList = list.filter((c) => !listenCooldownKey || c.key !== listenCooldownKey);
  const continuePool = continueList.length ? continueList : list;
  for (const c of continuePool) {
    const acc = accuracy(stats[c.key]);
    const score = acc == null ? 1 : acc;
    if (!pick || score < pick.score) pick = { c, score };
  }
  return result(
    pick?.c || list[0],
    DEALER_REASONS.continue,
    "maintenance",
    {
      unitKey: pick?.c?.key || list[0].key,
      unitAcc: pick ? pick.score : null,
    },
    n
  );
}
