/**
 * Shared progress / report grading for Wort-Hüpfer and Snow-Nomen.
 */

/**
 * @param {{ gender?: string, article?: string, word?: string }|null|undefined} w
 */
export function wordKey(w) {
  return `${w?.gender || ""}:${w?.article || ""}:${w?.word || ""}`;
}

/**
 * @param {object} w
 * @param {{ unseenPool: object[], activePool: object[], graduatedPool: object[] }} pools
 */
export function poolOf(w, pools) {
  if (pools.graduatedPool.includes(w)) return "graduated";
  if (pools.activePool.includes(w)) return "active";
  if (pools.unseenPool.includes(w)) return "unseen";
  return null;
}

function pct(num, den) {
  if (!den) return null;
  return Math.round((num / den) * 100);
}

/**
 * Deck progress = introduced / deck.
 * Hint dependence (HUD) = introduced still showing hints / deck.
 * Graduation rate = graduated / introduced.
 * Introduced = active ∪ graduated (never unseen). Entered play = seen as target.
 *
 * @param {{
 *   words: object[],
 *   pools: { unseenPool: object[], activePool: object[], graduatedPool: object[] },
 *   seenByKey: Map<string, object>,
 * }} args
 */
export function progressSnapshot({ words, pools, seenByKey }) {
  const deckTotal = words.length;
  const unseen = pools.unseenPool.length;
  const active = pools.activePool.length;
  const graduated = pools.graduatedPool.length;
  const introducedList = [...pools.activePool, ...pools.graduatedPool];
  const introduced = introducedList.length;
  const introducedHinted = introducedList.filter(
    (w) => w.showHint !== false
  ).length;
  const enteredPlayList = [...seenByKey.values()];
  const enteredPlay = enteredPlayList.length;
  const activeNotPlayed = pools.activePool.filter(
    (w) => !seenByKey.has(wordKey(w))
  );
  const poolSum = unseen + active + graduated;
  const flags = [];
  if (deckTotal > 0 && poolSum !== deckTotal) {
    flags.push(
      `pool_sum_mismatch: unseen+active+graduated=${poolSum} deck=${deckTotal}`
    );
  }
  if (introduced !== active + graduated) {
    flags.push(
      `introduced_mismatch: introduced=${introduced} active+graduated=${active + graduated}`
    );
  }
  const hintedCheck = introducedList.filter((w) => w.showHint !== false).length;
  if (hintedCheck !== introducedHinted) {
    flags.push(`hint_count_mismatch: ${hintedCheck} vs ${introducedHinted}`);
  }
  for (const w of enteredPlayList) {
    if (poolOf(w, pools) === "unseen") {
      flags.push(`entered_play_but_unseen: ${w.word}`);
    }
  }

  const deckProgressPct = pct(introduced, deckTotal);
  const hintDependencePct = pct(introducedHinted, deckTotal);
  const hintAmongIntroducedPct = pct(introducedHinted, introduced);
  const graduationRatePct = pct(graduated, introduced);

  return {
    deckTotal,
    unseen,
    active,
    graduated,
    introduced,
    introducedHinted,
    enteredPlay,
    activeNotPlayed,
    deckProgressPct,
    hintDependencePct,
    hintAmongIntroducedPct,
    graduationRatePct,
    flags,
    // HUD aliases (same denominators as above)
    hintsPct: hintDependencePct,
    deckPct: deckProgressPct,
    hintedCount: introducedHinted,
    inPlayCount: enteredPlay,
  };
}

/**
 * @param {{
 *   gameId: string,
 *   gameTitle: string,
 *   score: number,
 *   speed: number,
 *   words: object[],
 *   pools: { unseenPool: object[], activePool: object[], graduatedPool: object[] },
 *   seenByKey: Map<string, object>,
 *   targetLabel?: string,
 * }} args
 * @returns {{ payload: object, text: string, json: string }}
 */
