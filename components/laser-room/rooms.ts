import type { RoomLook } from "./scene";
import type { LookName, Vec3 } from "./show";
import type { SignLayout } from "./sign";

// The rooms behind the pages that are not the home page. The wordmark and the monogram hang in the home page's
// room only. Every other page's room hangs a piece of neon of its own on the wall, drawn here, and the pieces are
// one family: the transport controls of a deck. Events is fast-forward (what's next), the archive is rewind (what
// happened), one night's own page is play, About is the sound itself (a wave whose frequency shifts along its
// length, running from pink to cyan), Contact is a signal going out, the small print is pause, and the page that
// isn't there has been ejected.
//
// A room is its neon (shape and colours), the two colours of its lasers, the looks its show runs through and how
// fast, and the move the scroll carries the camera through. scene.ts plays it; mount.ts puts it behind the page.

export type RoomName = "events" | "event" | "archive" | "night" | "sets" | "about" | "artist" | "contact" | "legal" | "lost";

type Draw = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void;

export type Room = {
  /** the neon's shape: drawn in a box `aspect` wide for one high, in tubes `tube` of its height thick */
  art: Draw;
  aspect: number;
  look: RoomLook;
  /** the page's blocks that stand on the floor as lightboxes while the camera looks down (see mount.ts pageCards):
   * a photograph glows in its own colour, anything else in the room's */
  cards: [selector: string, power: number][];
  /** the room takes its colours from the page's own photographs (a night's page) */
  ownColours?: boolean;
};

const PINK: Vec3 = [1, 0.06, 0.52];
const CYAN: Vec3 = [0.05, 0.78, 1];
const VIOLET: Vec3 = [0.62, 0.2, 1];

/** a tube: a stroked path with round ends and corners, `t` of the box's height thick */
function tube(c: CanvasRenderingContext2D, h: number, t: number) {
  c.lineWidth = h * t;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.stroke();
}

/** a triangle's outline pointing right (`dir` 1) or left (-1), in the box x..x+w, y..y+h, inset by half a tube */
function triangle(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dir: number, inset: number) {
  const x0 = dir > 0 ? x + inset : x + w - inset;
  const x1 = dir > 0 ? x + w - inset : x + inset;
  c.beginPath();
  c.moveTo(x0, y + inset);
  c.lineTo(x1, y + h / 2);
  c.lineTo(x0, y + h - inset);
  c.closePath();
}

const T = 0.075; // a tube's thickness, as a share of the piece's height

/** fast-forward and rewind: three triangles in a row, each a little smaller and fainter-set than the one before it
 * in the direction they point, so the row reads as moving */
const transport =
  (dir: number): Draw =>
  (c, x, y, w, h) => {
    const each = w / 3;
    for (let i = 0; i < 3; i++) {
      triangle(c, x + i * each + each * 0.06, y, each * 0.88, h, dir, (h * T) / 2);
      tube(c, h, T);
    }
  };

/** play: one triangle in a ring */
const play: Draw = (c, x, y, w, h) => {
  const r = h / 2 - (h * T) / 2;
  c.beginPath();
  c.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
  tube(c, h, T);
  triangle(c, x + w * 0.37, y + h * 0.29, w * 0.36, h * 0.42, 1, 0);
  tube(c, h, T);
};

/** the sound: one line, a wave whose frequency rises along its length (the shift), swinging full height through
 * its middle and settling to nothing at either end */
const wave: Draw = (c, x, y, w, h) => {
  const t = 0.055;
  const amp = h / 2 - (h * t) / 2;
  c.beginPath();
  const n = 1200;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    // from a little over one cycle a width to six and a half: the phase is the frequency's integral
    const phase = Math.PI * 2 * (1.2 * u + 2.65 * u * u);
    const swing = Math.sin(Math.PI * u) ** 0.4;
    const px = x + (h * t) / 2 + u * (w - h * t);
    const py = y + h / 2 - Math.sin(phase) * amp * swing;
    if (i) c.lineTo(px, py);
    else c.moveTo(px, py);
  }
  tube(c, h, t);
};

