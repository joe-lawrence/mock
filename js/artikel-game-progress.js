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
 * Laplace-smoothed miss rate for “needs review / least certain” ranking.
 * Prioritizes practice order under sparse evidence — not a pure weakness rank.
 * 0/1 → 0.33, 1/1 → 0.67, 5/5 → 0.86, 0/5 → 0.14
 * @param {number} wrong
 * @param {number} attempts
 */
export function smoothedMissRate(wrong, attempts) {
  const w = Math.max(0, Number(wrong) || 0);
  const n = Math.max(0, Number(attempts) || 0);
  return (w + 1) / (n + 2);
}

/**
 * Deck progress = introduced / deck.
 * Hint dependence (HUD) = introduced still showing hints / deck.
 * Graduation rate = graduated / introduced.
 * Introduced = active ∪ graduated (never unseen). Entered play = seen as target.
 *
 * Hint splits:
 * - introducedHintedNotPlayed = in active∪graduated with hint, never a ski target
 * - introducedHintedPlayed = hinted and actually served as target
 * - hintAmongPlayed = hinted among entered-play / entered-play
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
  const introducedHintedList = introducedList.filter(
    (w) => w.showHint !== false
  );
  const introducedHinted = introducedHintedList.length;
  const enteredPlayList = [...seenByKey.values()];
  const enteredPlay = enteredPlayList.length;
  const introducedHintedPlayed = introducedHintedList.filter((w) =>
    seenByKey.has(wordKey(w))
  ).length;
  const introducedHintedNotPlayed = introducedHinted - introducedHintedPlayed;
  const playedHinted = enteredPlayList.filter(
    (w) => w.showHint !== false
  ).length;
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
  const hintAmongPlayedPct = pct(playedHinted, enteredPlay);
  const graduationRatePct = pct(graduated, introduced);

  return {
    deckTotal,
    unseen,
    active,
    graduated,
    introduced,
    introducedHinted,
    introducedHintedPlayed,
    introducedHintedNotPlayed,
    playedHinted,
    enteredPlay,
    activeNotPlayed,
    deckProgressPct,
    hintDependencePct,
    hintAmongIntroducedPct,
    hintAmongPlayedPct,
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
  // Keep payload key weakestPlayed for audit compatibility; label is “Needs review”.
  const weakestPlayed = [...playedRows]
    .map((r) => {
      const attempts = r.correct + r.wrong;
      const accuracy = r.correct / attempts;
      const missSmooth = smoothedMissRate(r.wrong, attempts);
      return {
        word: r.word,
        article: r.article,
        correct: r.correct,
        wrong: r.wrong,
        attempts,
        accuracyPct: Math.round(accuracy * 100),
        missPct: Math.round((1 - accuracy) * 100),
        missScore: Math.round(missSmooth * 1000) / 1000,
      };
    })
    .sort((a, b) => {
      // Uncertainty-aware practice order: smoothed miss, then raw errors, then n.
      if (b.missScore !== a.missScore) return b.missScore - a.missScore;
      if (b.wrong !== a.wrong) return b.wrong - a.wrong;
      if (b.attempts !== a.attempts) return b.attempts - a.attempts;
      return a.word.localeCompare(b.word, "de");
    })
    .slice(0, 5);

  const needsReviewLines =
    weakestPlayed.length > 0
      ? [
          "Needs review (least certain — not pure weakness)",
          "Order: Laplace (wrong+1)/(n+2); show errors and sample size",
          ...weakestPlayed.map(
            (w, i) =>
              `${i + 1}. ${w.article} ${w.word} — ${w.wrong} errors · n=${w.attempts} (${w.correct}✓/${w.wrong}✗) · score ${w.missScore}`
          ),
        ]
      : ["Needs review", "— none played —"];

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
      hintDependence:
        "introduced with showHint / deckTotal (HUD; includes not-yet-played)",
      hintAmongIntroduced: "introduced with showHint / introduced",
      hintAmongPlayed:
        "entered-play still showing hint / entered-play (actual target exposure)",
      introducedHintedNotPlayed:
        "introduced + hint, but never served as a ski/climber target",
      graduationRate: "graduated / introduced",
      needsReviewRanking:
        "Least certain for more practice: Laplace (wrong+1)/(attempts+2). Not a pure demonstrated-weakness rank — sparse evidence ranks above strong performance with few tries.",
      weakestRanking:
        "Alias of needsReviewRanking (legacy key)",
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
        note: "Includes introduced-but-not-played; see hintAmongPlayed for exposure",
      },
      hintAmongIntroduced: {
        count: `${snap.introducedHinted}/${snap.introduced || 0}`,
        pct: snap.hintAmongIntroducedPct,
      },
      hintAmongPlayed: {
        count: `${snap.playedHinted}/${snap.enteredPlay || 0}`,
        pct: snap.hintAmongPlayedPct,
        note: "Only words that were actual ski/climber targets",
      },
      introducedHintedSplit: {
        played: snap.introducedHintedPlayed,
        notPlayed: snap.introducedHintedNotPlayed,
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
    ...needsReviewLines,
    "",
    "Pools (mutually exclusive; should sum to deck)",
    `Unseen ${snap.unseen} · Active ${snap.active} · Graduated ${snap.graduated} · sum ${snap.unseen + snap.active + snap.graduated} / deck ${snap.deckTotal}`,
    "",
    `Deck progress ${snap.deckProgressPct ?? "—"}% (${snap.introduced}/${snap.deckTotal}) = introduced/deck`,
    `Hint dependence ${snap.hintDependencePct ?? "—"}% (${snap.introducedHinted}/${snap.deckTotal}) = introduced+hint/deck (incl. not-yet-played)`,
    `Hint among introduced ${snap.hintAmongIntroducedPct ?? "—"}% (${snap.introducedHinted}/${snap.introduced || 0})`,
    `Hint among played ${snap.hintAmongPlayedPct ?? "—"}% (${snap.playedHinted}/${snap.enteredPlay || 0}) = hinted targets / targets`,
    `Hinted introduced — played ${snap.introducedHintedPlayed} · not yet played ${snap.introducedHintedNotPlayed}`,
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
