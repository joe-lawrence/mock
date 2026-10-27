/**
 * Reference browse + entry rendering (sheet overlay).
 */

import {
  getReference,
  reference,
  referenceNav,
} from "./generated/reference.js?v=20261025-case3";
import { escapeHtml as esc, renderInline, renderProse } from "./md-lite.js";

function examplesTableHtml(rows) {
  if (!Array.isArray(rows) || !rows.length) return "";
  const keys = Object.keys(rows[0]);
  const label = (k) => k.charAt(0).toUpperCase() + k.slice(1);
  return `<table class="ref-table"><thead><tr>${keys
    .map((k) => `<th>${esc(label(k))}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map(
      (r) =>
        `<tr>${keys.map((k) => `<td>${renderInline(String(r[k] ?? ""))}</td>`).join("")}</tr>`
    )
    .join("")}</tbody></table>`;
}

function sectionBlock(title, body) {
  if (!body || !String(body).trim()) return "";
  // Skip raw JSON section if it leaked
  if (/^```json/m.test(body)) return "";
  return `<section class="ref-section"><h4>${esc(title)}</h4>${renderProse(body)}</section>`;
}

function missingReferenceHtml(id) {
  return `<p class="ref-missing">Unknown reference: <code>${esc(id)}</code></p>`;
}

function summaryHtml(unit) {
  if (!unit?.summary) return "";
  return `<p class="ref-summary">${renderInline(unit.summary)}</p>`;
}

/** Body summary, when the page wrote one that is not the short card line. */
function learnSummaryHtml(unit) {
  const body = String(unit?.sections?.summary || "").trim();
  const line = String(unit?.summary || "").trim();
  if (!body || body === line) return "";
  return sectionBlock("Summary", body);
}

function examplesBlock(unit) {
  if (unit?.examplesTable?.length > 0) {
    return `<section class="ref-section"><h4>Examples</h4>${examplesTableHtml(unit.examplesTable)}</section>`;
  }
  return sectionBlock("Examples", unit?.sections?.examples);
}

/**
 * Full curriculum reading: summary, Pattern, Rule, Examples, Limitations, Notes.
 * @param {string} id
 */
export function renderLearnReadingHtml(id) {
  const u = getReference(id);
  if (!u) return missingReferenceHtml(id);
  return `
    <article class="ref-entry" data-ref-id="${esc(u.id)}" data-ref-view="learn">
      <h3 class="ref-title">${esc(u.title)}</h3>
      ${summaryHtml(u)}
      ${learnSummaryHtml(u)}
      ${sectionBlock("Pattern", u.sections?.pattern)}
      ${sectionBlock("Rule", u.sections?.rule)}
      ${examplesBlock(u)}
      ${sectionBlock("Limitations", u.sections?.limitations)}
      ${sectionBlock("Notes", u.sections?.notes)}
    </article>`;
}

/**
 * Chart appended under a Learn reading: summary and examples only.
 * @param {string} id
 */
export function renderChartLookupHtml(id) {
  const u = getReference(id);
  if (!u) return missingReferenceHtml(id);
  return `
    <article class="ref-entry ref-chart-lookup" data-ref-id="${esc(u.id)}" data-ref-view="chart">
      <h3 class="ref-title">${esc(u.title)}</h3>
      ${summaryHtml(u)}
      ${examplesBlock(u)}
    </article>`;
}

/** Short reference card: summary, examples, Related links. */
export function renderReferenceEntryHtml(id) {
  const u = getReference(id);
  if (!u) return missingReferenceHtml(id);
  const related = (u.related || [])
    .map((rid) => {
      const t = getReference(rid)?.title || rid;
      return `<button type="button" class="ref-link" data-ref-id="${esc(rid)}">${esc(t)}</button>`;
    })
    .join("");

  return `
    <article class="ref-entry" data-ref-id="${esc(u.id)}" data-ref-view="card">
      <p class="ref-kicker">${esc(u.territory)}${u.section ? ` · ${esc(u.section)}` : ""}</p>
      <h3 class="ref-title">${esc(u.title)}</h3>
      ${summaryHtml(u)}
      ${examplesBlock(u)}
      ${related ? `<section class="ref-section"><h4>Related</h4><div class="ref-related">${related}</div></section>` : ""}
    </article>
  `;
}

