"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNavigation } from "@/content/site";
import { getNextEvent } from "@/content/events";

const DEPLOYMENT_PREFIX = "/Frequency-Shift";
const nextEvent = getNextEvent();
const nextEventHref = nextEvent ? `/events/${nextEvent.slug}` : "/events";

function normalizePathname(pathname: string) {
  let normalized = pathname || "/";
  if (normalized === DEPLOYMENT_PREFIX) normalized = "/";
  if (normalized.startsWith(`${DEPLOYMENT_PREFIX}/`)) {
    normalized = normalized.slice(DEPLOYMENT_PREFIX.length);
  }
  if (normalized.length > 1) normalized = normalized.replace(/\/+$/, "");
  return normalized || "/";
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// On a phone the header is the wordmark and the next event; the pages are in the dock along the bottom of the
// screen (components/site-dock.tsx).
export function SiteHeader() {
  const pathname = normalizePathname(usePathname() ?? "/");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("nav-enhanced");
  }, []);

  useEffect(() => {
    let scrollFrame = 0;
    const commitScrollState = () => {
      scrollFrame = 0;
      const nextState = window.scrollY > 24;
      setIsScrolled((currentState) => currentState === nextState ? currentState : nextState);
    };
    const updateScrollState = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(commitScrollState);
    };
    commitScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.cancelAnimationFrame(scrollFrame);
    };
  }, []);

  const latestActive = pathname === nextEventHref;

  return (
    <header
      className={`site-header${isScrolled ? " is-scrolled" : ""}`}
    >
      <Link
        className={`wordmark${pathname === "/" ? " is-active" : ""}`}
        href="/"
        aria-label="Frequency Shift home"
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <img
          className="wordmark__mark"
          src="/media/brand/fs-icon-neon.svg"
          alt=""
          width="400"
          height="400"
        />
        <img
          className="wordmark__type"
          src="/media/brand/frequency-shift-wordmark-neon.svg"
          alt=""
          width="1456"
          height="103"
        />
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {primaryNavigation.map((item) => (
          <Link
            className={isRouteActive(pathname, item.href) ? "is-active" : undefined}
            href={item.href}
            key={item.href}
            aria-current={isRouteActive(pathname, item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Link
        className={`header-cta${latestActive ? " is-active" : ""}`}
        href={nextEventHref}
        aria-current={latestActive ? "page" : undefined}
      >
        Next event
      </Link>
    </header>
  );
}
