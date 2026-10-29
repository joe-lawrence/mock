/**
 * Answer-key syllables for real productive plurals (die Schwierigkeiten).
 * Imaginary wugs stay without karaoke. Stem tables stay in mock.js.
 */

function beat(text, guide) {
  return { text, guide, source: "suffix-chart" };
}

/**
 * Turn singular suffix beats into the productive plural.
 * -ion → …o·nen, -heit/-keit → …hei/kei·ten, -schaft → …schaf·ten,
 * -ung → …(n)un·gen. A zero ending keeps the singular beats.
 * @param {Array<{ text?: string, guide?: string, stress?: boolean, source?: string, pronunciationUnavailable?: boolean }> | null} singularBody
 * @param {{ ending?: string } | null} spec
 */
export function pluralizeProductiveBeats(singularBody, spec) {
  if (!singularBody?.length || !spec) return null;
  const beats = singularBody.map((p) => ({ ...p }));
  if (spec.ending === "—") return beats;
  if (spec.ending !== "en") return null;
  const last = beats[beats.length - 1];
  const t = String(last?.text || "").toLowerCase();
  if (t === "on") {
    beats.pop();
    beats.push(beat("o", "oh"));
    beats.push(beat("nen", "nen"));
    return beats;
  }
  if (t === "keit" || t === "heit") {
    beats.pop();
    beats.push(beat(t.slice(0, 3), t === "keit" ? "kye" : "hye"));
    beats.push(beat("ten", "ten"));
    return beats;
  }
  if (t === "schaft") {
    beats.pop();
    beats.push(beat("schaf", "shahf"));
    beats.push(beat("ten", "ten"));
    return beats;
  }
  if (t.endsWith("ung")) {
    const guide = String(last.guide || "");
    const stemGuide = guide.endsWith("ng") ? guide.slice(0, -1) : guide;
    beats.pop();
    beats.push({
      text: String(last.text).slice(0, -1),
      guide: stemGuide || undefined,
      pronunciationUnavailable: !stemGuide,
      source: "suffix-chart",
    });
    beats.push(beat("gen", "gen"));
    return beats;
  }
  beats.push(beat("en", "en"));
  return beats;
}

/** Stable build-the-plural tray: answer stem, then endings, then —. */
const PLURAL_ENDING_ORDER = Object.freeze(["e", "en", "er", "s", "n", "—"]);

export function orderPluralTrayLabels(buildParts, distractors) {
  const articles = new Set(["der", "die", "das"]);
  const endings = new Set(PLURAL_ENDING_ORDER);
  const visible = [...(buildParts || []), ...(distractors || []), "—"].filter(
    (t) => t && !articles.has(t)
  );
  const stem =
    (buildParts || []).find((t) => t && !articles.has(t) && !endings.has(t)) ||
    "";
  const ordered = [];
  const seen = new Set();
  const push = (t) => {
    if (!t || seen.has(t) || articles.has(t)) return;
    seen.add(t);
    ordered.push(t);
  };
  push(stem);
  for (const t of visible) {
    if (!endings.has(t)) push(t);
  }
  for (const t of PLURAL_ENDING_ORDER) {
    if (visible.includes(t)) push(t);
  }
  for (const t of visible) push(t);
  if (!ordered.includes("—")) ordered.push("—");
  return ordered;
}
