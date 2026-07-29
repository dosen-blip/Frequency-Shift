"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

function mediaMatches(query: string) {
  return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
}

export function SiteMotion() {
  const pathname = usePathname();
  const hasPlayedHero = useRef(false);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const mobileNeonElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          ".event-card",
          ".archive-card > a",
          ".home-event__visual",
          ".home-memory__grid figure",
          ".button",
          ".mobile-nav__toggle",
          ".mobile-nav__panel a",
        ].join(","),
      ),
    );
    const hero = document.querySelector<HTMLElement>(".route-hero");
    const reducedMotion = mediaMatches("(prefers-reduced-motion: reduce)");
    const coarsePointer = mediaMatches("(hover: none), (pointer: coarse)");
    const compactViewport = mediaMatches("(max-width: 760px)");
    const mobileNeon = coarsePointer || compactViewport;
    let revealObserver: IntersectionObserver | null = null;
    let mobileNeonObserver: IntersectionObserver | null = null;
    let revealFallback = 0;

    root.classList.add("motion-enabled");

    const reveal = (element: HTMLElement) => {
      element.classList.remove("is-reveal-pending");
      element.classList.add("is-revealed");
    };

    const revealAll = () => revealElements.forEach(reveal);
    const clearMobileNeon = () => {
      mobileNeonElements.forEach((element) => {
        element.classList.remove("is-mobile-neon-active");
      });
      root.classList.remove("mobile-neon-enabled");
    };

    if (mobileNeon && "IntersectionObserver" in window) {
      root.classList.add("mobile-neon-enabled");
      mobileNeonObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle(
              "is-mobile-neon-active",
              entry.isIntersecting && entry.intersectionRatio >= 0.15,
            );
          });
        },
        {
          threshold: [0.15, 0.45, 0.75],
          rootMargin: "-18% 0px -18% 0px",
        },
      );
      mobileNeonElements.forEach((element) => mobileNeonObserver?.observe(element));
    }

    if (hero) {
      const heroMotion: "full" | "quick" =
        !reducedMotion && !hasPlayedHero.current ? "full" : "quick";

      hero.setAttribute("data-hero-motion", heroMotion);
      void hero.offsetWidth;
      hero.classList.add("is-motion-ready");
      hasPlayedHero.current = true;
    }

    // Touch devices get the same visual hierarchy without scroll-bound motion.
    // This keeps the main thread free for image decoding and navigation.
    if (
      reducedMotion ||
      coarsePointer ||
      !("IntersectionObserver" in window)
    ) {
      revealAll();
      return () => {
        mobileNeonObserver?.disconnect();
        clearMobileNeon();
        revealAll();
      };
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
      mobileNeonObserver?.disconnect();
      window.clearTimeout(revealFallback);
      clearMobileNeon();
      revealAll();
    };
  }, [pathname]);

  return null;
}
