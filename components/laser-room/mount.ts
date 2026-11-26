import { ROOMS, roomLayout, type Room, type RoomName } from "./rooms";
import { createLaserRoom, type BayInit, type Box, type CardLight, type LaserRoom, type RoomLight } from "./scene";
import { BPM, type Vec3 } from "./show";
import { defaultLayout, type SignLayout } from "./sign";
import { installTravel } from "./travel";

// Mounts the laser room behind a page. Loaded by public/laser-hero.js: in development straight from this file, on
// the static site as the bundle vite.laser-room.config.ts builds into /laser-room/laser-room.js.
//
// On the home page the page's own neon lockup decides where the sign goes and how it is laid out: the scene
// measures the monogram and the wordmark and builds the sign to match, so the 3D sign lands exactly where the page
// put the flat one (which stays in the page, hidden, as the fallback). Every other page names its room on its
// stage (`data-room`, see rooms.ts) and leaves a box where that room's neon hangs (`.room-mark`).
//
// The show is one show across the site: the moment it first started is kept for the visit, and every page after
// that opens on a room already that far into it (on the beat, no second power-on).

export type MountOptions = {
  /** the site's base path ("" or "/Frequency-Shift"), for the brand and texture files */
  base?: string;
  /** where the room's canvas goes, when not in the stage itself: a stage of the room's own that outlives the page,
   * so it can travel from one page to the next (see travel.ts) */
  container?: HTMLElement;
  /** go from page to page by travelling along the room's wall instead of loading each page afresh */
  travel?: boolean;
  launch?: boolean;
  signal?: AbortSignal;
  onStart?: () => void;
  onLaunchEnd?: () => void;
  onFail?: () => void;
};

/** One page's part in the room: its bay of the wall, and what it does to the page around it. */
export type PageBay = {
  init: BayInit;
  /** the page's lasers' colours become the page's own (from the moment the camera sets off for it) */
  enter(): void;
  /** the camera is there: anything that waits for that */
  arrived(scene: LaserRoom): void;
  /** the page has gone */
  leave(): void;
};

export async function mountLaserHero(stage: HTMLElement, opts: MountOptions = {}): Promise<LaserRoom | null> {
  const base = opts.base ?? "";
  const container = opts.container ?? stage;
  // A page opened where it has no size at all (a hidden tab or pane) would measure its sign at nothing: wait until
  // it has one, before anything is measured or the phone's quality is chosen
  await sized(container, opts.signal);
  if (opts.signal?.aborted) return null;
  // The stage is fixed behind the whole page: things are measured where they sit on the page (as if scrolled to
  // the top), which is where the camera at the top of the page sees them, however far down the visitor is.
  const fixed = getComputedStyle(container).position === "fixed";
  const phone = matchMedia("(pointer: coarse)").matches || innerWidth < 760;
  const suffix = phone ? "-phone" : "";
  const path = fixed ? pagePath() : null;
  const light = fixed ? lightThePage(opts.signal) : undefined;
  const colours = pageColours(opts.signal);
  const bayOf = (s: HTMLElement) => pageBay(s, { base, container, fixed, path, colours, signal: opts.signal });
  const first = bayOf(stage);
  first.enter();
  opts.signal?.addEventListener(
    "abort",
    () => {
      path?.stop();
      first.leave();
    },
    { once: true },
  );
  // a page reached while the show is running opens that far into it, unless it is the home page's first power-on
  const elapsed = showElapsed();
  const room = ROOMS[stage.dataset.room as RoomName];
  const settled = opts.launch ? undefined : room || elapsed !== undefined ? settle(elapsed) : undefined;
  const scene = await createLaserRoom(container, {
    look: first.init.look,
    signKey: first.init.key,
    settled,
    onShow: showStarted,
    page: first.init.page,
    cards: first.init.cards,
    onLight: light,
    textures: {
      albedo: `${base}/media/laser-room/floor-albedo${suffix}.webp`,
      surface: `${base}/media/laser-room/floor-surface${suffix}.webp`,
    },
    layout: first.init.layout(),
    anchor: first.init.anchor,
    // the stage runs up behind the sticky header, which starts at the stage's top
    topClear: () => document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0,
    quality: phone ? "phone" : "full",
    still: matchMedia("(prefers-reduced-motion: reduce)").matches,
    launch: opts.launch,
    signal: opts.signal,
    onStart: opts.onStart,
    onLaunchEnd: opts.onLaunchEnd,
    onFail: opts.onFail,
    debug: location.search.includes("laser-debug"),
    // testing only (with laser-debug): ?laser-load=2 draws the room twice as large each way, as a GPU a quarter as
    // fast would feel
    handicap: location.search.includes("laser-debug") ? Math.min(6, Math.max(1, Number(new URLSearchParams(location.search).get("laser-load")) || 1)) : 1,
  });
  if (!scene) return scene;
  first.arrived(scene);
  if (location.search.includes("laser-debug")) readout(scene, opts.signal);
  if (opts.travel && fixed) installTravel({ scene, base, first, bayOf, signal: opts.signal });
  return scene;
}

