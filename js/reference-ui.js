/**
 * Reference browse + entry rendering (sheet overlay).
 */

import {
  getReference,
  reference,
  referenceNav,
  REFERENCE_VERSION,
} from "./generated/reference.js?v=20260930-ref1";

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdLite(text) {
  if (!text) return "";
  // Very small subset: paragraphs + inline code + bold + tables already HTML-escaped lines
  const blocks = String(text).trim().split(/\n\n+/);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((l) => l.trim().startsWith("|"))) {
        return tableHtml(lines);
      }
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        const items = lines
          .map((l) => l.replace(/^\s*[-*]\s+/, ""))
          .map((l) => `<li>${inline(l)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inline(lines.join(" "))}</p>`;
    })
    .join("");
}

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function tableHtml(lines) {
  const rows = lines
    .map((l) =>
      l
        .split("|")
        .map((c) => c.trim())
        .filter((_, i, a) => i > 0 && i < a.length - 1)
    )
    .filter((r) => r.length && !r.every((c) => /^-+$/.test(c)));
  if (rows.length < 2) return "";
  const [head, ...body] = rows;
  return `<table class="ref-table"><thead><tr>${head
    .map((c) => `<th>${inline(c)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function examplesTableHtml(rows) {
  if (!Array.isArray(rows) || !rows.length) return "";
  const keys = Object.keys(rows[0]);
  const label = (k) => k.charAt(0).toUpperCase() + k.slice(1);
  return `<table class="ref-table"><thead><tr>${keys
    .map((k) => `<th>${esc(label(k))}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map(
      (r) =>
        `<tr>${keys.map((k) => `<td>${inline(String(r[k] ?? ""))}</td>`).join("")}</tr>`
    )
    .join("")}</tbody></table>`;
}

function sectionBlock(title, body) {
  if (!body || !String(body).trim()) return "";
  // Skip raw JSON section if it leaked
  if (/^```json/m.test(body)) return "";
  return `<section class="ref-section"><h4>${esc(title)}</h4>${mdLite(body)}</section>`;
}

/** HTML for a single Reference unit entry. */
export function renderReferenceEntryHtml(id) {
  const u = getReference(id);
  if (!u) {
    return `<p class="ref-missing">Unknown reference: <code>${esc(id)}</code></p>`;
  }
  const related = (u.related || [])
    .map((rid) => {
      const t = getReference(rid)?.title || rid;
      return `<button type="button" class="ref-link" data-ref-id="${esc(rid)}">${esc(t)}</button>`;
    })
    .join("");
  const practice = (u.practice || [])
    .map((pid) => `<li><code>${esc(pid)}</code></li>`)
    .join("");
  const examples =
    u.examplesTable?.length > 0
      ? `<section class="ref-section"><h4>Examples</h4>${examplesTableHtml(u.examplesTable)}</section>`
      : sectionBlock("Examples", u.sections?.examples);

  return `
    <article class="ref-entry" data-ref-id="${esc(u.id)}">
      <p class="ref-kicker">${esc(u.territory)}${u.section ? ` · ${esc(u.section)}` : ""}</p>
      <h3 class="ref-title">${esc(u.title)}</h3>
      ${u.summary ? `<p class="ref-summary">${esc(u.summary)}</p>` : ""}
      ${sectionBlock("Pattern", u.sections?.pattern)}
      ${sectionBlock("Rule", u.sections?.rule)}
      ${examples}
      ${sectionBlock("Limitations", u.sections?.limitations)}
      ${sectionBlock("Notes", u.sections?.notes)}
      ${related ? `<section class="ref-section"><h4>Related</h4><div class="ref-related">${related}</div></section>` : ""}
      ${practice ? `<section class="ref-section"><h4>Practice</h4><ul class="ref-practice">${practice}</ul><p class="ref-note">Practice capability IDs are planned links (warnings until registered).</p></section>` : ""}
      <p class="ref-meta"><code>${esc(u.id)}</code> · ${esc(REFERENCE_VERSION)}</p>
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
      "ordinal-days": "numbers.dates",
      "full-dates": "numbers.dates",
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
    if (mode === "plurals") return "nouns.plurals";
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
