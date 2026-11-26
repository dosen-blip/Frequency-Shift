import type { PageBay } from "./mount";
import { PAN_EASE, PAN_MS } from "./pan";
import { ROOMS, roomLayout, type RoomName } from "./rooms";
import type { LaserRoom } from "./scene";

// One room, the whole site through. The pages hang side by side along the room's wall, each in a bay of its own
// with its own neon (see scene.ts), in the order the header lists them: the home page first, then Events and each
// event, the Archive and each night, About and the artists, Contact, and the small print. Following a link to
// another page does not load a new document. The next page is fetched and put in place of this one, the room stays
// alive, and the camera travels along the wall to the next page's bay, the page's words sliding with it, while the
// page being left slides off the other side, held as it was. Back and forward travel the other way. The show plays
// on through it all, on the beat.
//
// After the Instinct site's pan (~/Documents/INSTINCT 2/world/transitions.js, lab/TRANSITIONS.md).
//
// Only on the static site (which ships no React: the development server's pages are React's, and it changes them
// itself), never with reduced motion. On a phone the dock along the bottom of the screen is the way round
// (components/site-dock.tsx): a map of the wall, whose light runs along it with the camera, and a swipe along it
// goes to the page beside this one. Anything this can't do (a page it can't fetch, or that has no room) is an
// ordinary page load.

/** the site's sections, left to right along the wall; each section's own pages follow it */
const WALL = ["", "events", "archive", "about", "artists", "contact", "privacy", "terms"];

type Ctx = {
  scene: LaserRoom;
  base: string;
  first: PageBay;
  bayOf: (stage: HTMLElement) => PageBay;
  signal?: AbortSignal;
};

/** where an entry in the history hangs on the wall (in bays from where this visit started) and how far down it was */
type Entry = { fsCol: number; fsScroll: number };

