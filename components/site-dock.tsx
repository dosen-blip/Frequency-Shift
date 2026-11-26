"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation } from "@/content/site";

// The phone's navigation: a dock along the bottom of the screen, in thumb's reach, laid out like the room's wall.
// The pages hang side by side along the wall in this same order (see components/laser-room/travel.ts), so the dock
// is a map of it: a rail with a stop for each page, and the stop you are at lit. Going to another page, the camera
// travels along the wall to it and the light runs along the rail with it; a swipe along the dock goes to the page
// beside this one. A page deeper in a section (a night, an event) lights its section's stop, with a mark to its
// right, the way its bay hangs to the right of the section's own.
//
// Plain links: without the room, or without scripts, it is an ordinary menu that is always there.
//
// Each stop is a plain, familiar icon drawn as a line of neon: a house, a calendar for events, a Polaroid for the
// archive's photographs, an "i" for About and an envelope for Contact. The page you are at is lit in its room's
// colour; the page's name is there for screen readers.

const ICONS: Record<string, ReactNode> = {
  "/": <path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5" />,
  "/events": (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  "/archive": (
    <g transform="rotate(-7 12 12)">
      <rect x="4.5" y="2.5" width="15" height="19" rx="1.5" />
      <rect x="7" y="5" width="10" height="10.5" rx="0.5" />
    </g>
  ),
  "/about": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.9" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  "/contact": (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6.5L20.5 7" />
    </>
  ),
};

const DEPLOYMENT_PREFIX = "/Frequency-Shift";
const STOPS = [{ label: "Home", href: "/" }, ...primaryNavigation] as const;

function normalizePathname(pathname: string) {
  let normalized = pathname || "/";
  if (normalized === DEPLOYMENT_PREFIX) normalized = "/";
  if (normalized.startsWith(`${DEPLOYMENT_PREFIX}/`)) normalized = normalized.slice(DEPLOYMENT_PREFIX.length);
  if (normalized.length > 1) normalized = normalized.replace(/\/+$/, "");
  return normalized || "/";
}

export function SiteDock() {
  const pathname = normalizePathname(usePathname() ?? "/");
  return (
    <nav className="dock" aria-label="Pages">
      <div className="dock__rail">
        {STOPS.map((stop) => {
          const here = stop.href === "/" ? pathname === "/" : pathname === stop.href;
          const deeper = stop.href !== "/" && pathname.startsWith(`${stop.href}/`);
          const className = here || deeper ? `is-active${deeper ? " is-deep" : ""}` : undefined;
          return (
            <Link
              className={className}
              href={stop.href}
              key={stop.href}
              data-stop={stop.href === "/" ? "home" : stop.href.slice(1)}
              aria-current={here ? "page" : deeper ? "location" : undefined}
            >
              <svg className="dock__icon" viewBox="0 0 24 24" aria-hidden="true">
                {ICONS[stop.href]}
              </svg>
              <span className="sr-only">{stop.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