/**
 * The page's bay: its neon (the home page's lockup, measured where the page put it, or the room's own piece hung
 * in the band above the heading), the room's look, and the page's cards. Everything is looked for in the page the
 * stage belongs to: while the camera travels, the page being left is still in the document beside it.
 */
function pageBay(
  stage: HTMLElement,
  ctx: { base: string; container: HTMLElement; fixed: boolean; path: ReturnType<typeof pagePath> | null; colours: (pair: [Vec3, Vec3] | null) => void; signal?: AbortSignal },
): PageBay {
  const { base, container, fixed } = ctx;
  const room: Room | undefined = ROOMS[stage.dataset.room as RoomName];
  const page = stage.closest("main") ?? document;
  const hero = stage.closest(".home-hero") ?? page;
  const lockup = hero.querySelector<HTMLElement>(".neon-lockup");
  const logo = lockup?.querySelector<HTMLElement>(".neon-logo");
  const word = lockup?.querySelector<HTMLElement>(".neon-wordmark");
  const mark = room ? page.querySelector<HTMLElement>(".room-mark") : null;
  const rel = (el: Element): Box => {
    const a = el.getBoundingClientRect();
    const s = container.getBoundingClientRect();
    return { x: a.left - s.left, y: a.top - s.top + (fixed ? scrollY : 0), w: a.width, h: a.height };
  };

  let key = "home";
  let layout: () => SignLayout;
  if (room) {
    key = `room:${stage.dataset.room}`;
    layout = () => {
      const box = mark ? rel(mark) : null;
      const h = box && box.h > 0 ? box.h : 240;
      return roomLayout(room, box && box.w > 0 ? box.w : h * room.aspect, h);
    };
  } else {
    // the phone's wordmark is the stacked, two-line artwork
    const stacked = () => {
      const w = word ? rel(word) : null;
      return !!w && w.w > 0 && w.h / w.w > 0.15;
    };
    key = `home:${stacked() ? "stacked" : "wide"}`;
    layout = () => {
      if (!lockup || !logo || !word) return defaultLayout(base);
      const box = rel(lockup);
      const l = rel(logo);
      const w = rel(word);
      return {
        width: box.w,
        height: box.h,
        parts: [
          { url: `${base}/media/brand/fs-icon-neon.svg`, x: l.x - box.x, y: l.y - box.y, w: l.w, h: l.h },
          { url: `${base}/media/brand/frequency-shift-wordmark-neon${stacked() ? "-mobile" : ""}.svg`, x: w.x - box.x, y: w.y - box.y, w: w.w, h: w.h },
        ],
      };
    };
  }
  const cards = fixed ? pageCards(page, room ? room.cards : CARDS, room?.look.lasers?.[0] ?? PANEL) : null;
  const colours = room?.look.lasers ?? null;
  const own = new AbortController();
  ctx.signal?.addEventListener("abort", () => own.abort(), { once: true });
  return {
    init: {
      key,
      layout,
      look: room?.look,
      anchor: () => (room ? (mark ? rel(mark) : null) : lockup ? rel(lockup) : null),
      page: ctx.path?.page,
      cards: cards?.visible,
    },
    enter() {
      ctx.colours(colours);
    },
    arrived(scene) {
      if (room?.ownColours) ownColours(page, scene, ctx.colours, own.signal);
    },
    leave() {
      own.abort();
      cards?.stop();
    },
  };
}

