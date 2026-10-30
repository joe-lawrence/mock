/**
 * Compact German and British flags for bilingual prompts.
 * Same marks as Numbers Build / Convert.
 */
export const FLAG_DE_SVG = `<svg class="lang-flag" width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M30 0H0V20H30V0Z" fill="#D80027"/><path d="M30 0H0V6.66643H30V0Z" fill="#000"/><path d="M30 13.3329H0V19.9994H30V13.3329Z" fill="#FFDA44"/></svg>`;
export const FLAG_EN_SVG = `<svg class="lang-flag" width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M30 0.00012207H0V20H30V0.00012207Z" fill="#F0F0F0"/><path d="M16.875 0H13.125V8.1248H0V11.8747H13.125V19.9995H16.875V11.8747H30V8.1248H16.875V0Z" fill="#D80027"/><path d="M23.0742 13.4779L30.0009 17.326V13.4779H23.0742Z" fill="#0052B4"/><path d="M18.2617 13.4779L30.0009 19.9995V18.1554L21.5813 13.4779H18.2617Z" fill="#0052B4"/><path d="M26.8739 19.9995L18.2617 15.2146V19.9995H26.8739Z" fill="#0052B4"/><path d="M18.2617 13.4779L30.0009 19.9995V18.1554L21.5813 13.4779H18.2617Z" fill="#D80027"/><path d="M5.29341 13.4778L0 16.4185V13.4778H5.29341Z" fill="#0052B4"/><path d="M11.7397 14.3071V19.9995H1.49414L11.7397 14.3071Z" fill="#0052B4"/><path d="M8.41951 13.4779L0 18.1554V19.9995L11.7391 13.4779H8.41951Z" fill="#D80027"/><path d="M6.92665 6.52159L0 2.67346V6.52159H6.92665Z" fill="#0052B4"/><path d="M11.7391 6.52159L0 0V1.84414L8.41951 6.52159H11.7391Z" fill="#0052B4"/><path d="M3.12695 0L11.7392 4.78491V0H3.12695Z" fill="#0052B4"/><path d="M11.7391 6.52159L0 0V1.84414L8.41951 6.52159H11.7391Z" fill="#D80027"/><path d="M24.707 6.5217L30.0004 3.58093V6.5217H24.707Z" fill="#0052B4"/><path d="M18.2617 5.69233V0H28.5072L18.2617 5.69233Z" fill="#0052B4"/><path d="M21.5813 6.52159L30.0009 1.84414V0L18.2617 6.52159H21.5813Z" fill="#D80027"/></svg>`;

/** Flag plus phrase. `text` is already escaped. `de` is the German flag, `en` the British flag. */
export function flaggedCueHtml(lang, text) {
  if (lang === "de") {
    return `<strong class="prompt-lang prompt-de" lang="de">${FLAG_DE_SVG}<span class="prompt-lang-text">${text}</span></strong>`;
  }
  if (lang === "en") {
    return `<span class="prompt-lang prompt-en">${FLAG_EN_SVG}<span class="prompt-lang-text">${text}</span></span>`;
  }
  return text;
}
