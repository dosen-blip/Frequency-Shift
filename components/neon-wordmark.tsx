"use client";

import { useEffect, useRef } from "react";

type NeonWordmarkAssetProps = {
  className: string;
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

function NeonLogoAsset({
  className,
  interactive = false,
}: NeonWordmarkAssetProps & { interactive?: boolean }) {
  return (
    <span className={className}>
      {interactive ? (
        <object
          className="neon-wordmark__asset"
          data="/media/brand/fs-icon-neon.svg"
          tabIndex={-1}
        />
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
        schedule(() => path.classList.remove("is-proximity-flicker"), 840);
      }, delay);
    };

    const updateInteraction = () => {
      frame = 0;
      const lockupRect = lockup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const influence = viewportWidth <= 760 ? 74 : 112;
      const horizontalReach = influence * 1.25;
      const verticalReach = influence * 1.15;
      const nearLockup =
        lastPointerX >= lockupRect.left - horizontalReach &&
        lastPointerX <= lockupRect.right + horizontalReach &&
        lastPointerY >= lockupRect.top - verticalReach &&
        lastPointerY <= lockupRect.bottom + verticalReach;

      if (!nearLockup) {
        lockup.classList.remove("is-cursor-near");
        return;
      }

      lagX += (lastPointerX - lockupRect.left - lagX) * 0.38;
      lagY += (lastPointerY - lockupRect.top - lagY) * 0.38;
      lockup.style.setProperty("--neon-cursor-x", `${lagX}px`);
      lockup.style.setProperty("--neon-cursor-y", `${lagY}px`);
      lockup.classList.add("is-cursor-near");

      const activeObjects = Array.from(
        lockup.querySelectorAll<HTMLObjectElement>(
          ".neon-wordmark__layer--core .neon-wordmark__asset",
        ),
      ).filter((asset) => getComputedStyle(asset).display !== "none");

      const nearbyPaths = activeObjects
        .flatMap((asset) => {
          const svgDocument = asset.contentDocument;
          if (!svgDocument) return [];
          const objectRect = asset.getBoundingClientRect();
          return Array.from(
            svgDocument.querySelectorAll<SVGPathElement>("path"),
          ).map((path) => {
            const pathRect = path.getBoundingClientRect();
            const left = objectRect.left + pathRect.left;
            const right = objectRect.left + pathRect.right;
            const top = objectRect.top + pathRect.top;
            const bottom = objectRect.top + pathRect.bottom;
            const dx = Math.max(left - lastPointerX, 0, lastPointerX - right);
            const dy = Math.max(top - lastPointerY, 0, lastPointerY - bottom);
            return { path, distance: Math.hypot(dx, dy) };
          });
        })
        .filter(({ distance }) => distance <= influence)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      nearbyPaths.forEach(({ path, distance }, index) => {
        const proximityDelay = Math.round(
          index * 58 + (distance / influence) * 36,
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

    const coreObjects = Array.from(
      lockup.querySelectorAll<HTMLObjectElement>(
        ".neon-wordmark__layer--core .neon-wordmark__asset",
      ),
    );
    const embeddedCleanups = coreObjects.map((asset) => {
      let embeddedDocument: Document | null = null;
      const handleEmbeddedPointerMove = (event: PointerEvent) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        const assetRect = asset.getBoundingClientRect();
        lastPointerX = assetRect.left + event.clientX;
        lastPointerY = assetRect.top + event.clientY;
        if (!frame) frame = window.requestAnimationFrame(updateInteraction);
      };
      const connect = () => {
        embeddedDocument?.removeEventListener(
          "pointermove",
          handleEmbeddedPointerMove as EventListener,
        );
        embeddedDocument = asset.contentDocument;
        embeddedDocument?.addEventListener(
          "pointermove",
          handleEmbeddedPointerMove as EventListener,
          { passive: true },
        );
      };

      asset.addEventListener("load", connect);
      connect();

      return () => {
        asset.removeEventListener("load", connect);
        embeddedDocument?.removeEventListener(
          "pointermove",
          handleEmbeddedPointerMove as EventListener,
        );
      };
    });

    const handlePointerLeave = () => {
      lockup.classList.remove("is-cursor-near");
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
      embeddedCleanups.forEach((cleanup) => cleanup());
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
          <object
            className="neon-wordmark__asset neon-wordmark__asset--desktop"
            data="/media/brand/frequency-shift-wordmark-neon.svg"
            tabIndex={-1}
          />
          <object
            className="neon-wordmark__asset neon-wordmark__asset--mobile"
            data="/media/brand/frequency-shift-wordmark-neon-mobile.svg"
            tabIndex={-1}
          />
        </span>
      </div>
    </div>
  );
}