/** Landing / territory browse HTML. */
export function renderReferenceLandingHtml(territoryId = null) {
  const territories = Object.values(referenceNav);
  if (!territoryId) {
    return `
      <div class="ref-landing">
        <p class="ref-kicker">Reference</p>
        <h3>Look up how German works</h3>
        <p class="ref-summary">Rules, patterns, examples, and limits — scaffolding, not cheating.</p>
        <div class="ref-territory-grid">
          ${territories
            .map(
              (t) => `
            <button type="button" class="ref-territory-card" data-ref-territory="${esc(t.id)}">
              <strong>${esc(t.label)}</strong>
              <span>${esc(t.blurb)}</span>
            </button>`
            )
            .join("")}
        </div>
      </div>
    `;
  }
  const t = referenceNav[territoryId];
  if (!t) return renderReferenceLandingHtml(null);
  const sections = Object.values(t.sections || {});
  return `
    <div class="ref-landing">
      <p class="ref-crumb">
        <button type="button" class="ref-link" data-ref-home>Reference</button>
        · ${esc(t.label)}
      </p>
      <h3>${esc(t.label)}</h3>
      <p class="ref-summary">${esc(t.blurb)}</p>
      ${sections
        .map(
          (sec) => `
        <section class="ref-section">
          <h4>${esc(sec.label)}</h4>
          <ul class="ref-unit-list">
            ${(sec.units || [])
              .map(
                (u) => `
              <li>
                <button type="button" class="ref-link" data-ref-id="${esc(u.id)}">${esc(u.title)}</button>
                ${u.summary ? `<span class="ref-unit-sum">${esc(u.summary)}</span>` : ""}
              </li>`
              )
              .join("")}
          </ul>
        </section>`
        )
        .join("")}
    </div>
  `;
}

/**
 * Wire click handlers inside a rendered Reference sheet body.
 * @param {HTMLElement} root
 * @param {{ openId: (id: string) => void, openTerritory: (id: string) => void, openHome: () => void }} nav
 */
export function wireReferenceNav(root, nav) {
  root.querySelectorAll("[data-ref-id]").forEach((btn) => {
    btn.addEventListener("click", () => nav.openId(btn.getAttribute("data-ref-id")));
  });
  root.querySelectorAll("[data-ref-territory]").forEach((btn) => {
    btn.addEventListener("click", () =>
      nav.openTerritory(btn.getAttribute("data-ref-territory"))
    );
  });
  root.querySelectorAll("[data-ref-home]").forEach((btn) => {
    btn.addEventListener("click", () => nav.openHome());
  });
}

/** Map practice context → best-effort Reference ID. */
export function referenceIdForPracticeContext(ctx) {
  if (!ctx) return null;
  if (ctx.referenceId && getReference(ctx.referenceId)) return ctx.referenceId;
  if (ctx.territory === "numbers") {
    const step = ctx.stepId || "";
    const map = {
      base: "numbers.cardinal.0-12",
      teens: "numbers.cardinal.13-19",
      tens: "numbers.cardinal.tens",
      compounds: "numbers.cardinal.compound",
      hundreds: "numbers.cardinal.hundreds",
      "hundreds-plus": "numbers.cardinal.hundreds",
      "komma-read": "numbers.decimals.komma",
      "place-value": "numbers.decimals.komma",
      "money-euros": "numbers.decimals.money",
      "money-cents": "numbers.decimals.money",
      "half-quarter": "numbers.fractions",
      "unit-fractions": "numbers.fractions",
      "proper-fractions": "numbers.fractions",
      "mixed-numbers": "numbers.fractions",
      "whole-hours": "numbers.time",
      "half-past": "numbers.time",
      quarters: "numbers.time",
      minutes: "numbers.time",
      "digital-24h": "numbers.time",
      duration: "numbers.time",
      weekdays: "numbers.dates",
      months: "numbers.dates",
      length: "numbers.measurements",
      weight: "numbers.measurements",
      volume: "numbers.measurements",
      "temp-speed": "numbers.measurements",
      "ordinal-1-12": "numbers.ordinals",
      "ordinal-teens": "numbers.ordinals",
      "ordinal-tens": "numbers.ordinals",
      "ordinal-compounds": "numbers.ordinals",
    };
    if (map[step]) return map[step];
    return "numbers.overview";
  }
  if (ctx.territory === "nouns") {
    const mode = ctx.mode || "";
    if (mode === "plurals" || mode.startsWith("plural-")) return "nouns.plurals";
    if (
      mode === "gender-recognition" ||
      mode === "article-application" ||
      mode === "gender-imposter" ||
      mode === "sentence-validation"
    ) {
      return "nouns.categories";
    }
    if (mode === "wugs" || mode === "real-words" || mode === "association") {
      return "nouns.suffix.feminine";
    }
    return "nouns.overview";
  }
  if (ctx.territory === "sounds") return "sounds.overview";
  return null;
}

export { reference, getReference };