/** a signal going out: a point, and arcs leaving it on either side */
const beacon: Draw = (c, x, y, w, h) => {
  const cx = x + w / 2;
  const cy = y + h / 2;
  c.beginPath();
  c.arc(cx, cy, h * 0.09, 0, Math.PI * 2);
  c.fill();
  for (let i = 1; i <= 3; i++) {
    const r = h * (0.1 + 0.2 * i);
    const a = 0.62 - i * 0.05;
    for (const side of [0, Math.PI]) {
      c.beginPath();
      c.arc(cx, cy, r, side - a, side + a);
      tube(c, h, T);
    }
  }
};

/** record: a ring with the dot lit inside it */
const record: Draw = (c, x, y, w, h) => {
  const cx = x + w / 2;
  const cy = y + h / 2;
  c.beginPath();
  c.arc(cx, cy, h / 2 - (h * T) / 2, 0, Math.PI * 2);
  tube(c, h, T);
  c.beginPath();
  c.arc(cx, cy, h * 0.22, 0, Math.PI * 2);
  c.fill();
};

/** pause: two bars */
const pause: Draw = (c, x, y, w, h) => {
  const bar = w * 0.3;
  for (const bx of [x + w * 0.12, x + w * 0.58]) {
    c.beginPath();
    c.roundRect(bx + (h * T) / 2, y + (h * T) / 2, bar - h * T, h - h * T, h * 0.04);
    tube(c, h, T);
  }
};

/** eject: a triangle pointing up, over a bar */
const eject: Draw = (c, x, y, w, h) => {
  const i = (h * T) / 2;
  c.beginPath();
  c.moveTo(x + w / 2, y + i);
  c.lineTo(x + w - i, y + h * 0.62);
  c.lineTo(x + i, y + h * 0.62);
  c.closePath();
  tube(c, h, T);
  c.beginPath();
  c.roundRect(x + i, y + h * 0.78, w - i * 2, h * 0.22 - i, h * 0.03);
  tube(c, h, T);
};

const order = (...looks: [LookName, number][]) => looks;