export function installTravel({ scene, base, first, bayOf, signal }: Ctx) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.documentElement;
  const prefix = `${base}/`;

  // ------------------------------------------------------------------ the wall's order
  const placeOf = (path: string) => {
    const parts = path.slice(prefix.length).split("/").filter(Boolean);
    const i = WALL.indexOf(parts[0] ?? "");
    return { section: i < 0 ? WALL.length : i, deep: parts.slice(1).join("/") };
  };
  /** which way the camera goes from one page to another: right (1) to a page further along the wall */
  const towards = (from: string, to: string): 1 | -1 => {
    const a = placeOf(from);
    const b = placeOf(to);
    if (a.section !== b.section) return b.section > a.section ? 1 : -1;
    // a section's own page comes before its pages, and those follow one another in turn
    if (!a.deep !== !b.deep) return b.deep ? 1 : -1;
    return b.deep < a.deep ? -1 : 1;
  };

  // ------------------------------------------------------------------ where this visit is
  const state = (): Partial<Entry> => (history.state && typeof history.state === "object" ? history.state : {});
  const here = { path: location.pathname, bay: first, col: typeof state().fsCol === "number" ? state().fsCol! : 0 };
  history.replaceState({ ...state(), fsCol: here.col, fsScroll: scrollY }, "");
  let saveTimer = 0;
  const onScroll = () => {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      if (phase === "idle" && location.pathname === here.path) history.replaceState({ ...state(), fsScroll: scrollY }, "");
    }, 150);
  };

  // ------------------------------------------------------------------ the pages, fetched
  const docs = new Map<string, Promise<Document | null>>();
  function load(url: URL) {
    const key = url.pathname;
    let doc = docs.get(key);
    if (!doc) {
      doc = fetch(url.href, { credentials: "same-origin" })
        .then((r) => (r.ok ? r.text() : null))
        .then((text) => (text ? new DOMParser().parseFromString(text, "text/html") : null))
        .catch(() => null);
      docs.set(key, doc);
      doc.then((d) => {
        if (!d) docs.delete(key);
      });
    }
    return doc;
  }
  /** a link this can travel to, or null for an ordinary one */
  function travelTo(a: HTMLAnchorElement): URL | null {
    if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return null;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith(prefix)) return null;
    // a file (a poster, a film), not a page
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith(".html")) return null;
    // this page itself (a link to a part of it, or to where you are)
    if (url.pathname === location.pathname) return null;
    return url;
  }
  /**
   * Getting a page ready is a fetch, a parse, its first photos and its room's sign built: the last is tens of
   * milliseconds of the page's own time. So the pages are got ready one at a time, each when the page is idle, never
   * during the home page's launch; one the pointer is on (or that has the focus) goes to the front.
   */
  const fetchedPhotos = new Set<string>();
  const warmed = new Set<string>();
  const queue: URL[] = [];
  let warming = false;
  const idle = (fn: () => void, soon: boolean) => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: soon ? 150 : 2000 });
    else window.setTimeout(fn, soon ? 0 : 200);
  };
  function warm(url: URL, soon = false) {
    if (warmed.has(url.pathname)) return;
    const at = queue.findIndex((q) => q.pathname === url.pathname);
    if (at >= 0) queue.splice(at, 1);
    if (soon) queue.unshift(url);
    else queue.push(url);
    pump(soon);
  }
  function pump(soon = false) {
    if (warming || !queue.length || signal?.aborted) return;
    if (root.classList.contains("is-launching")) {
      window.setTimeout(() => pump(soon), 400);
      return;
    }
    warming = true;
    idle(() => {
      const url = queue.shift();
      if (!url) {
        warming = false;
        return;
      }
      warmed.add(url.pathname);
      warmNow(url).finally(() => {
        warming = false;
        pump();
      });
    }, soon);
  }
  function warmNow(url: URL) {
    return load(url).then((doc) => {
      // the photos at the top of the page, fetched now (the size this screen will ask for), so they are only
      // to be decoded when the page is put in place, not still arriving while it slides in
      if (doc && !fetchedPhotos.has(url.pathname)) {
        fetchedPhotos.add(url.pathname);
        doc.querySelectorAll<HTMLImageElement>("main img").forEach((img, i) => {
          if (i >= 8) return;
          const probe = new Image();
          if (img.sizes) probe.sizes = img.sizes;
          if (img.srcset) probe.srcset = img.getAttribute("srcset")!;
          probe.src = img.getAttribute("src") ?? "";
        });
      }
      const name = doc?.querySelector("main [data-laser-stage]")?.getAttribute("data-room") as RoomName | null;
      const room = name ? ROOMS[name] : undefined;
      // (the home page's sign is laid out from its page, so it can only be built once that is in place)
      if (room) return scene.preload(`room:${name}`, () => roomLayout(room, 240 * room.aspect, 240));
    });
  }

  // ------------------------------------------------------------------ the move
  type Phase = "idle" | "preparing" | "moving";
  let phase: Phase = "idle";
  let pending: { url: URL; push: boolean; scroll: number; col?: number } | null = null;
  let running: { end(): void } | null = null;

  async function go(url: URL, { push, scroll, col }: { push: boolean; scroll: number; col?: number }) {
    if (phase === "preparing") {
      pending = { url, push, scroll, col };
      return;
    }
    running?.end();
    phase = "preparing";
    const doc = await load(url);
    const nextMain = doc?.querySelector<HTMLElement>("main#main-content");
    const oldMain = document.querySelector<HTMLElement>("main#main-content");
    const stage = nextMain?.querySelector<HTMLElement>("[data-laser-stage]");
    if (!doc || !nextMain || !oldMain || !stage || signal?.aborted) {
      phase = "idle";
      if (push) location.assign(url.href);
      else location.reload();
      return;
    }
    const dir = col !== undefined && col !== here.col ? (Math.sign(col - here.col) as 1 | -1) : towards(here.path, url.pathname);
    const toCol = col ?? here.col + dir;

    // where this page was, so going back comes back to it
    history.replaceState({ ...state(), fsCol: here.col, fsScroll: scrollY }, "");
    if (push) history.pushState({ fsCol: toCol, fsScroll: 0 } satisfies Entry, "", url.href);
    history.scrollRestoration = "manual";

    // The page being left is held where it is, as it is: its content moved (not copied, so its photos stay
    // decoded) into a layer fixed to the screen, its footer copied beside it if it shows.
    const footer = document.querySelector<HTMLElement>(".site-footer");
    const held = hold(oldMain, footer);
    // the next page takes its place, out of sight until the camera sets off for it
    const main = document.importNode(nextMain, true);
    main.querySelectorAll("script").forEach((s) => s.remove());
    enliven(main);
    main.style.visibility = "hidden";
    if (footer) footer.style.visibility = "hidden";
    document.body.insertBefore(main, footer ?? held);
    scrollTo({ top: scroll, behavior: "instant" });
    document.title = doc.title;
    const dockFrom = dockLight();
    markHeader(doc);
    const dockTo = dockLight();

    const next = bayOf(main.querySelector<HTMLElement>("[data-laser-stage]")!);
    // the room makes the next page's bay ready (its sign built, placed where the page puts it), and the photos
    // the next page shows first are decoded, so neither costs a frame of the move
    const ready = Promise.all([scene.prepare(next.init, dir), decodeFirst(main)]);
    const shares = await Promise.race([ready.then(([s]) => s), wait(2500).then(() => null)]);
    if (!shares || signal?.aborted) {
      // it couldn't be made ready: the page as an ordinary load instead
      location.replace(url.href);
      return;
    }

    // The next page is shown where the move starts it, just off the screen, and a couple of frames go by before
    // the move does: the browser draws it (and the room its smaller frame) while nothing is moving yet, not in the
    // move's first frame.
    const vw = innerWidth;
    const startAt = `translate3d(${dir * vw * shares[1]}px, 0, 0)`;
    for (const el of [main, footer]) {
      if (!el) continue;
      el.style.transform = startAt;
      el.style.visibility = "";
    }
    root.classList.add("is-travelling");
    await Promise.race([frames(2), wait(120)]);

    // ------------------------------------------------------------------ off
    phase = "moving";
    const leaving = here.bay;
    here.path = url.pathname;
    here.bay = next;
    here.col = toCol;
    next.enter();
    const roomName = stage.getAttribute("data-room") || "home";
    root.setAttribute("data-room", roomName);
    const t0 = (document.timeline.currentTime as number | null) ?? performance.now();
    const timing: KeyframeAnimationOptions = { duration: PAN_MS, easing: PAN_EASE, fill: "both" };
    const slide = (el: Element, from: number, to: number) => {
      const a = el.animate({ transform: [`translate3d(${from}px, 0, 0)`, `translate3d(${to}px, 0, 0)`] }, timing);
      a.startTime = t0;
      return a;
    };
    const anims = [slide(held, 0, -dir * vw * shares[0]), slide(main, dir * vw * shares[1], 0)];
    if (footer) anims.push(slide(footer, dir * vw * shares[1], 0));
    anims.push(...runDock(dockFrom, dockTo, t0));
    const travelled = scene.travel(t0, PAN_MS);

    let ended = false;
    const end = () => {
      if (ended) return;
      ended = true;
      running = null;
      anims.forEach((a) => a.cancel());
      main.style.transform = "";
      if (footer) footer.style.transform = "";
      scene.settle();
      held.remove();
      leaving.leave();
      root.classList.remove("is-travelling");
      phase = "idle";
      next.arrived(scene);
      // keyboard and screen reader users start at the new page's heading
      const heading = main.querySelector<HTMLElement>("h1");
      if (heading && !main.contains(document.activeElement)) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    };
    running = { end };
    Promise.all([...anims.map((a) => a.finished), travelled]).then(end, end);
    // debugging: `__travelHold = 0.4` holds the next move at 40% of its time; `__travelRelease()` lets it arrive
    const debug = window as unknown as { __travelHold?: number; __travelRelease?: () => void };
    if (typeof debug.__travelHold === "number") {
      const u = debug.__travelHold;
      anims.forEach((a) => {
        a.pause();
        a.currentTime = u * PAN_MS;
      });
      scene.holdTravel(u);
      debug.__travelRelease = end;
    }

    // a link followed while this one was being made ready: on to it at once
    if (pending) {
      const p = pending;
      pending = null;
      end();
      go(p.url, p);
    }
  }

  /** the page being left, in a layer of its own that stays where it is on the screen */
  function hold(main: HTMLElement, footer: HTMLElement | null) {
    const layer = document.createElement("div");
    layer.className = "page-held";
    layer.setAttribute("aria-hidden", "true");
    layer.inert = true;
    const put = (el: HTMLElement, r: DOMRect) => {
      Object.assign(el.style, { position: "absolute", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, margin: "0" });
      layer.append(el);
    };
    const mr = main.getBoundingClientRect();
    const fr = footer?.getBoundingClientRect();
    main.removeAttribute("id");
    put(main, mr);
    if (footer && fr && fr.top < innerHeight && fr.bottom > 0) put(footer.cloneNode(true) as HTMLElement, fr);
    document.body.append(layer);
    return layer;
  }

  // ------------------------------------------------------------------ the dock (phones)
  // Where the dock's light is: over the stop of the page you are at, a little to the right of it on a page deeper
  // in its section, and off the right end of the rail on the small print (whose bays are further along the wall).
  function dockLight(): number | null {
    const rail = document.querySelector<HTMLElement>(".dock__rail");
    if (!rail || !rail.offsetWidth) return null;
    const stop = rail.querySelector<HTMLElement>("a.is-active");
    if (!stop) return rail.offsetWidth + 24;
    return stop.offsetLeft + stop.offsetWidth / 2 + (stop.classList.contains("is-deep") ? 0.35 * 16 + 12 : 0);
  }
  /** the light runs along the rail with the camera, stretching with its speed, as the room smears */
  function runDock(from: number | null, to: number | null, t0: number): Animation[] {
    const rail = document.querySelector<HTMLElement>(".dock__rail");
    if (!rail || from === null || to === null || from === to) return [];
    let beam = rail.querySelector<HTMLElement>(".dock__beam");
    if (!beam) {
      beam = document.createElement("span");
      beam.className = "dock__beam";
      beam.setAttribute("aria-hidden", "true");
      rail.append(beam);
    }
    const half = 19; // half the light's width (2.4rem)
    const move = beam.animate(
      // (`translate`, not `transform`: the streak's `scale` would scale a transform's move with it)
      { translate: [`${from - half}px 0`, `${to - half}px 0`] },
      { duration: PAN_MS, easing: PAN_EASE, fill: "both" },
    );
    const streak = beam.animate(
      [{ scale: "1 1" }, { scale: `${2.6} 0.7`, offset: 0.4 }, { scale: "1 1" }],
      { duration: PAN_MS, easing: "ease-in-out", fill: "both" },
    );
    move.startTime = streak.startTime = t0;
    return [move, streak];
  }
  /** a swipe along the dock: to the page beside this one, the way the finger pushes the wall */
  let swipe: { x: number; y: number; id: number } | null = null;
  let swiped = false;
  const onDockDown = (e: PointerEvent) => {
    swipe = (e.target as Element).closest?.(".dock") ? { x: e.clientX, y: e.clientY, id: e.pointerId } : null;
    swiped = false;
  };
  const onDockUp = (e: PointerEvent) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    const stops = [...document.querySelectorAll<HTMLAnchorElement>(".dock a")];
    const at = stops.findIndex((a) => a.classList.contains("is-active"));
    const deep = at >= 0 && stops[at].classList.contains("is-deep");
    // where you are along the rail: off its end on the small print, half a step past a section's stop deeper in it
    const place = at < 0 ? stops.length : at + (deep ? 0.5 : 0);
    // the finger pushing left brings the next page in from the right
    const target = dx < 0 ? Math.floor(place) + 1 : Math.ceil(place) - 1;
    const stop = stops[Math.max(0, Math.min(stops.length - 1, target))];
    if (!stop || (stop.classList.contains("is-active") && !deep)) return;
    swiped = true;
    window.setTimeout(() => (swiped = false), 500);
    stop.click();
  };
  const onDockClick = (e: MouseEvent) => {
    // the tap that ended a swipe is not a tap on the stop under the finger
    if (swiped && e.isTrusted && (e.target as Element).closest?.(".dock")) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.isTrusted) swiped = false;
  };

  /** the header and the dock show which page you are on, as the next page's own do */
  function markHeader(doc: Document) {
    const live = document.querySelectorAll<HTMLAnchorElement>(".site-header a, .dock a");
    const next = doc.querySelectorAll<HTMLAnchorElement>(".site-header a, .dock a");
    if (live.length !== next.length) return;
    live.forEach((a, i) => {
      a.className = next[i].className;
      const current = next[i].getAttribute("aria-current");
      if (current) a.setAttribute("aria-current", current);
      else a.removeAttribute("aria-current");
    });
  }

  // ------------------------------------------------------------------ listeners
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.("a");
    if (!(a instanceof HTMLAnchorElement)) return;
    const url = travelTo(a);
    if (!url) return;
    e.preventDefault();
    go(url, { push: true, scroll: 0 });
  };
  const onOver = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.("a");
    if (!(a instanceof HTMLAnchorElement)) return;
    const url = travelTo(a);
    if (url) warm(url, true);
  };
  const onPop = (e: PopStateEvent) => {
    // a step within the same page (a link to a part of it): the browser's own
    if (location.pathname === here.path) return;
    const entry = e.state as Partial<Entry> | null;
    if (!entry || typeof entry.fsCol !== "number") {
      location.reload();
      return;
    }
    go(new URL(location.href), { push: false, scroll: entry.fsScroll ?? 0, col: entry.fsCol });
  };
  const onShow = (e: PageTransitionEvent) => {
    // back to this document from the browser's cache, part way through a move: finish it
    if (e.persisted) running?.end();
  };
  document.addEventListener("click", onDockClick, true);
  document.addEventListener("pointerdown", onDockDown, { passive: true });
  document.addEventListener("pointerup", onDockUp, { passive: true });
  document.addEventListener("click", onClick);
  document.addEventListener("pointerover", onOver, { passive: true });
  document.addEventListener("focusin", onOver);
  addEventListener("popstate", onPop);
  addEventListener("pageshow", onShow);
  addEventListener("scroll", onScroll, { passive: true });
  signal?.addEventListener(
    "abort",
    () => {
      running?.end();
      document.removeEventListener("click", onClick);
      document.removeEventListener("click", onDockClick, true);
      document.removeEventListener("pointerdown", onDockDown);
      document.removeEventListener("pointerup", onDockUp);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onOver);
      removeEventListener("popstate", onPop);
      removeEventListener("pageshow", onShow);
      removeEventListener("scroll", onScroll);
    },
    { once: true },
  );
  // The header's pages are where people go: their rooms are made ready once the page has settled, the pages beside
  // this one on the wall first. Only a few: the room keeps four signs, and a fifth would push out one got ready.
  window.setTimeout(() => {
    const here = placeOf(location.pathname).section;
    const urls = [...document.querySelectorAll<HTMLAnchorElement>(".site-nav a, .site-header .wordmark, .dock a")]
      .map((a) => travelTo(a))
      .filter((u): u is URL => !!u)
      .filter((u, i, all) => all.findIndex((v) => v.pathname === u.pathname) === i)
      .sort((a, b) => Math.abs(placeOf(a.pathname).section - here) - Math.abs(placeOf(b.pathname).section - here));
    urls.slice(0, 3).forEach((u) => warm(u));
  }, 1500);
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const next = () => (n-- > 0 ? requestAnimationFrame(next) : resolve());
    next();
  });

