"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { primaryNavigation } from "@/content/site";

const DEPLOYMENT_PREFIX = "/Frequency-Shift";

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

export function SiteHeader() {
  const pathname = normalizePathname(usePathname() ?? "/");
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isMenuOpen = openMenuPath === pathname;

  useEffect(() => {
    document.documentElement.classList.add("nav-enhanced");
  }, []);

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpenMenuPath(null);
    if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
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

  useEffect(() => {
    if (!isMenuOpen) return;

    document.body.classList.add("nav-open");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("nav-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isMenuOpen]);

  const latestActive = pathname === "/events/september-4";

  return (
    <header
      className={`site-header${isScrolled ? " is-scrolled" : ""}${isMenuOpen ? " is-menu-open" : ""}`}
    >
      <Link
        className={`wordmark${pathname === "/" ? " is-active" : ""}`}
        href="/"
        aria-label="Frequency Shift home"
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <img
          className="wordmark__mark"
          src="/media/brand/fs-icon-vector.svg"
          alt=""
          width="400"
          height="400"
        />
        <img
          className="wordmark__type"
          src="/media/brand/frequency-shift-wordmark-vector.svg"
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
        href="/events/september-4"
        aria-current={latestActive ? "page" : undefined}
      >
        Next event
      </Link>
      <div className={`mobile-nav${isMenuOpen ? " is-open" : ""}`}>
        <button
          ref={menuButtonRef}
          className="mobile-nav__toggle"
          type="button"
          aria-controls="mobile-navigation-panel"
          aria-expanded={isMenuOpen}
          onClick={() => setOpenMenuPath((openPath) => (openPath === pathname ? null : pathname))}
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
        <button
          className="mobile-nav__backdrop"
          type="button"
          aria-label="Close navigation"
          aria-hidden={!isMenuOpen}
          tabIndex={-1}
          onClick={() => closeMenu(true)}
        />
        <nav
          id="mobile-navigation-panel"
          className="mobile-nav__panel"
          aria-label="Mobile navigation"
          aria-hidden={!isMenuOpen}
        >
          {primaryNavigation.map((item, index) => {
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                className={active ? "is-active" : undefined}
                href={item.href}
                key={item.href}
                aria-current={active ? "page" : undefined}
                tabIndex={isMenuOpen ? 0 : -1}
                onClick={() => closeMenu(false)}
                style={{ "--nav-index": index } as React.CSSProperties}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <details className="mobile-nav-fallback">
        <summary>Menu</summary>
        <nav className="mobile-nav-fallback__panel" aria-label="Mobile navigation fallback">
          {primaryNavigation.map((item) => {
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                className={active ? "is-active" : undefined}
                href={item.href}
                key={item.href}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/events/september-4">Next event</Link>
        </nav>
      </details>
    </header>
  );
}
