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
// Each stop is a small neon icon, the same piece of neon that page hangs on the room's wall (rooms.ts): fast-forward
// for Events, rewind for the archive, the shifting wave for About, a signal going out for Contact, and a house for
// home. The page you are at is lit in its room's colour; the page's name is there for screen readers.

const ICONS: Record<string, ReactNode> = {
  "/": <path d="M3.5 11.5 12 4.5l8.5 7M6.5 9.5v10h11v-10" />,
  "/events": <path d="M2.5 7v10l5.5-5zM9.5 7v10l5.5-5zM16.5 7v10l5.5-5z" />,
  "/archive": <path d="M21.5 7v10L16 12zM14.5 7v10L9 12zM7.5 7v10L2 12z" />,
  "/about": (
    <path d="M2 12 2.5 11.7 3 11.2 3.5 10.6 4 9.8 4.5 9 5 8.2 5.5 7.5 6 6.9 6.5 6.5 7 6.5 7.5 6.9 8 7.7 8.5 8.9 9 10.5 9.5 12.4 10 14.4 10.5 16.2 11 17.6 11.5 18.4 12 18.4 12.5 17.4 13 15.6 13.5 13.2 14 10.5 14.5 8.1 15 6.4 15.5 5.9 16 6.7 16.5 8.7 17 11.4 17.5 14.1 18 16.2 18.5 17 19 16.3 19.5 14.4 20 12 20.5 10 21 9.1 21.5 9.7 22 12" />
  ),
  "/contact": (
    <>
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <path d="M15.2 9.95a3.8 3.8 0 0 1 0 4.1M8.8 14.05a3.8 3.8 0 0 1 0-4.1M18.07 8.52a7 7 0 0 1 0 6.96M5.93 15.48a7 7 0 0 1 0-6.96M21.09 7.38a10.2 10.2 0 0 1 0 9.24M2.91 16.62a10.2 10.2 0 0 1 0-9.24" />
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
