// Local-only lab for the laser room hero, served by the dev server at /laser-lab (see vite.config.ts).
//
// URL parameters:
//   ?t=12          freeze the clock at 12 s (the intro runs 0-5.4 s; the show starts at 4.6 s)
//   ?look=sheet    play one look on its own: fan, tunnel, sheet, cross, scan
//   ?off=smoke,dust  start with these layers off
//   ?only=lasers   start with only these layers on
//   ?ui=1          show the hero's words and buttons over the scene
//   ?quality=phone the phone tier
//   ?still=1       one settled frame (reduced motion)
//   ?launch=1      the full-screen power-on and pull back
import "../globals.css";
import { createLaserRoom, LAYERS, type Layer, type LookName } from "../../components/laser-room/scene";

// Poly Haven "Concrete Floor Worn 001" (CC0); see public/media/laser-room/CREDITS.md
const asset = (name: string) => `/media/laser-room/${name}.webp`;
const albedo = asset("floor-albedo");
const surface = asset("floor-surface");
const albedoPhone = asset("floor-albedo-phone");
const surfacePhone = asset("floor-surface-phone");

const LOOKS: LookName[] = ["fan", "tunnel", "sheet", "twin", "cross", "scan"];
const params = new URLSearchParams(location.search);
const quality = params.get("quality") === "phone" ? "phone" : "full";
const list = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
const only = list("only");
const off = list("off");
const layers = Object.fromEntries(
  LAYERS.map((l) => [l, only.length ? only.includes(l) : !off.includes(l)]),
) as Record<Layer, boolean>;
const lookParam = params.get("look") as LookName | null;
const freezeParam = params.get("t");

const root = document.getElementById("laser-lab-root");
if (!root) throw new Error("The local laser lab root is missing.");

const style = document.createElement("style");
style.textContent = `
  html, body { margin: 0; background: #000; height: 100%; overflow: hidden; }
  #laser-lab-root { position: fixed; inset: 0; }
  .laser-room__canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .lab-panel { position: fixed; top: 12px; right: 12px; z-index: 10; font: 12px/1.4 var(--font-mono, monospace);
    color: #eee; background: rgba(10, 8, 14, .82); border: 1px solid rgba(255,255,255,.12); border-radius: 8px;
    padding: 10px 12px; display: grid; gap: 6px; min-width: 190px; backdrop-filter: blur(6px); }
  .lab-panel[hidden] { display: none; }
  .lab-panel label { display: flex; gap: 6px; align-items: center; cursor: pointer; }
  .lab-panel .row { display: flex; flex-wrap: wrap; gap: 4px 10px; }
  .lab-panel select, .lab-panel input[type=range] { width: 100%; }
  .lab-panel output { color: #9af6ff; }
  .lab-ui { position: fixed; inset: auto 0 12vh 0; z-index: 5; display: grid; justify-items: center; gap: 22px;
    pointer-events: none; }
  .lab-ui .home-hero__mantra { margin: 0; }
  .lab-ui .route-hero__actions { pointer-events: auto; }
`;
document.head.append(style);

const panel = document.createElement("div");
panel.className = "lab-panel";
panel.innerHTML = `
  <strong>Laser room lab</strong>
  <output id="lab-stats">loading…</output>
  <div class="row">${LAYERS.map(
    (l) => `<label><input type="checkbox" data-layer="${l}" ${layers[l] ? "checked" : ""}/>${l}</label>`,
  ).join("")}</div>
  <label>look <select id="lab-look"><option value="">running order</option>${LOOKS.map(
    (l) => `<option ${l === lookParam ? "selected" : ""}>${l}</option>`,
  ).join("")}</select></label>
  <label><input type="checkbox" id="lab-freeze" ${freezeParam ? "checked" : ""}/>freeze at <output id="lab-t">${freezeParam ?? "12"}</output> s</label>
  <input type="range" id="lab-time" min="0" max="80" step="0.1" value="${freezeParam ?? "12"}" />
  <small>h hides this panel</small>
`;
document.body.append(panel);

