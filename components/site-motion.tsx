"use client";

import { useLayoutEffect } from "react";

const HERO_SESSION_KEY = "frequency-shift:hero-played";

export function SiteMotion() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let revealObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let viewportFrame = 0;
    const revealFallbacks = new Map<HTMLElement, number>();

    root.classList.add("motion-enabled");

    const revealElement = (element: HTMLElement) => {
      const fallback = revealFallbacks.get(element);
      if (fallback) window.clearTimeout(fallback);
      revealFallbacks.delete(element);
      element.classList.remove("is-reveal-pending");
      element.classList.add("is-revealed");
    };

    const isInViewport = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect();
      return bounds.bottom >= 0 && bounds.top <= window.innerHeight;
    };

    const revealAll = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(revealElement);
      document.querySelectorAll<HTMLElement>(".route-hero").forEach((hero) => {
        hero.setAttribute("data-hero-motion", "quick");
        hero.classList.add("is-motion-ready");
      });
    };

    const prepareHero = (hero: HTMLElement) => {
      if (hero.dataset.motionManaged === "true") return;
      hero.dataset.motionManaged = "true";

      if (reducedMotion.matches) {
        hero.setAttribute("data-hero-motion", "quick");
        hero.classList.add("is-motion-ready");
        return;
      }

      let heroMotion: "full" | "quick" = "full";

      try {
        if (window.sessionStorage.getItem(HERO_SESSION_KEY)) {
          heroMotion = "quick";
        } else {
          window.sessionStorage.setItem(HERO_SESSION_KEY, "true");
        }
      } catch {
        // Storage is optional. The complete sequence remains a safe fallback.
      }

      hero.setAttribute("data-hero-motion", heroMotion);
      // Commit the hidden starting state before enabling the transition. A
      // synchronous layout read is reliable even when animation frames are
      // throttled in a backgrounded or low-power mobile tab.
      void hero.offsetWidth;
      hero.classList.add("is-motion-ready");
    };

    const prepareReveal = (element: HTMLElement) => {
      if (element.dataset.revealManaged === "true") return;
      element.dataset.revealManaged = "true";

      if (reducedMotion.matches || !revealObserver) {
        revealElement(element);
        return;
      }

      element.classList.add("is-reveal-pending");
      if (isInViewport(element)) {
        void element.offsetWidth;
        revealElement(element);
        return;
      }

      revealObserver.observe(element);
      revealFallbacks.set(
        element,
        window.setTimeout(() => {
          revealFallbacks.delete(element);
          if (isInViewport(element)) revealElement(element);
        }, 2000),
      );
    };

    const revealVisiblePending = () => {
      viewportFrame = 0;
      document.querySelectorAll<HTMLElement>(".is-reveal-pending").forEach((element) => {
        if (isInViewport(element)) revealElement(element);
      });
    };

    const handleViewportChange = () => {
      if (viewportFrame) return;
      viewportFrame = window.requestAnimationFrame(revealVisiblePending);
    };

    const scan = (scope: ParentNode) => {
      if (scope instanceof HTMLElement) {
        if (scope.matches("[data-reveal]")) prepareReveal(scope);
        if (scope.matches(".route-hero")) prepareHero(scope);
      }

      scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach(prepareReveal);
      scope.querySelectorAll<HTMLElement>(".route-hero").forEach(prepareHero);
    };

    if ("IntersectionObserver" in window && !reducedMotion.matches) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target as HTMLElement;
            revealElement(element);
            revealObserver?.unobserve(element);
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -8% 0px" },
      );
    }

    scan(document);

    // Client navigation can commit the next route after the pathname changes.
    // Watching additions keeps those late nodes managed without ever making
    // unobserved content invisible.
    mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (event.matches) revealAll();
    };
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      revealObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
      window.cancelAnimationFrame(viewportFrame);
      revealFallbacks.forEach((fallback) => window.clearTimeout(fallback));
      revealFallbacks.clear();
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return null;
}
