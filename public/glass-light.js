// Light on the glass. The site's panels, cards, buttons, dock and event bar are glass ("Glass, the buttons' way" in
// app/globals.css); the cursor is a small light held over them. This places that light on every pane within reach,
// and the styles under "Light on the glass" draw what glass does with it:
//
//   - on the face: a small hot core where the light sits, split by the glass into a pink fringe on one side and a
//     cyan one on the other; a fainter second image from the back face of the glass; a long thin streak through it
//     that tilts as the light moves across the pane; and a faint brightening of the pane round it
//   - on the rim: the edge nearest the light catches it, already as the light comes near and before it is over the
//     pane, and the light it catches bleeds a little way into the glass; and, while the light is over the pane, the far edge glows where light travelling inside the glass
//     comes out again
//
// The light follows the pointer with a little weight, as a reflection slides on glass. Only pointers that hover
// (mice, trackpads); never on touch. Plain script: it runs in the static export, which ships no React.
(function () {
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)");
  if (!fine || !fine.matches) return;

  var SELECTOR = [
    ".home-event__content",
    ".home-manifesto__copy",
    ".home-event .empty-state",
    ".page-shell .prose",
    ".page-shell .empty-state",
    ".past-events__list",
    ".detail-grid > aside",
    ".archive-detail-hero .detail-meta",
    ".archive-detail-layout > aside",
    ".event-card",
    ".archive-card > a",
    ".button",
    ".header-cta",
    ".dock",
    ".next-bar",
  ].join(",");
  var REACH = 180; // px beyond a pane at which its rim starts to catch the light
  var FACE_REACH = 36; // px beyond a pane at which its face stops showing the light
  var FOLLOW_MS = 55; // how long the light takes to catch up with the pointer (time constant)

  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var panes = [];
  var dirty = true;
  var lit = [];
  var pointer = null;
  var light = null;
  var last = 0;
  var raf = 0;

  function kick() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function glint(el) {
    var g = el.__glint;
    if (g && g.parentNode === el) return g;
    g = document.createElement("span");
    g.className = "glint";
    g.setAttribute("aria-hidden", "true");
    g.innerHTML = '<span class="glint__edge"></span><span class="glint__face"><span class="glint__streak"></span></span><span class="glint__rim"></span>';
    if (getComputedStyle(el).position === "static") el.classList.add("glint-host");
    el.appendChild(g);
    el.__glint = g;
    return g;
  }

  function off(el) {
    if (el.__glint) el.__glint.classList.remove("is-lit");
  }

  function px(v) {
    return v.toFixed(1) + "px";
  }

  function frame(now) {
    raf = 0;
    if (dirty) {
      panes = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
      dirty = false;
    }
    var dt = Math.min(64, last ? now - last : 16);
    last = now;

    if (!pointer) {
      lit.forEach(off);
      lit = [];
      light = null;
      return;
    }
    if (!light) light = { x: pointer.x, y: pointer.y };
    var k = reduce.matches ? 1 : 1 - Math.exp(-dt / FOLLOW_MS);
    light.x += (pointer.x - light.x) * k;
    light.y += (pointer.y - light.y) * k;
    var moving = Math.abs(pointer.x - light.x) + Math.abs(pointer.y - light.y) > 0.25;

    // read every pane's place first, then write, so the page is laid out once per frame
    var vh = innerHeight;
    var near = [];
    for (var i = 0; i < panes.length; i++) {
      var el = panes[i];
      var r = el.getBoundingClientRect();
      if (!r.width || r.bottom < -REACH || r.top > vh + REACH) continue;
      var dx = Math.max(r.left - light.x, 0, light.x - r.right);
      var dy = Math.max(r.top - light.y, 0, light.y - r.bottom);
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < REACH) near.push([el, r, d]);
    }

    var now_lit = [];
    for (var j = 0; j < near.length; j++) {
      var p = near[j][0];
      var b = near[j][1];
      var dist = near[j][2];
      var g = glint(p);
      var x = light.x - b.left;
      var y = light.y - b.top;
      // the direction from the pane's middle to the light, for the fringes, the back-face image and the streak's tilt
      var cx = x - b.width / 2;
      var cy = y - b.height / 2;
      var len = Math.sqrt(cx * cx + cy * cy) || 1;
      var ux = cx / len;
      var uy = cy / len;
      var reach = Math.min(1, len / (Math.max(b.width, b.height) / 2));
      var inside = dist === 0;
      // the face shows the light only while it is over the pane or right at its edge; the rim catches it from further
      // off, and most strongly just outside, where the light grazes the edge
      var face = inside ? 1 : Math.max(0, 1 - dist / FACE_REACH);
      var t = 1 - dist / REACH;
      var rim = inside ? 0.7 : t * t * (3 - 2 * t);
      var s = g.style;
      s.setProperty("--gx", px(x));
      s.setProperty("--gy", px(y));
      s.setProperty("--sx", px(ux * 7));
      s.setProperty("--sy", px(uy * 7));
      s.setProperty("--bx", px(-ux * (10 + 18 * reach)));
      s.setProperty("--by", px(-uy * (10 + 18 * reach)));
      // where light that came in under the pointer reaches the far side: through the middle, onto the far edge
      s.setProperty("--ox", px(b.width / 2 - ux * b.width * 0.55));
      s.setProperty("--oy", px(b.height / 2 - uy * b.height * 0.55));
      s.setProperty("--tilt", (-24 + 14 * (cx / (b.width / 2 || 1))).toFixed(1) + "deg");
      s.setProperty("--face", face.toFixed(3));
      s.setProperty("--rim", rim.toFixed(3));
      // light coming in through the nearest edge and spreading into the glass: strongest while the light is just off it
      s.setProperty("--spill", (inside ? 0.25 : rim).toFixed(3));
      s.setProperty("--far", (inside ? 0.35 + 0.65 * reach : 0).toFixed(3));
      if (!g.classList.contains("is-lit")) g.classList.add("is-lit");
      now_lit.push(p);
    }
    for (var m = 0; m < lit.length; m++) if (now_lit.indexOf(lit[m]) < 0) off(lit[m]);
    lit = now_lit;

    if (moving) kick();
  }

  document.addEventListener(
    "pointermove",
    function (e) {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      pointer = { x: e.clientX, y: e.clientY };
      kick();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", function () {
    pointer = null;
    kick();
  });
  addEventListener("blur", function () {
    pointer = null;
    kick();
  });
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", kick, { passive: true });
  // pages arrive without a reload (the room's travel between pages): look again for panes when the page changes
  new MutationObserver(function () {
    dirty = true;
  }).observe(document.body, { childList: true, subtree: true });
})();
