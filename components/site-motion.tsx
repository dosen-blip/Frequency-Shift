"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

const HERO_SESSION_KEY = "frequency-shift:hero-played";

export function SiteMotion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const hero = document.querySelector<HTMLElement>(".route-hero");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let firstFrame = 0;
    let secondFrame = 0;

    root.classList.add("motion-enabled");

    const revealAll = () => {
      revealElements.forEach((element) => element.classList.add("is-revealed"));
      hero?.classList.add("is-motion-ready");
    };

    if (reducedMotion.matches) {
      hero?.setAttribute("data-hero-motion", "quick");
      revealAll();
      return;
    }

    if (hero) {
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
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => hero.classList.add("is-motion-ready"));
      });
    }

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return () => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.classList.add("is-revealed");
          observer.unobserve(element);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    revealElements.forEach((element) => observer.observe(element));

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (event.matches) revealAll();
    };
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [pathname]);

  return null;
}
