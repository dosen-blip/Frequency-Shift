"use client";

import { useEffect, useRef } from "react";

type NeonWordmarkAssetProps = {
  className: string;
};

type InteractiveNeonAssetProps = {
  className?: string;
  src: string;
};

function NeonWordmarkAsset({ className }: NeonWordmarkAssetProps) {
  return (
    <span className={className}>
      <img
        className="neon-wordmark__asset neon-wordmark__asset--desktop"
        src="/media/brand/frequency-shift-wordmark-neon.svg"
        alt=""
        loading="lazy"
      />
      <img
        className="neon-wordmark__asset neon-wordmark__asset--mobile"
        src="/media/brand/frequency-shift-wordmark-neon-mobile.svg"
        alt=""
        loading="lazy"
      />
    </span>
  );
}

function InteractiveNeonAsset({
  className,
  src,
}: InteractiveNeonAssetProps) {
  const overlayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;

    if (reducedMotion || coarsePointer) return;

    const controller = new AbortController();

    void fetch(src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load interactive neon asset: ${src}`);
        }
        return response.text();
      })
      .then((markup) => {
        const document = new DOMParser().parseFromString(
          markup,
          "image/svg+xml",
        );
        const svg = document.documentElement;
        if (svg.tagName.toLowerCase() !== "svg") return;

        svg.classList.add("neon-wordmark__inline-svg");
        svg.setAttribute("aria-hidden", "true");
        overlay.replaceChildren(svg);
        overlay.dataset.interactiveReady = "true";
      })
      .catch((error: unknown) => {
        if (
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          overlay.dataset.interactiveReady = "false";
        }
      });

    return () => controller.abort();
  }, [src]);

  return (
    <span
      className={`neon-wordmark__asset neon-wordmark__interactive-asset${className ? ` ${className}` : ""}`}
    >
      <img
        className="neon-wordmark__interactive-base"
        src={src}
        alt=""
      />
      <span
        ref={overlayRef}
        className="neon-wordmark__flicker-overlay"
        aria-hidden="true"
      />
    </span>
  );
}

function NeonLogoAsset({
  className,
  interactive = false,
}: NeonWordmarkAssetProps & { interactive?: boolean }) {
  return (
    <span className={className}>
      {interactive ? (
        <InteractiveNeonAsset src="/media/brand/fs-icon-neon.svg" />
      ) : (
        <img
          className="neon-wordmark__asset"
          src="/media/brand/fs-icon-neon.svg"
          alt=""
          loading="lazy"
        />
      )}
    </span>
  );
}

export function NeonWordmark() {
  const lockupRef = useRef<HTMLDivElement>(null);
  const activeTimers = useRef<Set<number>>(new Set());
  const lastStrike = useRef(new WeakMap<SVGPathElement, number>());

  useEffect(() => {
    const lockup = lockupRef.current;
    if (!lockup) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;

    if (reducedMotion || coarsePointer) return;

    let frame = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lagX = 0;
    let lagY = 0;
    let trailFadeTimer = 0;
    const timers = activeTimers.current;

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };

    const strike = (path: SVGPathElement, delay = 0) => {
      const now = performance.now();
      const previousStrike = lastStrike.current.get(path) ?? 0;
      if (now - previousStrike < 520) return;
      lastStrike.current.set(path, now + delay);

      schedule(() => {
        path.classList.remove("is-proximity-flicker");
        void path.getBoundingClientRect();
        path.classList.add("is-proximity-flicker");
        schedule(() => path.classList.remove("is-proximity-flicker"), 1220);
      }, delay);
    };

    const keepTrailVisible = () => {
      if (trailFadeTimer) {
        window.clearTimeout(trailFadeTimer);
        timers.delete(trailFadeTimer);
        trailFadeTimer = 0;
      }
      lockup.classList.add("is-cursor-near");
    };

    const fadeTrail = (delay = 520) => {
      if (trailFadeTimer) return;
      trailFadeTimer = window.setTimeout(() => {
        timers.delete(trailFadeTimer);
        trailFadeTimer = 0;
        lockup.classList.remove("is-cursor-near");
      }, delay);
      timers.add(trailFadeTimer);
    };

    const updateInteraction = () => {
      frame = 0;
      const lockupRect = lockup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const influence =
        viewportWidth <= 760
          ? 104
          : Math.min(180, Math.max(138, lockupRect.width * 0.12));
      const horizontalReach = influence * 1.5;
      const verticalReach = influence * 1.35;
      const nearLockup =
        lastPointerX >= lockupRect.left - horizontalReach &&
        lastPointerX <= lockupRect.right + horizontalReach &&
        lastPointerY >= lockupRect.top - verticalReach &&
        lastPointerY <= lockupRect.bottom + verticalReach;

      if (!nearLockup) {
        fadeTrail();
        return;
      }

      lagX += (lastPointerX - lockupRect.left - lagX) * 0.38;
      lagY += (lastPointerY - lockupRect.top - lagY) * 0.38;
      lockup.style.setProperty("--neon-cursor-x", `${lagX}px`);
      lockup.style.setProperty("--neon-cursor-y", `${lagY}px`);
      keepTrailVisible();

      const activeOverlays = Array.from(
        lockup.querySelectorAll<HTMLSpanElement>(
          ".neon-wordmark__layer--core .neon-wordmark__flicker-overlay",
        ),
      ).filter((overlay) => overlay.getClientRects().length > 0);

      const nearbyPaths = activeOverlays
        .flatMap((overlay) => {
          return Array.from(
            overlay.querySelectorAll<SVGPathElement>("path"),
          ).map((path) => {
            const pathRect = path.getBoundingClientRect();
            const dx = Math.max(
              pathRect.left - lastPointerX,
              0,
              lastPointerX - pathRect.right,
            );
            const dy = Math.max(
              pathRect.top - lastPointerY,
              0,
              lastPointerY - pathRect.bottom,
            );
            return { path, distance: Math.hypot(dx, dy) };
          });
        })
        .filter(({ distance }) => distance <= influence)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      nearbyPaths.forEach(({ path, distance }, index) => {
        const proximityDelay = Math.round(
          index * 72 + (distance / influence) * 44,
        );
        strike(path, proximityDelay);
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(updateInteraction);
    };

    const handlePointerLeave = () => {
      fadeTrail(380);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach(window.clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <div ref={lockupRef} className="neon-lockup" aria-hidden="true">
      <span
        className="neon-wordmark__cursor-trail"
      />
      <div className="neon-logo">
        <NeonLogoAsset className="neon-wordmark__layer neon-wordmark__layer--ambient" />
        <NeonLogoAsset className="neon-wordmark__layer neon-wordmark__layer--bloom" />
        <NeonLogoAsset
          className="neon-wordmark__layer neon-wordmark__layer--core"
          interactive
        />
      </div>
      <div className="neon-wordmark">
        <NeonWordmarkAsset className="neon-wordmark__layer neon-wordmark__layer--ambient" />
        <NeonWordmarkAsset className="neon-wordmark__layer neon-wordmark__layer--bloom" />
        <span
          className="neon-wordmark__layer neon-wordmark__layer--core"
        >
          <InteractiveNeonAsset
            className="neon-wordmark__asset--desktop"
            src="/media/brand/frequency-shift-wordmark-neon.svg"
          />
          <InteractiveNeonAsset
            className="neon-wordmark__asset--mobile"
            src="/media/brand/frequency-shift-wordmark-neon-mobile.svg"
          />
        </span>
      </div>
    </div>
  );
}