/** resolves once the element has a size (or the mount is given up) */
function sized(el: HTMLElement, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (el.clientWidth > 0 && el.clientHeight > 0) return resolve();
    const watch = new ResizeObserver(() => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        watch.disconnect();
        resolve();
      }
    });
    watch.observe(el);
    signal?.addEventListener(
      "abort",
      () => {
        watch.disconnect();
        resolve();
      },
      { once: true },
    );
  });
}

/** when the show first started this visit (the clock's time, kept in the session), and how long ago that was */
const EPOCH = "fs-room-epoch";
function showElapsed(): number | undefined {
  try {
    const at = Number(sessionStorage.getItem(EPOCH));
    return at > 0 && at <= Date.now() ? (Date.now() - at) / 1000 : undefined;
  } catch {
    return undefined;
  }
}
function showStarted(since: number) {
  try {
    if (!sessionStorage.getItem(EPOCH)) sessionStorage.setItem(EPOCH, String(Math.round(Date.now() - since * 1000)));
  } catch {
    // no storage: each page starts its own show
  }
}
/** how far into the show a page opens: where the show is now, on its beat (wrapped, so the clock stays small), and
 * never inside its first two bars (the opening burst) */
function settle(elapsed = 0) {
  const bar = (4 * 60) / BPM;
  const at = elapsed % (256 * bar);
  return at < 2 * bar ? at + 2 * bar : at;
}

/** The room's two laser colours as the page's own (`--laser-pink`, `--laser-cyan`: every glow on the page is mixed
 * from them), so a page is lit in its room's colours. */
function pageColours(signal?: AbortSignal) {
  const style = document.documentElement.style;
  const css = (c: Vec3) => `rgb(${c.map((v) => Math.round(255 * Math.min(1, Math.max(0, v) ** (1 / 2.2)))).join(" ")})`;
  signal?.addEventListener("abort", () => ["--laser-pink", "--laser-cyan"].forEach((k) => style.removeProperty(k)), { once: true });
  // a page without colours of its own has the site's
  return (pair: [Vec3, Vec3] | null) => {
    if (!pair) return ["--laser-pink", "--laser-cyan"].forEach((k) => style.removeProperty(k));
    style.setProperty("--laser-pink", css(pair[0]));
    style.setProperty("--laser-cyan", css(pair[1]));
  };
}

/**
 * A night's page is lit in that night's own colours: the most colourful of its first photographs gives the neon
 * and one laser its colour, and the other laser is whichever of the house pink and cyan is further from it. A
 * night with no photographs, or only grey ones, keeps the archive's violet.
 */
