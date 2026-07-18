"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

const HERO_SESSION_KEY = "frequency-shift:hero-played";

function mediaMatches(query: string) {
  return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
}

export function SiteMotion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const hero = document.querySelector<HTMLElement>(".route-hero");
    const reducedMotion = mediaMatches("(prefers-reduced-motion: reduce)");
    const coarsePointer = mediaMatches("(hover: none), (pointer: coarse)");
    let revealObserver: IntersectionObserver | null = null;
    let revealFallback = 0;

    root.classList.add("motion-enabled");

    const reveal = (element: HTMLElement) => {
      element.classList.remove("is-reveal-pending");
      element.classList.add("is-revealed");
    };

    const revealAll = () => revealElements.forEach(reveal);

    if (hero) {
      let heroMotion: "full" | "quick" = "quick";

      if (!reducedMotion) {
        try {
          if (!window.sessionStorage.getItem(HERO_SESSION_KEY)) {
            heroMotion = "full";
            window.sessionStorage.setItem(HERO_SESSION_KEY, "true");
          }
        } catch {
          // Storage is optional; the quick, visible state is the safest fallback.
        }
      }

      hero.setAttribute("data-hero-motion", heroMotion);
      void hero.offsetWidth;
      hero.classList.add("is-motion-ready");
    }

    // Touch devices get the same visual hierarchy without scroll-bound motion.
    // This keeps the main thread free for image decoding and navigation.
    if (
      reducedMotion ||
      coarsePointer ||
      !("IntersectionObserver" in window)
    ) {
      revealAll();
      return;
    }

    // Arm the fail-open path before constructing optional browser APIs.
    revealFallback = window.setTimeout(revealAll, 1400);

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          reveal(element);
          revealObserver?.unobserve(element);
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" },
    );

    revealElements.forEach((element) => {
      if (element.classList.contains("is-revealed")) return;
      element.classList.add("is-reveal-pending");
      revealObserver?.observe(element);
    });

    // Motion is enhancement only. A delayed or throttled observer can never
    // leave content hidden.
    return () => {
      revealObserver?.disconnect();
      window.clearTimeout(revealFallback);
      revealAll();
    };
  }, [pathname]);

  return null;
}
