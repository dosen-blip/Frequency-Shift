// Light on the glass. The site's panels, cards, buttons, dock and event bar are glass ("Glass, the buttons' way" in
// app/globals.css); the cursor is a small light held over them. This places that light on every pane within reach,
// and the styles under "Light on the glass" draw what a pane of glass does with it:
//
//   - its face: a soft pool where the light falls, in the room's own colour; a gentle core, a little stretched
//     along the pane's edge the way a bevelled pane stretches a reflection, its colours split pink and cyan across
//     it, turned to point from the middle of the pane to the light; and a fainter second image from the glass's
//     back face, nearer the middle
//   - its edge: the rim nearest the light catches it, from before the light is over the pane, and the light it
//     catches bleeds a little way in; while the light is over the pane, the far rim glows where light carried
//     inside the glass comes out
//
// Every piece is drawn once, at a fixed size, and only moved and faded after that (transform and opacity), so the
// light costs the screen nothing to repaint however large the pane. The light follows the pointer with a little
// weight, as a reflection slides on glass. Mice and trackpads only, never touch. Plain script: it runs in the
// static export, which ships no React.
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
  var REACH = 170; // px beyond a pane at which its rim starts to catch the light
  var FACE_REACH = 30; // px beyond a pane at which its face stops showing the light
  var FOLLOW_MS = 60; // how long the light takes to catch up with the pointer (time constant)
  var PIECES = ["pool", "core", "ghost", "spill", "rim", "far"];

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
    if (g && g.root.parentNode === el) return g;
    var root = document.createElement("span");
    root.className = "glint";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<span class="glint__clip"><i class="glint__pool"></i><i class="glint__spill"></i>' +
      '<i class="glint__ghost"></i><i class="glint__core"></i></span>' +
      '<span class="glint__ring"><i class="glint__rim"></i><i class="glint__far"></i></span>';
    if (getComputedStyle(el).position === "static") el.classList.add("glint-host");
    el.appendChild(root);
    g = { root: root };
    for (var i = 0; i < PIECES.length; i++) g[PIECES[i]] = root.querySelector(".glint__" + PIECES[i]).style;
    el.__glint = g;
    return g;
  }

  function off(el) {
    if (el.__glint) el.__glint.root.classList.remove("is-lit");
  }

  function at(style, x, y, turn) {
    style.transform =
      "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)" + (turn === undefined ? "" : " rotate(" + turn.toFixed(3) + "rad)");
  }

  function fade(style, v) {
    style.opacity = v.toFixed(3);
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

    var nowLit = [];
    for (var j = 0; j < near.length; j++) {
      var p = near[j][0];
      var b = near[j][1];
      var dist = near[j][2];
      var g = glint(p);
      // the light in the glint's own frame (the glint covers the pane's border too: 1px out)
      var x = light.x - b.left + 1;
      var y = light.y - b.top + 1;
      var hw = b.width / 2;
      var hh = b.height / 2;
      var cx = x - hw;
      var cy = y - hh;
      var len = Math.sqrt(cx * cx + cy * cy) || 1;
      var ux = cx / len;
      var uy = cy / len;
      // how far out from the middle the light is, 0 to 1 at the pane's edge
      var out = Math.min(1, Math.max(Math.abs(cx) / (hw || 1), Math.abs(cy) / (hh || 1)));
      var inside = dist === 0;
      var face = inside ? 1 : Math.max(0, 1 - dist / FACE_REACH);
      var t = 1 - dist / REACH;
      var rim = inside ? 0.45 + 0.55 * out * out : t * t * (3 - 2 * t);
      var turn = Math.atan2(uy, ux);

      at(g.pool, x, y);
      at(g.core, x, y, turn);
      // the back face's image: nearer the middle, further off the more slanted the light comes in
      at(g.ghost, x - ux * (8 + 16 * out), y - uy * (8 + 16 * out));
      at(g.spill, x, y);
      at(g.rim, x, y);
      // light carried inside the glass comes out on the far side, through the middle
      at(g.far, hw - ux * hw * 1.05 + 1, hh - uy * hh * 1.05 + 1);
      // a reflection grows stronger toward the pane's edge, where the glass is seen more nearly edge-on
      fade(g.pool, face * (0.7 + 0.3 * out));
      fade(g.core, face * (0.6 + 0.4 * out));
      fade(g.ghost, face * 0.8);
      fade(g.spill, inside ? 0.3 * out : rim);
      fade(g.rim, rim);
      fade(g.far, inside ? 0.25 + 0.6 * out : 0);
      if (!g.root.classList.contains("is-lit")) g.root.classList.add("is-lit");
      nowLit.push(p);
    }
    for (var m = 0; m < lit.length; m++) if (nowLit.indexOf(lit[m]) < 0) off(lit[m]);
    lit = nowLit;

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