function ownColours(page: ParentNode, scene: LaserRoom, colours: (pair: [Vec3, Vec3] | null) => void, signal?: AbortSignal) {
  const images = [...page.querySelectorAll<HTMLImageElement>(".archive-gallery img")].slice(0, 4);
  let best = 0.3;
  const take = (img: HTMLImageElement) => {
    if (signal?.aborted) return;
    const tone = toneOf(img);
    if (!tone || tone.light <= best) return;
    best = tone.light;
    const a = tone.color;
    const far = (c: Vec3) => (a[0] - c[0]) ** 2 + (a[1] - c[1]) ** 2 + (a[2] - c[2]) ** 2;
    const pink: Vec3 = [1, 0.06, 0.52];
    const cyan: Vec3 = [0.05, 0.78, 1];
    const b = far(pink) > far(cyan) ? pink : cyan;
    const paler: Vec3 = [a[0] + (1 - a[0]) * 0.35, a[1] + (1 - a[1]) * 0.35, a[2] + (1 - a[2]) * 0.35];
    const hex = (c: Vec3) => (Math.round(c[0] ** (1 / 2.2) * 255) << 16) | (Math.round(c[1] ** (1 / 2.2) * 255) << 8) | Math.round(c[2] ** (1 / 2.2) * 255);
    scene.tint({ lasers: [a, b], tube: [hex(paler), hex(a)], light: a });
    colours([a, b]);
  };
  // the gallery is down the page and loads when it is reached: its first photographs are asked for now, at their
  // smallest size (the page will show them soon anyway)
  for (const img of images) {
    if (img.complete && img.naturalWidth) {
      take(img);
      continue;
    }
    const url = img.srcset.split(",")[0]?.trim().split(/\s+/)[0] || img.getAttribute("src");
    if (!url) continue;
    const probe = new Image();
    probe.decoding = "async";
    probe.addEventListener("load", () => take(probe), { once: true });
    probe.src = url;
  }
}

/** The camera's path down the page is the scroll itself, in screen heights (the scene turns it into one move: see
 * scene.ts floorShot). */
function pagePath() {
  let end = 1;
  function measure() {
    end = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  }
  // the page's length changes with its content; the screen's height alone changes the scroll's end
  const resizer = new ResizeObserver(() => measure());
  resizer.observe(document.body);
  addEventListener("resize", measure, { passive: true });
  measure();

  return {
    page: () => ({ at: scrollY / innerHeight, end: end / innerHeight }),
    stop() {
      resizer.disconnect();
      removeEventListener("resize", measure);
    },
  };
}

/**
 * The page's cards over the room, for the floor to light and reflect: the next night's poster and the archive's
 * photos in their own colours, the glass panels in the sign's pink, fainter. Measured where they sit on the page
 * (again when the page changes size), so a frame costs no layout, only the scroll.
 */
const CARDS: [selector: string, power: number][] = [
  [".home-event__visual", 1.4],
  [".home-memory__grid figure", 0.9],
  [".home-event__content, .home-event .empty-state, .home-manifesto__copy", 0.45],
];
const PANEL: [number, number, number] = [1, 0.3, 0.72];

function pageCards(page: ParentNode, list: [selector: string, power: number][], panel: [number, number, number]) {
  type Card = { el: HTMLElement; left: number; top: number; w: number; h: number; color: [number, number, number]; power: number };
  const cards: Card[] = [];
  for (const [selector, power] of list) {
    for (const el of page.querySelectorAll<HTMLElement>(selector)) {
      const card: Card = { el, left: 0, top: 0, w: 0, h: 0, color: panel, power };
      cards.push(card);
      const img = el.querySelector("img");
      if (!img) continue;
      // a photo glows in its own colour, once it has loaded
      card.power = 0;
      const take = () => {
        const tone = toneOf(img);
        if (!tone) return;
        card.color = tone.color;
        card.power = power * tone.light;
      };
      if (img.complete && img.naturalWidth) take();
      else img.addEventListener("load", take, { once: true });
    }
  }
  function measure() {
    for (const card of cards) {
      const r = card.el.getBoundingClientRect();
      Object.assign(card, { left: r.left, top: r.top + scrollY, w: r.width, h: r.height });
    }
  }
  const resizer = new ResizeObserver(() => measure());
  resizer.observe(document.body);
  measure();
  const out: CardLight[] = [];
  return {
    /** the cards on the screen now, nearest the middle first */
    visible(): CardLight[] {
      out.length = 0;
      const y = scrollY;
      const h = innerHeight;
      for (const c of cards) {
        const top = c.top - y;
        if (c.power <= 0 || top > h || top + c.h < 0) continue;
        out.push({ x: c.left, y: top, w: c.w, h: c.h, color: c.color, power: c.power });
      }
      return out.sort((a, b) => Math.abs(a.y + a.h / 2 - h / 2) - Math.abs(b.y + b.h / 2 - h / 2));
    },
    stop() {
      resizer.disconnect();
    },
  };
}

