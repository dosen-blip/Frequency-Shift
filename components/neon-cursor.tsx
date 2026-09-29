"use client";

import { useEffect } from "react";

const INTERACTIVE_TARGETS = 'a, button, summary, label, video, [role="button"]';
const CURSOR_MARKUP =
  '<div class="neon-cursor__ring">' +
  ["ambient", "bloom", "core", "face"]
    .map((layer) => `<span class="neon-cursor__layer neon-cursor__layer--${layer}"></span>`)
    .join("") +
  '</div><div class="neon-cursor__dot"></div>';

// Replaces the mouse pointer with a neon tube ring built from the hero sign's
// glow stack. Mouse-only, and the native cursor stays until the first real
// mouse movement. Mirrored by prepareNeonCursor in public/static-pages.js.
export function NeonCursor() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = document.documentElement;
    const cursor = document.createElement("div");
    cursor.className = "neon-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = CURSOR_MARKUP;
    document.body.appendChild(cursor);
    const ring = cursor.firstElementChild as HTMLElement;
    const dot = cursor.lastElementChild as HTMLElement;
    let hovered: Element | null = null;
    let strikeTimer = 0;

    const hide = () => {
      root.classList.remove("has-neon-cursor");
      cursor.classList.remove("is-visible", "is-hovering", "is-pressed");
      hovered = null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        hide();
        return;
      }
      dot.style.transform = ring.style.transform =
        `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      root.classList.add("has-neon-cursor");
      cursor.classList.add("is-visible", "is-igniting");

      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE_TARGETS) : null;
      if (target === hovered) return;
      hovered = target;
      cursor.classList.toggle("is-hovering", Boolean(target));
      if (!target) return;
      window.clearTimeout(strikeTimer);
      cursor.classList.remove("is-striking");
      void cursor.offsetWidth;
      cursor.classList.add("is-striking");
      strikeTimer = window.setTimeout(() => cursor.classList.remove("is-striking"), 820);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") cursor.classList.add("is-pressed");
    };
    const handlePointerUp = () => cursor.classList.remove("is-pressed");

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    root.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      root.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      window.clearTimeout(strikeTimer);
      root.classList.remove("has-neon-cursor");
      cursor.remove();
    };
  }, []);

  return null;
}
