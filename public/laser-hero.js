// Starts the laser room behind the page: the home page's (behind its hero, opening with a full-screen power-on)
// or another page's own (its stage names it: see components/room-stage.tsx and components/laser-room/rooms.ts).
//
// The page marks itself `is-launching` from an inline script in the hero before anything paints (see
// components/home-hero.tsx): the header, words and buttons wait while the sign powers on, then arrive as the
// camera pulls back (`is-landing`). Anything that goes wrong ends the launch and leaves the plain hero.
//
// Plain script, loaded by the hero itself, so the static site (which ships no React) and the development server
// share it. On the static site the scene bundle sits next to this file; in development it is the source module.
(function () {
  "use strict";

  // every page that has a room carries this script: only its first copy runs, and later ones ask it to look again
  if (window.frequencyShiftLaserHero) {
    window.frequencyShiftLaserHero();
    return;
  }

  var root = document.documentElement;
  var script = document.currentScript;
  var scriptUrl = script && script.src ? new URL(script.src, location.href) : null;
  var base = scriptUrl ? scriptUrl.pathname.replace(/\/laser-hero\.js$/, "") : "";
  var current = null;
  var landingTimer = 0;
  var SKIP_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"];

  var isStatic = !!document.querySelector("[data-static-pages-runtime]");

  // The static site has the built bundle next to this file. The app server (development) serves the source
  // module; a built app server has the bundle too, so that is the second try.
  function loadModule() {
    var bundle = base + "/laser-room/laser-room.js";
    if (isStatic) return import(bundle);
    return import("/components/laser-room/mount.ts").catch(function () {
      return import(bundle);
    });
  }

  function endLaunch(immediate) {
    if (!root.classList.contains("is-launching")) return;
    root.classList.remove("is-launching");
    if (immediate) return;
    root.classList.add("is-landing");
    window.clearTimeout(landingTimer);
    landingTimer = window.setTimeout(function () {
      root.classList.remove("is-landing");
    }, 2600);
  }

  function stop(entry, immediate) {
    SKIP_EVENTS.forEach(function (type) {
      window.removeEventListener(type, entry.skip);
    });
    window.clearTimeout(entry.safety);
    entry.controller.abort();
    if (entry.room) entry.room.destroy();
    if (entry.hero) entry.hero.classList.remove("has-laser");
    entry.stage.classList.remove("is-live");
    if (entry.host) entry.host.remove();
    root.classList.remove("has-room", "expects-room", "room-hosted");
    root.removeAttribute("data-room");
    endLaunch(immediate);
  }

  function roomOf(stage) {
    return (stage && stage.getAttribute("data-room")) || "home";
  }

  // The room's own files (the floor's two textures, and on the home page the sign's artwork) are asked for now,
  // alongside its code, instead of once the code has arrived and run: on a slow connection that is a round trip and
  // a download saved. Asked for exactly as the room asks for them later, so it finds them waiting.
  var preloaded = false;
  function preload(stage) {
    if (preloaded) return;
    preloaded = true;
    var phone = matchMedia("(pointer: coarse)").matches || innerWidth < 760;
    var suffix = phone ? "-phone" : "";
    var files = [
      ["image", base + "/media/laser-room/floor-albedo" + suffix + ".webp"],
      ["image", base + "/media/laser-room/floor-surface" + suffix + ".webp"],
    ];
    if (stage.closest(".home-hero")) {
      files.push(["fetch", base + "/media/brand/fs-icon-neon.svg"]);
      files.push(["fetch", base + "/media/brand/frequency-shift-wordmark-neon" + (phone ? "-mobile" : "") + ".svg"]);
    }
    files.forEach(function (file) {
      var link = document.createElement("link");
      link.rel = "preload";
      link.as = file[0];
      link.href = file[1];
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }

  function start() {
    var stage = document.querySelector("[data-laser-stage]");
    // A client-side navigation leaves the old page's scene behind: let it go. The stage is no proof of a new page:
    // going from one page to another, the page's renderer keeps the same stage element and only renames its room
    // (and two pages can share a room), so the room and the address are what tell a page from the last.
    if (current && (current.stage !== stage || current.name !== roomOf(stage) || current.path !== location.pathname)) {
      stop(current, true);
      current = null;
    }
    if (!stage) {
      endLaunch(true);
      return;
    }
    if (current) return;

    var hero = stage.closest(".home-hero");
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hero) {
      // another page's room: with reduced motion, or without WebGL, the page keeps its own plain ground
      if (reduced || !window.WebGL2RenderingContext) {
        root.classList.remove("expects-room");
        return;
      }
      // the band its neon hangs in is there from now, so nothing moves when the room arrives
      root.classList.add("expects-room");
    }
    root.setAttribute("data-room", roomOf(stage));
    if (!reduced && window.WebGL2RenderingContext) preload(stage);
    var launching = root.classList.contains("is-launching");
    if (launching && window.scrollY > 4) {
      // the browser restored a scrolled position: no launch over the middle of the page
      endLaunch(true);
      launching = false;
    }
    // On the static site the room lives in a stage of its own, outside the page, so it outlives the page: going
    // to another page, the camera travels along the room's wall to it (components/laser-room/travel.ts) and the
    // page's own stage is only a marker of which room it is.
    var host = null;
    if (isStatic && !reduced) {
      host = document.createElement("div");
      host.className = "room-host";
      host.setAttribute("aria-hidden", "true");
      document.body.insertBefore(host, document.body.firstChild);
      root.classList.add("room-hosted");
    }
    var entry = { stage: stage, host: host, name: roomOf(stage), path: location.pathname, hero: hero, controller: new AbortController(), room: null, safety: 0, skip: null };
    current = entry;

    entry.skip = function () {
      if (entry.room) entry.room.skipIntro();
      else endLaunch();
    };
    if (launching) {
      SKIP_EVENTS.forEach(function (type) {
        window.addEventListener(type, entry.skip, { passive: true });
      });
      // the scene should be running long before this: if it is not, show the page and let it catch up
      entry.safety = window.setTimeout(function () {
        endLaunch();
      }, 7000);
    }

    function fail(error) {
      if (error) console.warn("Laser hero unavailable:", error);
      if (current === entry) current = null;
      stop(entry, true);
    }

    loadModule()
      .then(function (mod) {
        return mod.mountLaserHero(stage, {
          base: base,
          container: host || undefined,
          travel: !!host,
          launch: launching,
          signal: entry.controller.signal,
          onStart: function () {
            if (hero) hero.classList.add("has-laser");
            stage.classList.add("is-live");
            if (host) host.classList.add("is-live");
            // the whole page now sits in the room (see "The whole room" in app/globals.css); with reduced motion
            // the home page's room stays a still behind the hero and the sections keep their own ground
            if (!reduced) root.classList.add("has-room");
          },
          onLaunchEnd: function () {
            SKIP_EVENTS.forEach(function (type) {
              window.removeEventListener(type, entry.skip);
            });
            window.clearTimeout(entry.safety);
            endLaunch();
          },
          onFail: function () {
            fail();
          },
        });
      })
      .then(function (room) {
        if (!room) return;
        entry.room = room;
        // the launch already timed out or was skipped: pull straight back to the hero
        if (launching && !root.classList.contains("is-launching")) room.skipIntro();
        // fonts and late layout can move the lockup after the first measure
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { room.relayout(); });
        window.addEventListener("load", function () { room.relayout(); }, { once: true });
      })
      .catch(fail);
  }

  window.frequencyShiftLaserHero = start;

  // On the static site there is no React to wait for. In development, start once React has hydrated the page
  // (SiteMotion marks the root), or the canvas would be a hydration mismatch.
  if (isStatic || root.classList.contains("motion-enabled")) {
    start();
  } else {
    var observer = new MutationObserver(function () {
      if (!root.classList.contains("motion-enabled")) return;
      observer.disconnect();
      start();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  }
})();
