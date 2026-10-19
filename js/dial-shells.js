/**
 * Interactive dial answer shells — compass needle / clock hands (set-dial).
 */

import { RESPONSE } from "./interaction-presets.js?v=20261018-compass11";
import { prepareAnswerHost } from "./answer-shells.js?v=20261018-compass11";
import {
  COMPASS_BEARINGS,
  compassSvg,
  clockFaceSvg,
  bearingIdFromAngleDeg,
  angleDegFromPointer,
  minutesFromAngleDeg,
  hourFromAngleDeg,
  snapClockTime,
  pickClockHandFromPointer,
  syncClockHandTransforms,
} from "./quiz-extras.js?v=20261018-compass11";

/**
 * @param {SVGElement} svg
 * @param {(deg: number, ev: PointerEvent) => void} onAngle
 * @param {(ev: PointerEvent) => void} [onEnd]
 */
function bindDialPointer(svg, onAngle, onEnd) {
  if (!svg) return () => {};
  let active = false;

  const read = (ev) => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    onAngle(angleDegFromPointer(rect, ev.clientX, ev.clientY), ev);
  };

  const onDown = (ev) => {
    if (ev.button != null && ev.button !== 0) return;
    active = true;
    svg.setPointerCapture?.(ev.pointerId);
    read(ev);
    ev.preventDefault();
  };
  const onMove = (ev) => {
    if (!active) return;
    read(ev);
    ev.preventDefault();
  };
  const onUp = (ev) => {
    if (!active) return;
    active = false;
    try {
      svg.releasePointerCapture?.(ev.pointerId);
    } catch {
      /* ignore */
    }
    onEnd?.(ev);
  };

  svg.addEventListener("pointerdown", onDown);
  svg.addEventListener("pointermove", onMove);
  svg.addEventListener("pointerup", onUp);
  svg.addEventListener("pointercancel", onUp);

  return () => {
    svg.removeEventListener("pointerdown", onDown);
    svg.removeEventListener("pointermove", onMove);
    svg.removeEventListener("pointerup", onUp);
    svg.removeEventListener("pointercancel", onUp);
  };
}

/**
 * Compass dial: tap/drag to snap needle to one of 8 bearings, then Check.
 * @param {HTMLElement} host
 * @param {{
 *   value?: string|null,
 *   ariaLabel?: string,
 *   checkLabel?: string,
 *   isDisabled?: () => boolean,
 *   onChange?: (bearingId: string) => void,
 *   onSubmit: (bearingId: string|null) => void,
 * }} opts
 */
export function mountCompassDialShell(host, opts) {
  prepareAnswerHost(host, { response: RESPONSE.DIAL });
  host.classList.add("answer-shell--dial", "answer-shell--compass-dial");
  host.setAttribute("aria-label", opts.ariaLabel || "Set the compass");

  let value = opts.value || null;

  const face = document.createElement("div");
  face.className = "dial-face-host";

  const status = document.createElement("p");
  status.className = "dial-status";
  status.setAttribute("aria-live", "polite");

  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.className = "btn btn-primary answer-shell-check";
  checkBtn.textContent = opts.checkLabel || "Check";

  const paint = () => {
    face.innerHTML = compassSvg(value || "Norden", {
      interactive: true,
      selected: !!value,
    });
    const svg = face.querySelector("svg");
    if (svg) {
      svg.style.touchAction = "none";
      svg.style.cursor = "pointer";
      svg.setAttribute(
        "aria-label",
        value ? `Needle at ${value}` : "Compass — drag to set direction"
      );
      bindDialPointer(svg, (deg) => {
        if (opts.isDisabled?.()) return;
        const next = bearingIdFromAngleDeg(deg);
        if (next === value) return;
        value = next;
        opts.onChange?.(value);
        paint();
        status.textContent = value;
      });
    }
    status.textContent = value || "Drag the needle";
    checkBtn.disabled = !!opts.isDisabled?.() || !value;
  };

  checkBtn.addEventListener("click", () => {
    if (opts.isDisabled?.() || !value) return;
    opts.onSubmit(value);
  });

  host.append(face, status, checkBtn);
  paint();

  return {
    host,
    getValue: () => value,
    setValue: (id) => {
      value = id || null;
      paint();
    },
    checkBtn,
  };
}