/**
 * a photo's colour as a light: its average, more saturated, at full strength; and how much light it gives, more
 * for a brighter photo and for a more colourful one (a grey or white photo is barely a coloured light at all)
 */
function toneOf(img: HTMLImageElement): { color: [number, number, number]; light: number } | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 8;
    const g = canvas.getContext("2d", { willReadFrequently: true });
    if (!g) return null;
    g.drawImage(img, 0, 0, 8, 8);
    const d = g.getImageData(0, 0, 8, 8).data;
    let r = 0;
    let gr = 0;
    let b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += (d[i] / 255) ** 2.2;
      gr += (d[i + 1] / 255) ** 2.2;
      b += (d[i + 2] / 255) ** 2.2;
    }
    const n = d.length / 4;
    [r, gr, b] = [r / n, gr / n, b / n];
    const lum = 0.2126 * r + 0.7152 * gr + 0.0722 * b;
    const sat = (v: number) => Math.max(0, lum + (v - lum) * 1.8);
    const c: [number, number, number] = [sat(r), sat(gr), sat(b)];
    const top = Math.max(...c, 1e-4);
    const colourful = (top - Math.min(...c)) / top;
    return { color: [c[0] / top, c[1] / top, c[2] / top], light: Math.min(1, 0.3 + Math.sqrt(lum) * 1.2) * (0.35 + 0.65 * colourful) };
  } catch {
    return null;
  }
}

/**
 * The room's light, handed to the page as custom properties on <html>. A property written there restyles the whole
 * page, and every glow that reads it is drawn again: written every frame, that cost more than the room itself
 * (measured 2026-11-24: the lower page ran at 30 to 45 frames a second with it, 60 without). So only what changes
 * slowly goes this way, and only when it has moved far enough to see: the sign's light sits still but for its
 * dips, the air's colour changes with the look, the camera's turn only moves with the scroll. The beat goes
 * another way (see beatClock).
 */
const LIGHT_VARS: [key: "sign" | "lasers" | "pink" | "travel", step: number][] = [
  ["sign", 0.08],
  ["lasers", 0.08],
  ["pink", 0.03],
  ["travel", 0.002],
];
/**
 * The camera's turn from the sign to the floor (`travel`) moves on nearly every frame of a scroll through the hero,
 * and a property on <html> restyles every element of the page (about a millisecond a frame on this Mac, measured
 * 25 Nov; several on a phone). So it is written exactly only on the few elements that read it (the veils, the hero's
 * words, the header), and on <html> only in coarse steps, for anything else.
 */
const TRAVEL_READERS = ".room-host, .home-hero__stage, .home-hero__content, .home-hero__scroll, .site-header, .room-stage";
function lightThePage(signal?: AbortSignal) {
  const style = document.documentElement.style;
  const written: Partial<Record<string, number>> = {};
  const beat = beatClock(signal);
  let rootTravel: number | undefined;
  signal?.addEventListener(
    "abort",
    () => {
      LIGHT_VARS.forEach(([k]) => style.removeProperty(`--room-${k}`));
      document.querySelectorAll<HTMLElement>(TRAVEL_READERS).forEach((el) => el.style.removeProperty("--room-travel"));
    },
    { once: true },
  );
  // the ends always land exactly: the hero's words are fully there at the top of the page, and gone below it
  const moved = (v: number, was: number | undefined, step: number) => was === undefined || Math.abs(v - was) >= step || ((v === 0 || v === 1) && v !== was);
  return (light: RoomLight) => {
    for (const [k, step] of LIGHT_VARS) {
      const v = light[k];
      if (!moved(v, written[k], step)) continue;
      written[k] = v;
      const value = v.toFixed(3);
      if (k !== "travel") {
        style.setProperty(`--room-${k}`, value);
        continue;
      }
      if (moved(v, rootTravel, 0.1)) {
        rootTravel = v;
        style.setProperty("--room-travel", value);
      }
    }
    // (looked for every time: a page put in place by the travel brings new ones, which take the value at once)
    const travel = written.travel;
    if (travel !== undefined) {
      const value = travel.toFixed(3);
      document.querySelectorAll<HTMLElement>(TRAVEL_READERS).forEach((el) => {
        if (el.style.getPropertyValue("--room-travel") !== value) el.style.setProperty("--room-travel", value);
      });
    }
    beat(light.clock);
  };
}

