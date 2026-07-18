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

  prepareMotion();
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
