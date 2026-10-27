/**
 * Learner-facing Markdown subset for Reference and Case Learn.
 * Paragraphs, bullet lists, pipe tables, **bold**, and `German forms`.
 * Forms keep the surrounding sentence in English; the backticks are not shown.
 */

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inline span. Escapes HTML, then applies bold and German-form marks. */
export function renderInline(s) {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code class="de-form" lang="de">$1</code>')
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
    .map((c) => `<th>${renderInline(c)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

/**
 * Block renderer. Blank lines split paragraphs.
 * A block of `|` rows is a table. A block of `- ` lines is a list.
 * @param {string} text
 * @returns {string}
 */
export function renderProse(text) {
  if (!text || !String(text).trim()) return "";
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
          .map((l) => `<li>${renderInline(l)}</li>`)
          .join("");
        return `<ul class="ref-prose">${items}</ul>`;
      }
      return `<p>${renderInline(lines.join(" "))}</p>`;
    })
    .join("");
}
