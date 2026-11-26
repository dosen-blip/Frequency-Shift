"use client";

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
            <Link className={className} href={stop.href} key={stop.href} aria-current={here ? "page" : deeper ? "location" : undefined}>
              {stop.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