/**
 * Clock dial: drag each hand directly (no Hours/Minutes mode toggle).
 * @param {HTMLElement} host
 * @param {{
 *   hours?: number,
 *   minutes?: number,
 *   minuteStep?: number,
 *   ariaLabel?: string,
 *   checkLabel?: string,
 *   isDisabled?: () => boolean,
 *   onChange?: (t: { hours: number, minutes: number }) => void,
 *   onSubmit: (t: { hours: number, minutes: number }) => void,
 * }} opts
 */
export function mountClockDialShell(host, opts) {
  prepareAnswerHost(host, { response: RESPONSE.DIAL });
  host.classList.add("answer-shell--dial", "answer-shell--clock-dial");
  host.setAttribute("aria-label", opts.ariaLabel || "Set the clock");

  const minuteStep = opts.minuteStep ?? 5;
  let hours =
    opts.hours != null ? opts.hours : 12;
  let minutes =
    opts.minutes != null ? opts.minutes : 0;
  ({ hours, minutes } = snapClockTime(hours, minutes, minuteStep));

  /** @type {"minute"|"hour"|null} */
  let dragTarget = null;
  /** @type {(() => void)|null} */
  let unbind = null;

  const face = document.createElement("div");
  face.className = "dial-face-host";

  const status = document.createElement("p");
  status.className = "dial-status";
  status.setAttribute("aria-live", "polite");

  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.className = "btn btn-primary answer-shell-check";
  checkBtn.textContent = opts.checkLabel || "Check";

  const formatStatus = () => {
    const hh = String(hours % 24).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const applyHands = (svg) => {
    syncClockHandTransforms(svg, hours, minutes, { dragTarget });
    status.textContent = formatStatus();
    svg?.setAttribute("aria-label", `Clock set to ${formatStatus()}`);
    checkBtn.disabled = !!opts.isDisabled?.();
  };

  const paint = () => {
    unbind?.();
    unbind = null;
    dragTarget = null;
    face.innerHTML = clockFaceSvg(hours, minutes, { interactive: true });
    const svg = face.querySelector("svg");
    if (svg) {
      svg.style.touchAction = "none";
      svg.style.cursor = "grab";
      applyHands(svg);
      unbind = bindDialPointer(
        svg,
        (deg, ev) => {
          if (opts.isDisabled?.()) return;
          if (!dragTarget) {
            const rect = svg.getBoundingClientRect();
            dragTarget = pickClockHandFromPointer(
              rect,
              ev.clientX,
              ev.clientY,
              hours,
              minutes
            );
            svg.style.cursor = "grabbing";
          }
          if (dragTarget === "minute") {
            minutes = minutesFromAngleDeg(deg, minuteStep);
          } else {
            const h12 = hourFromAngleDeg(deg, minutes);
            // Preserve am/pm bucket from current hours.
            if (hours >= 12) {
              hours = h12 === 0 ? 12 : h12 + 12;
              if (hours === 24) hours = 12;
            } else {
              hours = h12 % 12;
            }
          }
          ({ hours, minutes } = snapClockTime(hours, minutes, minuteStep));
          applyHands(svg);
          opts.onChange?.({ hours, minutes });
        },
        () => {
          dragTarget = null;
          svg.style.cursor = "grab";
          applyHands(svg);
        }
      );
    } else {
      status.textContent = formatStatus();
      checkBtn.disabled = !!opts.isDisabled?.();
    }
  };

  checkBtn.addEventListener("click", () => {
    if (opts.isDisabled?.()) return;
    opts.onSubmit({ hours, minutes });
  });

  host.append(face, status, checkBtn);
  paint();

  return {
    host,
    getValue: () => ({ hours, minutes }),
    setValue: (t) => {
      ({ hours, minutes } = snapClockTime(
        t?.hours ?? hours,
        t?.minutes ?? minutes,
        minuteStep
      ));
      paint();
    },
    checkBtn,
  };
}

export { COMPASS_BEARINGS, bearingIdFromAngleDeg, snapClockTime };