const ROOMS_AS_DRAWN: Record<RoomName, Room> = {
  // what's next: cyan neon, the lasers at full pace, and the camera walks in toward the wall as the page goes down
  events: {
    art: transport(1),
    aspect: 2.7,
    look: {
      tube: [0x1ec8ff, 0x7be0ff],
      light: [0.12, 0.62, 1],
      lasers: [PINK, CYAN],
      order: order(["tunnel", 4], ["scan", 4], ["cross", 4], ["fan", 4], ["twin", 8]),
      path: { back: -2.6, slide: 0.6 },
      rigs: ["flank", "behind", "floor"],
    },
    cards: [
      [".event-card", 1.3],
      [".empty-state, .past-events__list", 0.4],
    ],
  },
  // one night: play
  event: {
    art: play,
    aspect: 1,
    look: {
      tube: [0x1ec8ff, 0xeb73c1],
      light: [0.45, 0.4, 1],
      lasers: [PINK, CYAN],
      order: order(["scan", 4], ["tunnel", 4], ["fan", 4], ["cross", 4]),
      path: { back: -2, slide: 0.4 },
      rigs: ["behind", "rain"],
    },
    cards: [
      [".archive-film", 1],
      [".detail-meta, .detail-content .prose", 0.4],
    ],
  },
  // what happened: violet neon, the show at half pace, and the camera walks along the wall like a gallery
  archive: {
    art: transport(-1),
    aspect: 2.7,
    look: {
      tube: [0xd08bff, 0xc548f0],
      light: [0.6, 0.22, 1],
      lasers: [VIOLET, PINK],
      order: order(["sheet", 8], ["twin", 8], ["scan", 4]),
      tempo: 0.5,
      gain: 0.85,
      path: { slide: 7, back: 1.2, height: 2.3 },
      rigs: ["skim", "scan"],
    },
    cards: [[".archive-card > a", 1.2]],
  },
  // one night's record: the same room, in the colours of that night's own photographs
  night: {
    art: transport(-1),
    aspect: 2.7,
    look: {
      tube: [0xd08bff, 0xc548f0],
      light: [0.6, 0.22, 1],
      lasers: [VIOLET, PINK],
      order: order(["twin", 8], ["sheet", 8], ["scan", 4]),
      tempo: 0.5,
      gain: 0.85,
      path: { slide: 5, back: 2.4, height: 2.3 },
      rigs: ["skim", "scan"],
    },
    cards: [
      [".archive-gallery figure", 1],
      [".archive-film", 1],
    ],
    ownColours: true,
  },
  // the sound: a wave running from pink to cyan, a slow wide show, and the camera rises over the floor
  // the recorded sets: record, in a hot red-pink, single beams sweeping slowly like a camera panning the floor
  sets: {
    art: record,
    aspect: 1,
    look: {
      tube: [0xff2d6f, 0xff4fa8],
      light: [1, 0.12, 0.4],
      lasers: [PINK, CYAN],
      order: order(["scan", 8], ["fan", 8], ["tunnel", 4]),
      tempo: 0.5,
      path: { tilt: 0.6, back: 0.8 },
      rigs: ["flank", "floor"],
    },
    cards: [[".sets-soon", 0.4]],
  },
  about: {
    art: wave,
    aspect: 4.2,
    look: {
      tube: [0xff4fa8, 0x1ec8ff],
      light: [0.75, 0.3, 0.9],
      order: order(["fan", 8], ["sheet", 8], ["twin", 8]),
      tempo: 0.5,
      path: { height: 3.2, rise: 2.6, ahead: 4.2, back: 1.6 },
      rigs: ["rain", "floor"],
    },
    cards: [[".prose", 0.45]],
  },
  artist: {
    art: wave,
    aspect: 4.2,
    look: {
      tube: [0x1ec8ff, 0xff4fa8],
      light: [0.5, 0.4, 1],
      order: order(["fan", 8], ["scan", 4], ["sheet", 8]),
      tempo: 0.5,
      path: { height: 3.2, rise: 2, ahead: 4.2, back: 1.6 },
      rigs: ["rain", "floor"],
    },
    cards: [[".prose", 0.45]],
  },
  // a signal going out: single beams searching the room, and the camera stays near the wall
  contact: {
    art: beacon,
    aspect: 2.4,
    look: {
      tube: [0xff4fa8, 0xeb73c1],
      light: [1, 0.2, 0.6],
      lasers: [PINK, CYAN],
      order: order(["scan", 8], ["cross", 4], ["tunnel", 4]),
      path: { tilt: 0.75, back: 0.8 },
      rigs: ["flank", "skim"],
    },
    cards: [[".prose", 0.45]],
  },
  // the small print: the room on pause, dim and nearly still, so the words are easy to read
  legal: {
    art: pause,
    aspect: 0.72,
    look: {
      tube: [0xeb73c1, 0xc548f0],
      light: [0.8, 0.25, 0.8],
      order: order(["scan", 8]),
      tempo: 0.25,
      gain: 0.55,
      path: { tilt: 0.6, back: 0.6, slide: 0.4 },
      rigs: [],
    },
    cards: [],
  },
  // nothing here: ejected, on a tube that won't stay lit
  lost: {
    art: eject,
    aspect: 1,
    look: {
      tube: [0xff4fa8, 0xff4fa8],
      light: [1, 0.2, 0.55],
      order: order(["scan", 8]),
      tempo: 0.5,
      gain: 0.6,
      path: { tilt: 0.5 },
      rigs: [],
      restless: true,
    },
    cards: [],
  },
};

/**
 * Every other page's room is a quieter one than the home page's: these are pages for reading. Half the beams, and
 * those dimmer; the show at about a third of its pace at most (slower sweeps); one rig round the room once the
 * camera has turned down to the floor, not two or three. The camera moves less too (scene.ts CALM_MOVE). The neon
 * is as bright as ever.
 */
export const ROOMS = Object.fromEntries(
  Object.entries(ROOMS_AS_DRAWN).map(([name, room]) => [
    name,
    {
      ...room,
      look: {
        ...room.look,
        calm: true,
        gain: (room.look.gain ?? 1) * 0.62,
        tempo: Math.min(room.look.tempo ?? 1, 0.35),
        rigs: room.look.rigs?.slice(0, 1),
      },
    },
  ]),
) as Record<RoomName, Room>;

/** the room's neon as a sign's layout, `width` by `height` in the page's own pixels */
export function roomLayout(room: Room, width: number, height: number): SignLayout {
  return { width, height, monogram: false, parts: [{ x: 0, y: 0, w: width, h: height, draw: room.art }] };
}