export function buildGameReport({
  gameId,
  gameTitle,
  score,
  speed,
  words,
  pools,
  seenByKey,
  targetLabel = "target",
}) {
  const snap = progressSnapshot({ words, pools, seenByKey });
  const allWords = [
    ...pools.unseenPool,
    ...pools.activePool,
    ...pools.graduatedPool,
  ];
  const byKey = new Map(allWords.map((w) => [wordKey(w), w]));
  for (const [k, w] of seenByKey) if (!byKey.has(k)) byKey.set(k, w);

  const rows = [...byKey.values()].map((w) => {
    const pool = poolOf(w, pools) || "unseen";
    const introduced = pool === "active" || pool === "graduated";
    const enteredPlay = seenByKey.has(wordKey(w));
    let activeNote = "";
    if (pool === "active" && !enteredPlay) {
      activeNote = `in active set (SRS) but not yet served as a ${targetLabel}`;
    }
    return {
      word: w.word,
      article: w.article,
      gender: w.gender,
      pool,
      introduced,
      enteredPlay,
      activeNote: activeNote || undefined,
      streak: w.streak || 0,
      showHint: w.showHint !== false,
      hintMeans:
        "Color hint visible — not the same as lacking gender knowledge",
      correct: w.correct || 0,
      wrong: w.wrong || 0,
      postGradCorrect: w.postGradCorrect || 0,
      postGradWrong: w.postGradWrong || 0,
    };
  });
  rows.sort((a, b) => a.word.localeCompare(b.word, "de"));

  const playedRows = rows.filter(
    (r) => r.enteredPlay && r.correct + r.wrong > 0
  );
  const weakestPlayed = [...playedRows]
    .map((r) => {
      const attempts = r.correct + r.wrong;
      const accuracy = r.correct / attempts;
      return {
        word: r.word,
        article: r.article,
        correct: r.correct,
        wrong: r.wrong,
        attempts,
        accuracyPct: Math.round(accuracy * 100),
        missPct: Math.round((1 - accuracy) * 100),
      };
    })
    .sort((a, b) => {
      if (b.missPct !== a.missPct) return b.missPct - a.missPct;
      if (b.wrong !== a.wrong) return b.wrong - a.wrong;
      if (a.correct !== b.correct) return a.correct - b.correct;
      return a.word.localeCompare(b.word, "de");
    })
    .slice(0, 5);

  const weakestLines =
    weakestPlayed.length > 0
      ? [
          "Weakest words",
          ...weakestPlayed.map(
            (w, i) =>
              `${i + 1}. ${w.article} ${w.word} — ${w.correct}✓ · ${w.wrong}✗ (${w.accuracyPct}%)`
          ),
        ]
      : ["Weakest words", "— none played —"];

  const payload = {
    game: gameId,
    endedAt: new Date().toISOString(),
    score,
    speed,
    definitions: {
      unseen: "Never introduced into the active SRS set",
      active: "Introduced, not yet graduated",
      graduated:
        "Met current success threshold (streak); not durable mastery — still reviewed",
      introduced: "active ∪ graduated",
      enteredPlay: `Appeared at least once as the ${targetLabel}`,
      deckProgress: "introduced / deckTotal",
      hintDependence: "introduced with showHint / deckTotal (HUD)",
      hintAmongIntroduced: "introduced with showHint / introduced",
      graduationRate: "graduated / introduced",
    },
    summary: {
      deckTotal: snap.deckTotal,
      unseen: snap.unseen,
      active: snap.active,
      graduated: snap.graduated,
      poolSum: snap.unseen + snap.active + snap.graduated,
      introduced: snap.introduced,
      enteredPlay: snap.enteredPlay,
      activeNotYetPlayed: snap.activeNotPlayed.map((w) => w.word),
      deckProgress: {
        count: `${snap.introduced}/${snap.deckTotal}`,
        pct: snap.deckProgressPct,
      },
      hintDependence: {
        count: `${snap.introducedHinted}/${snap.deckTotal}`,
        pct: snap.hintDependencePct,
        note: "Full-deck denominator; hidden hints ≠ mastered gender",
      },
      hintAmongIntroduced: {
        count: `${snap.introducedHinted}/${snap.introduced || 0}`,
        pct: snap.hintAmongIntroducedPct,
      },
      graduationRate: {
        count: `${snap.graduated}/${snap.introduced || 0}`,
        pct: snap.graduationRatePct,
        note: "Threshold met this run — not durable mastery",
      },
      flags: snap.flags,
    },
    weakestPlayed,
    words: rows,
  };

  const flagLines =
    snap.flags.length > 0
      ? ["", "FLAGS (consistency)", ...snap.flags.map((f) => `! ${f}`)]
      : [];
  const waiting =
    snap.activeNotPlayed.length > 0
      ? [
          "",
          `Active not yet played as ${targetLabel}:`,
          ...snap.activeNotPlayed.map((w) => `- ${w.article} ${w.word}`),
        ]
      : [];

  const textLines = [
    `${gameTitle} — Punktzahl ${score}`,
    "",
    ...weakestLines,
    "",
    "Pools (mutually exclusive; should sum to deck)",
    `Unseen ${snap.unseen} · Active ${snap.active} · Graduated ${snap.graduated} · sum ${snap.unseen + snap.active + snap.graduated} / deck ${snap.deckTotal}`,
    "",
    `Deck progress ${snap.deckProgressPct ?? "—"}% (${snap.introduced}/${snap.deckTotal}) = introduced/deck`,
    `Hint dependence ${snap.hintDependencePct ?? "—"}% (${snap.introducedHinted}/${snap.deckTotal}) = introduced+hint/deck`,
    `Hint among introduced ${snap.hintAmongIntroducedPct ?? "—"}% (${snap.introducedHinted}/${snap.introduced || 0})`,
    `Graduation rate ${snap.graduationRatePct ?? "—"}% (${snap.graduated}/${snap.introduced || 0}) = graduated/introduced`,
    `Entered play (as ${targetLabel}) ${snap.enteredPlay}/${snap.deckTotal}`,
    "Note: Graduation = current streak threshold, not durable mastery. Post-grad reviews tracked separately.",
    "Note: Hidden color hints ≠ proven gender knowledge.",
    ...waiting,
    ...flagLines,
    "",
    "Wort\tArtikel\tPool\tIntroduced\tPlayed\tStreak\tHint\t✓\t✗\tPostGrad✓\tPostGrad✗",
    ...rows.map(
      (r) =>
        `${r.word}\t${r.article}\t${r.pool}\t${r.introduced ? "ja" : "nein"}\t${
          r.enteredPlay ? "ja" : "nein"
        }\t${r.streak}\t${r.showHint ? "ja" : "nein"}\t${r.correct}\t${r.wrong}\t${
          r.postGradCorrect
        }\t${r.postGradWrong}`
    ),
  ];

  return {
    payload,
    text: textLines.join("\n"),
    json: JSON.stringify(payload, null, 2),
  };
}