/**
 * What the static site's runtime does for a page when it loads (public/static-pages.js), done for a page put in
 * place: its words are shown (they arrive with the camera, not by revealing as they scroll in), its hero is
 * ready, a night that has passed hides its tickets, and a film gets its play button.
 */
function enliven(main: HTMLElement) {
  main.querySelectorAll("[data-reveal]").forEach((el) => {
    el.classList.remove("is-reveal-pending");
    el.classList.add("is-revealed");
  });
  main.querySelectorAll(".route-hero").forEach((hero) => {
    hero.setAttribute("data-hero-motion", "quick");
    hero.classList.add("is-motion-ready");
  });
  // the home page's flat lockup gives way to the room's sign, as it does when the room first starts there
  main.querySelector(".home-hero")?.classList.add("has-laser");
  main.querySelectorAll<HTMLElement>("[data-event-end]").forEach((el) => {
    if (Date.parse(el.getAttribute("data-event-end") ?? "") < Date.now()) el.hidden = true;
  });
  main.querySelectorAll(".archive-film").forEach((film) => {
    const video = film.querySelector("video");
    const play = film.querySelector<HTMLElement>(".archive-film__play");
    if (!video || !play) return;
    video.controls = false;
    play.hidden = false;
    play.addEventListener("click", () => {
      play.hidden = true;
      video.controls = true;
      video.focus();
      video.play();
    });
  });
}

/** the photos on the next page's first screen, decoded before the move (a little while at most) */
function decodeFirst(main: HTMLElement) {
  const first = [...main.querySelectorAll("img")].filter((img) => {
    const r = img.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.width > 0;
  });
  first.forEach((img) => (img.loading = "eager"));
  return Promise.race([Promise.allSettled(first.map((img) => img.decode())), wait(160)]);
}
