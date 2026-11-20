/**
 * Learner-facing Markdown subset for Reference and Case Learn.
 * Paragraphs, ### subheads, lists (ul/ol), blockquotes, pipe tables,
 * **bold**, *italics*, `German forms`, [label](unit.id) links, and [TAG: text] pills.
 * Forms keep the surrounding sentence in English; the backticks are not shown.
 */

const PILL_TAGS = new Set(["M", "F", "N", "NOM", "ACC", "DAT"]);

const PILL_META = {
  M: { cls: "ref-pill ref-pill-m g-masc", label: "Masculine" },
  F: { cls: "ref-pill ref-pill-f g-fem", label: "Feminine" },
  N: { cls: "ref-pill ref-pill-n g-neut", label: "Neuter" },
  NOM: { cls: "ref-pill ref-pill-nom", label: "Nominative" },
  ACC: { cls: "ref-pill ref-pill-acc", label: "Accusative" },
  DAT: { cls: "ref-pill ref-pill-dat", label: "Dative" },
};

/** Reference unit id: territory.rest (digits and hyphens allowed). */
const UNIT_ID_RE = /^[a-z]+\.[a-z0-9][a-z0-9._-]*$/i;

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Collect `[label](targetId)` targets from prose (for build validation).
 * Skips http(s) URLs; those are reported separately by the caller if needed.
 * @param {string} text
 * @returns {{ label: string, id: string, external: boolean }[]}
 */
export function extractMarkdownLinks(text) {
  const out = [];
  const src = String(text || "");
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(src))) {
    const label = m[1].trim();
    const target = m[2].trim();
    const external = /^https?:\/\//i.test(target);
    out.push({ label, id: target, external });
  }
  return out;
}

function pillHtml(tag, text) {
  const meta = PILL_META[tag];
  if (!meta) return null;
  return `<span class="${meta.cls}" title="${escapeHtml(meta.label)}" aria-label="${escapeHtml(
    `${meta.label}: ${text}`
  )}"><span class="ref-pill-tag" aria-hidden="true">${escapeHtml(tag)}</span> ${escapeHtml(
    text
  )}</span>`;
}

function linkHtml(label, target) {
  if (/^https?:\/\//i.test(target)) {
    return escapeHtml(`[${label}](${target})`);
  }
  if (!UNIT_ID_RE.test(target)) {
    return escapeHtml(`[${label}](${target})`);
  }
  return `<button type="button" class="ref-link" data-ref-id="${escapeHtml(
    target
  )}">${escapeHtml(label)}</button>`;
}

/**
 * Mapping arrow (e.g. `Hunde → Hunden`). Keep U+2192; `.ref-arrow`
 * switches off Sora onto a face with a clearer arrow glyph.
 */
const ARROW_HTML = '<span class="ref-arrow" aria-hidden="true">→</span>';

function decorateArrows(html) {
  return String(html || "").replace(/→|⟶/g, ARROW_HTML);
}

/**
 * Escape plain text, then apply **bold** and *italics* (no _underscores_).
 * @param {string} text already unescaped source fragment
 */
function formatEmphasis(text) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return decorateArrows(out);
}

/**
 * Inline span: pills, links, German forms, bold, italics.
 * Does not parse _underscores_. Leading `*` list markers are handled at block level.
 */
export function renderInline(s) {
  const raw = String(s ?? "");
  if (!raw) return "";

  // Tokenize special spans on the raw string so escaping stays single-pass.
  const tokenRe =
    /\[(M|F|N|NOM|ACC|DAT):\s*([^\]]+)\]|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = tokenRe.exec(raw))) {
    out += formatEmphasis(raw.slice(last, m.index));
    if (m[1]) {
      out += pillHtml(m[1], m[2].trim()) || formatEmphasis(m[0]);
    } else if (m[3] != null) {
      out += linkHtml(m[3], m[4].trim());
    } else if (m[5] != null) {
      out += `<code class="de-form" lang="de">${decorateArrows(escapeHtml(m[5]))}</code>`;
    }
    last = m.index + m[0].length;
  }
  out += formatEmphasis(raw.slice(last));
  return out;
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
    .map((c) => `<th>${renderInline(c)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function isBlank(line) {
  return !String(line || "").trim();
}

function isOlLine(line) {
  return /^\d+\.\s+/.test(line);
}

function isUlLine(line) {
  return /^\s*[-*]\s+/.test(line);
}

function isQuoteLine(line) {
  return /^>\s?/.test(line) || line === ">";
}

function isTableLine(line) {
  return line.trim().startsWith("|");
}

function isSubhead(line) {
  return /^###\s+\S/.test(line);
}

function isBlockStart(line) {
  return (
    isBlank(line) ||
    isSubhead(line) ||
    isOlLine(line) ||
    isUlLine(line) ||
    isQuoteLine(line) ||
    isTableLine(line)
  );
}

/**
 * Block renderer for section bodies.
 * @param {string} text
 * @returns {string}
 */
export function renderProse(text) {
  if (!text || !String(text).trim()) return "";
  const lines = String(text).replace(/\r\n/g, "\n").trim().split("\n");
  const parts = [];
  let i = 0;

  while (i < lines.length) {
    if (isBlank(lines[i])) {
      i += 1;
      continue;
    }

    if (isSubhead(lines[i])) {
      const title = lines[i].replace(/^###\s+/, "").trim();
      parts.push(`<h3 class="ref-subhead">${renderInline(title)}</h3>`);
      i += 1;
      continue;
    }

    if (isQuoteLine(lines[i])) {
      const chunk = [];
      while (i < lines.length && isQuoteLine(lines[i])) {
        chunk.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      const inner = chunk.join("\n").trim();
      parts.push(
        `<blockquote class="ref-callout">${renderProse(inner) || `<p>${renderInline(inner)}</p>`}</blockquote>`
      );
      continue;
    }

    if (isOlLine(lines[i])) {
      const items = [];
      while (i < lines.length && isOlLine(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      parts.push(
        `<ol class="ref-prose">${items
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join("")}</ol>`
      );
      continue;
    }

    if (isUlLine(lines[i])) {
      const items = [];
      while (i < lines.length && isUlLine(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      parts.push(
        `<ul class="ref-prose">${items
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join("")}</ul>`
      );
      continue;
    }

    if (isTableLine(lines[i])) {
      const chunk = [];
      while (i < lines.length && isTableLine(lines[i])) {
        chunk.push(lines[i]);
        i += 1;
      }
      parts.push(tableHtml(chunk));
      continue;
    }

    const chunk = [];
    while (i < lines.length && !isBlockStart(lines[i])) {
      chunk.push(lines[i]);
      i += 1;
    }
    if (chunk.length) {
      parts.push(`<p>${renderInline(chunk.join(" "))}</p>`);
    }
  }

  return parts.filter(Boolean).join("");
}

export { PILL_TAGS, UNIT_ID_RE };