if (params.get("ui") === "1") {
  const ui = document.createElement("div");
  ui.className = "lab-ui";
  ui.innerHTML = `
    <p class="home-hero__mantra route-hero__body">For the love of house.</p>
    <div class="home-hero__actions route-hero__actions">
      <a class="button button--solid" href="#">See upcoming events</a>
      <a class="button button--ghost" href="#">Enter the archive</a>
    </div>`;
  document.body.append(ui);
}

const room = await createLaserRoom(root, {
  textures: quality === "phone" ? { albedo: albedoPhone, surface: surfacePhone } : { albedo, surface },
  launch: params.get("launch") === "1",
  // the lab has no header; place the laser heads as they sit under the site's 72px header
  topClear: () => 72,
  onLaunchEnd: () => console.info("laser room: launch over"),
  quality,
  still: params.get("still") === "1",
  lock: lookParam ?? undefined,
  layers,
  debug: true,
  onFail: () => console.warn("laser room: gave up"),
});

if (room) {
  const stats = panel.querySelector<HTMLOutputElement>("#lab-stats")!;
  const timeOut = panel.querySelector<HTMLOutputElement>("#lab-t")!;
  const slider = panel.querySelector<HTMLInputElement>("#lab-time")!;
  const freeze = panel.querySelector<HTMLInputElement>("#lab-freeze")!;
  panel.querySelectorAll<HTMLInputElement>("[data-layer]").forEach((box) =>
    box.addEventListener("change", () => room.setLayer(box.dataset.layer as Layer, box.checked)),
  );
  panel.querySelector<HTMLSelectElement>("#lab-look")!.addEventListener("change", (e) => {
    room.lock(((e.target as HTMLSelectElement).value || undefined) as LookName | undefined);
  });
  const applyFreeze = () => room.freeze(freeze.checked ? Number(slider.value) : undefined);
  freeze.addEventListener("change", applyFreeze);
  slider.addEventListener("input", () => {
    timeOut.textContent = slider.value;
    if (freeze.checked) applyFreeze();
  });
  if (freezeParam) room.freeze(Number(freezeParam));
  window.addEventListener("keydown", (e) => {
    if (e.key === "h") panel.hidden = !panel.hidden;
  });
  setInterval(() => {
    const s = room.stats();
    stats.textContent = `${s.fps} fps · ${s.ms} ms · t ${s.time.toFixed(1)} s · ${s.beams} beams · dpr ${s.dpr}`;
  }, 500);
}

// __snap("name", { t, look, only, off, width }) renders one frame at `t` and saves it through the dev server, so
// the scene can be judged even when no browser window is on screen. Returns the saved file's path.
type Snap = { t?: number; look?: LookName; only?: Layer[]; off?: Layer[]; width?: number };
(window as unknown as { __snap: unknown }).__snap = async (name: string, opts: Snap = {}) => {
  const lab = (window as unknown as { __laserRoom: { render(): void; renderer: { domElement: HTMLCanvasElement } } }).__laserRoom;
  if (!room) return "no scene";
  LAYERS.forEach((l) => room.setLayer(l, opts.only ? opts.only.includes(l) : !(opts.off ?? []).includes(l)));
  room.lock(opts.look);
  room.freeze(opts.t ?? 14);
  lab.render();
  const source = lab.renderer.domElement;
  const width = Math.min(opts.width ?? 1280, source.width);
  const out = document.createElement("canvas");
  out.width = width;
  out.height = Math.round((source.height / source.width) * width);
  out.getContext("2d")!.drawImage(source, 0, 0, out.width, out.height);
  const body = out.toDataURL("image/jpeg", 0.86);
  const response = await fetch(`/laser-lab/snapshot?name=${encodeURIComponent(name)}`, { method: "POST", body });
  return response.text();
};
