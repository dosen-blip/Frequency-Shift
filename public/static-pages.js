(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var header = document.querySelector(".site-header");
  var mobileNav = document.querySelector(".mobile-nav");
  var menuButton = document.querySelector(".mobile-nav__toggle");
  var menuPanel = document.querySelector(".mobile-nav__panel");
  var menuBackdrop = document.querySelector(".mobile-nav__backdrop");
  var menuLinks = menuPanel ? menuPanel.querySelectorAll("a") : [];
  var revealElements = document.querySelectorAll("[data-reveal]");
  var hero = document.querySelector(".route-hero");
  var menuOpen = false;
  var scrollFrame = 0;
  var prefetched = {};

  function each(items, callback) {
    for (var index = 0; index < items.length; index += 1) {
      callback(items[index], index);
    }
  }

  function matches(query) {
    return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  }

  function reveal(element) {
    element.classList.remove("is-reveal-pending");
    element.classList.add("is-revealed");
  }

  function revealAll() {
    each(revealElements, reveal);
  }

  function prepareMobileNeon() {
    var coarse = matches("(hover: none), (pointer: coarse)");
    var compact = matches("(max-width: 760px)");
    if ((!coarse && !compact) || !("IntersectionObserver" in window)) return;

    var elements = document.querySelectorAll([
      ".event-card",
      ".archive-card > a",
      ".home-event__visual",
      ".home-memory__grid figure",
      ".button",
      ".mobile-nav__toggle",
      ".mobile-nav__panel a",
    ].join(","));

    root.classList.add("mobile-neon-enabled");

    var observer = new IntersectionObserver(
      function (entries) {
        each(entries, function (entry) {
          entry.target.classList.toggle(
            "is-mobile-neon-active",
            entry.isIntersecting && entry.intersectionRatio >= 0.15,
          );
        });
      },
      {
        threshold: [0.15, 0.45, 0.75],
        rootMargin: "-18% 0px -18% 0px",
      },
    );

    each(elements, function (element) {
      observer.observe(element);
    });
  }

  function prepareMotion() {
    var reduced = matches("(prefers-reduced-motion: reduce)");
    var coarse = matches("(hover: none), (pointer: coarse)");

    root.classList.add("motion-enabled");

    if (hero) {
      var heroMotion = "quick";

      if (!reduced) {
        try {
          if (!window.sessionStorage.getItem("frequency-shift:hero-played")) {
            heroMotion = "full";
            window.sessionStorage.setItem("frequency-shift:hero-played", "true");
          }
        } catch {
          heroMotion = "quick";
        }
      }

      hero.setAttribute("data-hero-motion", heroMotion);
      hero.getClientRects();
      hero.classList.add("is-motion-ready");
    }

    if (reduced || coarse || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    // Arm the fail-open path before any optional browser API is constructed.
    window.setTimeout(revealAll, 1400);

    var observer = new IntersectionObserver(
      function (entries) {
        each(entries, function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" },
    );

    each(revealElements, function (element) {
      element.classList.add("is-reveal-pending");
      observer.observe(element);
    });

  }

  function prepareNeonProximity() {
    var lockup = document.querySelector(".neon-lockup");
    if (!lockup || matches("(prefers-reduced-motion: reduce)") || matches("(hover: none), (pointer: coarse)")) return;

    var overlays = lockup.querySelectorAll(".neon-wordmark__flicker-overlay");
    var frame = 0;
    var pointerX = 0;
    var pointerY = 0;
    var lagX = 0;
    var lagY = 0;
    var trailFadeTimer = 0;

    each(overlays, function (overlay) {
      var base = overlay.parentNode.querySelector(".neon-wordmark__interactive-base");
      if (!base || typeof window.fetch !== "function") return;

      window.fetch(base.currentSrc || base.src, { credentials: "same-origin" })
        .then(function (response) {
          if (!response.ok) throw new Error("Neon asset unavailable");
          return response.text();
        })
        .then(function (markup) {
          var parsed = new DOMParser().parseFromString(markup, "image/svg+xml");
          var svg = parsed.documentElement;
          if (!svg || svg.tagName.toLowerCase() !== "svg") return;
          svg.classList.add("neon-wordmark__inline-svg");
          svg.setAttribute("aria-hidden", "true");
          overlay.replaceChildren(svg);
          overlay.setAttribute("data-interactive-ready", "true");
        })
        .catch(function () {
          overlay.setAttribute("data-interactive-ready", "false");
        });
    });

    function keepTrailVisible() {
      if (trailFadeTimer) {
        window.clearTimeout(trailFadeTimer);
        trailFadeTimer = 0;
      }
      lockup.classList.add("is-cursor-near");
    }

    function fadeTrail(delay) {
      if (trailFadeTimer) return;
      trailFadeTimer = window.setTimeout(function () {
        trailFadeTimer = 0;
        lockup.classList.remove("is-cursor-near");
      }, delay || 520);
    }

    function strike(path, delay) {
      var now = window.performance.now();
      var previous = path._frequencyShiftLastStrike || 0;
      if (now - previous < 520) return;
      path._frequencyShiftLastStrike = now + delay;

      window.setTimeout(function () {
        path.classList.remove("is-proximity-flicker");
        path.getBoundingClientRect();
        path.classList.add("is-proximity-flicker");
        window.setTimeout(function () {
          path.classList.remove("is-proximity-flicker");
        }, 1220);
      }, delay);
    }

    function updateInteraction() {
      frame = 0;
      var rect = lockup.getBoundingClientRect();
      var influence = window.innerWidth <= 760
        ? 104
        : Math.min(180, Math.max(138, rect.width * 0.12));
      var horizontalReach = influence * 1.5;
      var verticalReach = influence * 1.35;
      var near =
        pointerX >= rect.left - horizontalReach &&
        pointerX <= rect.right + horizontalReach &&
        pointerY >= rect.top - verticalReach &&
        pointerY <= rect.bottom + verticalReach;

      if (!near) {
        fadeTrail(520);
        return;
      }

      lagX += (pointerX - rect.left - lagX) * 0.38;
      lagY += (pointerY - rect.top - lagY) * 0.38;
      lockup.style.setProperty("--neon-cursor-x", lagX + "px");
      lockup.style.setProperty("--neon-cursor-y", lagY + "px");
      keepTrailVisible();

      var nearby = [];
      each(overlays, function (overlay) {
        if (!overlay.getClientRects().length) return;
        each(overlay.querySelectorAll("path"), function (path) {
          var pathRect = path.getBoundingClientRect();
          var dx = Math.max(pathRect.left - pointerX, 0, pointerX - pathRect.right);
          var dy = Math.max(pathRect.top - pointerY, 0, pointerY - pathRect.bottom);
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= influence) nearby.push({ path: path, distance: distance });
        });
      });

      nearby.sort(function (first, second) {
        return first.distance - second.distance;
      });
      nearby = nearby.slice(0, 5);
      each(nearby, function (item, index) {
        strike(
          item.path,
          Math.round(index * 72 + (item.distance / influence) * 44),
        );
      });
    }

    window.addEventListener("pointermove", function (event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(updateInteraction);
    }, { passive: true });
    root.addEventListener("pointerleave", function () {
      fadeTrail(380);
    });
  }

  function updateHeader() {
    scrollFrame = 0;
    if (!header) return;
    if (window.pageYOffset > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }

  function requestHeaderUpdate() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateHeader);
  }

  function setMenu(open, restoreFocus) {
    if (!mobileNav || !menuButton || !menuPanel) return;
    menuOpen = open;

    if (open) {
      mobileNav.classList.add("is-open");
      if (header) header.classList.add("is-menu-open");
      body.classList.add("nav-open");
    } else {
      mobileNav.classList.remove("is-open");
      if (header) header.classList.remove("is-menu-open");
      body.classList.remove("nav-open");
    }

    menuButton.textContent = open ? "Close" : "Menu";
    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    menuPanel.setAttribute("aria-hidden", open ? "false" : "true");
    if (menuBackdrop) {
      menuBackdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
    each(menuLinks, function (link) {
      link.setAttribute("tabindex", open ? "0" : "-1");
    });

    if (!open && restoreFocus) {
      window.setTimeout(function () {
        menuButton.focus();
      }, 0);
    }
  }

  function prefetchLink(link) {
    if (typeof window.fetch !== "function") return;
    var resolver = document.createElement("a");
    resolver.href = link.href;
    if (resolver.host !== window.location.host || resolver.pathname === window.location.pathname) return;
    if (prefetched[resolver.href]) return;
    prefetched[resolver.href] = true;
    window.fetch(resolver.href, { credentials: "same-origin" }).catch(function () {
      delete prefetched[resolver.href];
    });
  }

  prepareMobileNeon();
  prepareMotion();
  prepareNeonProximity();
  updateHeader();
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      setMenu(!menuOpen, false);
    });
  }
  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", function () {
      setMenu(false, true);
    });
  }
  each(menuLinks, function (link) {
    link.addEventListener("click", function () {
      setMenu(false, false);
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menuOpen) setMenu(false, true);
  });

  // Warm the small HTML documents without replacing native link behavior.
  // A failed prefetch is harmless; the browser still follows the anchor.
  var internalLinks = document.querySelectorAll('a[href^="/"]');
  each(internalLinks, function (link) {
    link.addEventListener("mouseenter", function () { prefetchLink(link); });
    link.addEventListener("focus", function () { prefetchLink(link); });
  });
  window.setTimeout(function () {
    each(document.querySelectorAll(".site-nav a, .mobile-nav__panel a"), prefetchLink);
  }, 900);

  root.classList.add("nav-enhanced");
})();