/**
 * The page's pulses on the beat are CSS animations one bar long (the beat-* keyframes in globals.css), running on
 * the compositor: no script and no drawing per frame. They start when the show does (`room-live` on <html>). The
 * show's clock is the scene's own (it stops while the room is off screen, and slips when frames are late), so now
 * and then each animation is checked against it and, if it has drifted far enough to see, set right.
 */
function beatClock(signal?: AbortSignal) {
  const root = document.documentElement;
  let live = false;
  let checkAt = 0;
  signal?.addEventListener("abort", () => root.classList.remove("room-live"), { once: true });
  return (clock: number) => {
    if (signal?.aborted || typeof document.getAnimations !== "function") return;
    if (clock < 0) {
      if (live) root.classList.remove("room-live");
      live = false;
      return;
    }
    const now = performance.now();
    if (!live) {
      live = true;
      root.classList.add("room-live");
      // the animations exist from the next frame: set them right as soon as they do
      checkAt = now + 50;
    }
    if (now < checkAt) return;
    checkAt = now + 1000;
    for (const animation of document.getAnimations()) {
      if (!(animation instanceof CSSAnimation) || !animation.animationName.startsWith("beat-")) continue;
      const bar = Number(animation.effect?.getComputedTiming().duration);
      const at = Number(animation.currentTime);
      if (!(bar > 0) || !Number.isFinite(at)) continue;
      // how far the animation is from the show's place in the bar, the short way round
      const off = ((((clock * bar - at) % bar) + bar * 1.5) % bar) - bar / 2;
      if (Math.abs(off) > 30) animation.currentTime = at + off;
    }
  };
}

/**
 * The room's pace, written on the screen (only with ?laser-debug in the address): what it is drawn at, how many
 * of its frames came late, and how much of the picture it is drawing. For reading a real phone's numbers off it.
 */
function readout(scene: LaserRoom, signal?: AbortSignal) {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText =
    "position:fixed;left:8px;top:calc(env(safe-area-inset-top, 0px) + 76px);z-index:99999;pointer-events:none;padding:6px 8px;border-radius:6px;background:rgba(0,0,0,.72);color:#fff;font:11px/1.35 ui-monospace,Menlo,monospace;white-space:pre";
  document.body.append(el);
  let draws = 0;
  let late = 0;
  let page = 0;
  let presented = 0;
  let raf = requestAnimationFrame(function count() {
    page++;
    raf = requestAnimationFrame(count);
  });
  const timer = window.setInterval(() => {
    const s = scene.stats();
    const canvas = scene.canvas;
    el.textContent =
      `room ${s.draws - draws}/s (aims at ${s.rate})  page ${page}/s\n` +
      `late ${s.late - late} this second, ${s.late} of ${s.draws} in all\n` +
      `stage ${s.stage}  sharpness ${s.resolution}  ${canvas.width}x${canvas.height}\n` +
      `drawn in ${s.parts || 1} part${s.parts > 1 ? "s" : ""}, shown ${s.presented - presented}/s\n` +
      `timed frame ${s.timed} ms`;
    draws = s.draws;
    late = s.late;
    presented = s.presented;
    page = 0;
  }, 1000);
  signal?.addEventListener(
    "abort",
    () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      el.remove();
    },
    { once: true },
  );
}
