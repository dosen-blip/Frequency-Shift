"use client";

import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  REALTIME_GLASS_EDGE_REFRACTION_SCALE,
  REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR,
  REALTIME_GLASS_OPTICAL_SHOULDER_LIMIT,
  REALTIME_GLASS_OPTICAL_SHOULDER_MAX,
  REALTIME_GLASS_OPTICAL_SHOULDER_MIN,
  REALTIME_GLASS_OPTICAL_SHOULDER_RATIO,
  evaluateGlassNormalizedRefractionResponse,
} from "./realtime-glass-optical-response";
import styles from "./true-glass.module.css";

export type GlassTone = "clear" | "smoked" | "signal";
export type GlassDepth = "shallow" | "deep";

type GlassOptions = {
  tone?: GlassTone;
  depth?: GlassDepth;
  radius?: string;
  displacementScale?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  blurAmount?: number;
  saturation?: number;
  overLight?: boolean;
};

type GlassCSSProperties = CSSProperties & {
  "--glass-radius"?: string;
  "--glass-blur"?: string;
  "--glass-saturation"?: string;
  "--glass-elastic-x"?: string;
  "--glass-elastic-y"?: string;
  "--glass-scale-x"?: string;
  "--glass-scale-y"?: string;
  "--glass-light-x"?: string;
  "--glass-light-y"?: string;
  "--glass-light-angle"?: string;
  "--glass-light-opacity"?: string;
  "--glass-transmission-x"?: string;
  "--glass-transmission-y"?: string;
  "--glass-transmission-angle"?: string;
  "--glass-transmission-opacity"?: string;
  "--glass-rim-energy"?: string;
};

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type GlassMeasurement = {
  width: number;
  height: number;
  radius: number;
};

type GlassFilterHandles = {
  setNormalMatrix: (node: SVGFEColorMatrixElement | null) => void;
  setRedDisplacement: (node: SVGFEDisplacementMapElement | null) => void;
  setGreenDisplacement: (node: SVGFEDisplacementMapElement | null) => void;
  setBlueDisplacement: (node: SVGFEDisplacementMapElement | null) => void;
};

type GlassPointerCallbacks<T extends HTMLElement> = {
  onPointerEnter?: (event: ReactPointerEvent<T>) => void;
  onPointerMove?: (event: ReactPointerEvent<T>) => void;
  onPointerLeave?: (event: ReactPointerEvent<T>) => void;
  onPointerDown?: (event: ReactPointerEvent<T>) => void;
  onPointerUp?: (event: ReactPointerEvent<T>) => void;
  onPointerCancel?: (event: ReactPointerEvent<T>) => void;
  onLostPointerCapture?: (event: ReactPointerEvent<T>) => void;
};

type GlassMotionState = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  energy: number;
  energyVelocity: number;
  speed: number;
  speedVelocity: number;
  targetX: number;
  targetY: number;
  targetEnergy: number;
  targetSpeed: number;
  hovered: boolean;
  pressed: boolean;
  lastClientX: number;
  lastClientY: number;
  lastEventTime: number;
  lastFrameTime: number;
};

type GlassBounds = {
  rect: DOMRect;
  scrollX: number;
  scrollY: number;
};

const IDENTITY_NORMAL_MATRIX = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0";
let activeGlassOwner: symbol | null = null;
let resetActiveGlass: (() => void) | null = null;

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function stepSpring(
  value: number,
  velocity: number,
  target: number,
  deltaTime: number,
  frequency: number,
  damping: number,
) {
  const stiffness = frequency * frequency;
  const friction = 2 * damping * frequency;
  const acceleration = stiffness * (target - value) - friction * velocity;
  const nextVelocity = velocity + acceleration * deltaTime;
  return [value + nextVelocity * deltaTime, nextVelocity] as const;
}

function eventTargetsNestedGlass<T extends HTMLElement>(event: ReactPointerEvent<T>) {
  const eventTarget = event.target;
  return eventTarget instanceof Element
    && eventTarget.closest("[data-glass-root]") !== event.currentTarget;
}

function glassControlIsDisabled<T extends HTMLElement>(event: ReactPointerEvent<T>) {
  return "disabled" in event.currentTarget
    && Boolean((event.currentTarget as T & { disabled?: boolean }).disabled);
}

const displacementMapCache = new Map<string, string>();

function roundedRectangleDistance(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const qx = Math.abs(x - width / 2) - (width / 2 - radius);
  const qy = Math.abs(y - height / 2) - (height / 2 - radius);
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

/**
 * Builds an RGB displacement texture once per measured size. Red stores the
 * horizontal lens vector and blue stores the vertical vector. Neutral grey
 * leaves the center untouched while the vectors accelerate toward the edge.
 */
function generateDisplacementMap({ width, height, radius }: GlassMeasurement) {
  if (typeof document === "undefined" || width < 2 || height < 2) return "";

  const cacheKey = `${width}:${height}:${radius}`;
  const cachedMap = displacementMapCache.get(cacheKey);
  if (cachedMap) return cachedMap;

  const resolutionScale = Math.min(1, 320 / Math.max(width, height));
  const mapWidth = Math.max(24, Math.round(width * resolutionScale));
  const mapHeight = Math.max(24, Math.round(height * resolutionScale));
  const mapRadius = Math.max(1, Math.min(radius * resolutionScale, Math.min(mapWidth, mapHeight) / 2));
  const shortSide = Math.min(mapWidth, mapHeight);
  const glassThickness = Math.min(
    Math.max(
      REALTIME_GLASS_OPTICAL_SHOULDER_MIN * resolutionScale,
      Math.min(
        REALTIME_GLASS_OPTICAL_SHOULDER_MAX * resolutionScale,
        shortSide * REALTIME_GLASS_OPTICAL_SHOULDER_RATIO,
      ),
    ),
    shortSide * REALTIME_GLASS_OPTICAL_SHOULDER_LIMIT,
  );
  const canvas = document.createElement("canvas");
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext("2d");
  if (!context) return "";

  const image = context.createImageData(mapWidth, mapHeight);
  const pixels = image.data;

  for (let y = 0; y < mapHeight; y += 1) {
    for (let x = 0; x < mapWidth; x += 1) {
      const index = (y * mapWidth + x) * 4;
      const signedDistance = roundedRectangleDistance(
        x + 0.5,
        y + 0.5,
        mapWidth,
        mapHeight,
        mapRadius,
      );

      if (signedDistance > 0) {
        pixels[index] = 128;
        pixels[index + 1] = 0;
        pixels[index + 2] = 128;
        pixels[index + 3] = 255;
        continue;
      }

      const inwardDistance = -signedDistance;
      const refraction = evaluateGlassNormalizedRefractionResponse(
        inwardDistance / glassThickness,
      );
      const gradientStep = 0.7;
      const gradientX = roundedRectangleDistance(
        x + 0.5 + gradientStep,
        y + 0.5,
        mapWidth,
        mapHeight,
        mapRadius,
      ) - roundedRectangleDistance(
        x + 0.5 - gradientStep,
        y + 0.5,
        mapWidth,
        mapHeight,
        mapRadius,
      );
      const gradientY = roundedRectangleDistance(
        x + 0.5,
        y + 0.5 + gradientStep,
        mapWidth,
        mapHeight,
        mapRadius,
      ) - roundedRectangleDistance(
        x + 0.5,
        y + 0.5 - gradientStep,
        mapWidth,
        mapHeight,
        mapRadius,
      );
      const gradientLength = Math.hypot(gradientX, gradientY) || 1;
      const surfaceNormalX = gradientX / gradientLength;
      const surfaceNormalY = gradientY / gradientLength;

      pixels[index] = Math.round(128 + surfaceNormalX * refraction * 126);
      pixels[index + 1] = Math.round(refraction * 255);
      pixels[index + 2] = Math.round(128 + surfaceNormalY * refraction * 126);
      pixels[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  const map = canvas.toDataURL("image/png");
  if (displacementMapCache.size >= 40) {
    const oldestKey = displacementMapCache.keys().next().value;
    if (oldestKey) displacementMapCache.delete(oldestKey);
  }
  displacementMapCache.set(cacheKey, map);
  return map;
}

function useLiquidGlass<T extends HTMLElement>(
  elasticity: number,
  displacementScale: number,
  aberrationIntensity: number,
  interactiveTouch: boolean,
  callbacks: GlassPointerCallbacks<T>,
) {
  const rootRef = useRef<T>(null);
  const frameRef = useRef<number | null>(null);
  const boundsRef = useRef<GlassBounds | null>(null);
  const ownerRef = useRef(Symbol("liquid-glass-owner"));
  const reducedMotionRef = useRef(false);
  const callbacksRef = useRef(callbacks);
  const optionsRef = useRef({
    elasticity,
    displacementScale,
    aberrationIntensity,
    interactiveTouch,
  });
  const normalMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const redDisplacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenDisplacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueDisplacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const motionRef = useRef<GlassMotionState>({
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    energy: 0,
    energyVelocity: 0,
    speed: 0,
    speedVelocity: 0,
    targetX: 0,
    targetY: 0,
    targetEnergy: 0,
    targetSpeed: 0,
    hovered: false,
    pressed: false,
    lastClientX: 0,
    lastClientY: 0,
    lastEventTime: 0,
    lastFrameTime: 0,
  });
  const renderFrameRef = useRef<(time: number) => void>(() => undefined);
  const [displacementMap, setDisplacementMap] = useState("");

  const filterHandles: GlassFilterHandles = {
    setNormalMatrix: useCallback((node) => {
      normalMatrixRef.current = node;
    }, []),
    setRedDisplacement: useCallback((node) => {
      redDisplacementRef.current = node;
    }, []),
    setGreenDisplacement: useCallback((node) => {
      greenDisplacementRef.current = node;
    }, []),
    setBlueDisplacement: useCallback((node) => {
      blueDisplacementRef.current = node;
    }, []),
  };

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    optionsRef.current = {
      elasticity,
      displacementScale,
      aberrationIntensity,
      interactiveTouch,
    };
  }, [aberrationIntensity, displacementScale, elasticity, interactiveTouch]);

  const applyOpticalState = useCallback((forceNeutral = false) => {
    const root = rootRef.current;
    if (!root) return;

    const motion = motionRef.current;
    const options = optionsRef.current;
    const x = forceNeutral ? 0 : clamp(motion.x, -1, 1);
    const y = forceNeutral ? 0 : clamp(motion.y, -1, 1);
    const energy = forceNeutral ? 0 : clamp(motion.energy, 0, 1);
    const speed = forceNeutral ? 0 : clamp(motion.speed, 0, 1);
    const rotation = forceNeutral
      ? 0
      : clamp((x - y) * 4.2 + (motion.velocityX - motion.velocityY) * 0.12, -7.5, 7.5);
    const angle = rotation * (Math.PI / 180);
    const anisotropyX = 1 + energy * (Math.abs(x) * 0.065 - Math.abs(y) * 0.018);
    const anisotropyY = 1 + energy * (Math.abs(y) * 0.065 - Math.abs(x) * 0.018);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const aXX = anisotropyX * cosine;
    const aXY = -anisotropyY * sine;
    const aYX = anisotropyX * sine;
    const aYY = anisotropyY * cosine;
    const biasX = x * (0.035 + energy * 0.075);
    const biasY = y * (0.035 + energy * 0.075);
    const offsetR = 0.5 * (1 - aXX - aXY);
    const offsetB = 0.5 * (1 - aYX - aYY);
    const normalMatrix = forceNeutral
      ? IDENTITY_NORMAL_MATRIX
      : `${aXX.toFixed(5)} ${(biasX * 0.5).toFixed(5)} ${aXY.toFixed(5)} 0 ${offsetR.toFixed(5)}  0 1 0 0 0  ${aYX.toFixed(5)} ${(biasY * 0.5).toFixed(5)} ${aYY.toFixed(5)} 0 ${offsetB.toFixed(5)}  0 0 0 1 0`;
    normalMatrixRef.current?.setAttribute("values", normalMatrix);

    const liveScale = options.displacementScale
      * REALTIME_GLASS_EDGE_REFRACTION_SCALE
      * (1 + energy * 0.14 + speed * 0.08);
    // Aberration is a total output-pixel budget around the shared green ray,
    // rather than a percentage that grows explosively with displacement.
    const totalChromaticSpread = Math.min(
      Math.max(options.aberrationIntensity, 0),
      REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR,
    );
    const halfChromaticSpread = totalChromaticSpread * 0.5;
    redDisplacementRef.current?.setAttribute(
      "scale",
      String(-(liveScale + halfChromaticSpread)),
    );
    greenDisplacementRef.current?.setAttribute("scale", String(-liveScale));
    blueDisplacementRef.current?.setAttribute(
      "scale",
      String(-Math.max(0, liveScale - halfChromaticSpread)),
    );

    const pull = options.elasticity * (0.52 + energy * 0.48);
    const scaleX = 1 + energy * (Math.abs(x) * 0.012 - Math.abs(y) * 0.004);
    const scaleY = 1 + energy * (Math.abs(y) * 0.012 - Math.abs(x) * 0.004);
    root.style.setProperty("--glass-elastic-x", `${(x * pull * 6).toFixed(3)}px`);
    root.style.setProperty("--glass-elastic-y", `${(y * pull * 6).toFixed(3)}px`);
    root.style.setProperty("--glass-scale-x", scaleX.toFixed(5));
    root.style.setProperty("--glass-scale-y", scaleY.toFixed(5));
    root.style.setProperty("--glass-light-x", `${(x * 2.35).toFixed(3)}%`);
    root.style.setProperty("--glass-light-y", `${(y * 1.85).toFixed(3)}%`);
    root.style.setProperty("--glass-light-angle", `${rotation.toFixed(3)}deg`);
    root.style.setProperty("--glass-light-opacity", (0.58 + energy * 0.045).toFixed(4));
    root.style.setProperty("--glass-transmission-x", `${(-x * 1.45).toFixed(3)}%`);
    root.style.setProperty("--glass-transmission-y", `${(-y * 1.15).toFixed(3)}%`);
    root.style.setProperty("--glass-transmission-angle", `${(-rotation * 0.62).toFixed(3)}deg`);
    root.style.setProperty("--glass-transmission-opacity", (0.44 + energy * 0.03).toFixed(4));
    root.style.setProperty("--glass-rim-energy", (0.44 + energy * 0.07).toFixed(4));
  }, []);

  const stopAndReset = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const motion = motionRef.current;
    Object.assign(motion, {
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      energy: 0,
      energyVelocity: 0,
      speed: 0,
      speedVelocity: 0,
      targetX: 0,
      targetY: 0,
      targetEnergy: 0,
      targetSpeed: 0,
      hovered: false,
      pressed: false,
      lastFrameTime: 0,
    });
    applyOpticalState(true);
    rootRef.current?.removeAttribute("data-glass-active");
  }, [applyOpticalState]);

  const scheduleMotion = useCallback(() => {
    if (reducedMotionRef.current || frameRef.current !== null) return;
    if (rootRef.current) rootRef.current.dataset.glassActive = "true";
    frameRef.current = requestAnimationFrame((time) => renderFrameRef.current(time));
  }, []);

  const renderFrame = useCallback((time: number) => {
    frameRef.current = null;
    const root = rootRef.current;
    if (!root || reducedMotionRef.current) {
      stopAndReset();
      return;
    }

    const motion = motionRef.current;
    const deltaTime = clamp(
      motion.lastFrameTime ? (time - motion.lastFrameTime) / 1000 : 1 / 60,
      1 / 240,
      1 / 30,
    );
    motion.lastFrameTime = time;
    [motion.x, motion.velocityX] = stepSpring(
      motion.x,
      motion.velocityX,
      motion.targetX,
      deltaTime,
      20,
      0.8,
    );
    [motion.y, motion.velocityY] = stepSpring(
      motion.y,
      motion.velocityY,
      motion.targetY,
      deltaTime,
      20,
      0.8,
    );
    [motion.energy, motion.energyVelocity] = stepSpring(
      motion.energy,
      motion.energyVelocity,
      motion.targetEnergy,
      deltaTime,
      18,
      0.82,
    );
    [motion.speed, motion.speedVelocity] = stepSpring(
      motion.speed,
      motion.speedVelocity,
      motion.targetSpeed,
      deltaTime,
      22,
      0.84,
    );
    motion.targetSpeed *= Math.exp(-12 * deltaTime);

    applyOpticalState();

    const moving = Math.abs(motion.x - motion.targetX) > 0.001
      || Math.abs(motion.y - motion.targetY) > 0.001
      || Math.abs(motion.energy - motion.targetEnergy) > 0.001
      || Math.abs(motion.speed - motion.targetSpeed) > 0.001
      || Math.abs(motion.velocityX) > 0.008
      || Math.abs(motion.velocityY) > 0.008
      || Math.abs(motion.energyVelocity) > 0.008
      || Math.abs(motion.speedVelocity) > 0.008;

    if (moving) {
      scheduleMotion();
      return;
    }

    motion.x = motion.targetX;
    motion.y = motion.targetY;
    motion.energy = motion.targetEnergy;
    motion.speed = motion.targetSpeed;
    motion.velocityX = 0;
    motion.velocityY = 0;
    motion.energyVelocity = 0;
    motion.speedVelocity = 0;
    motion.lastFrameTime = 0;
    applyOpticalState();
    root.removeAttribute("data-glass-active");
    if (
      motion.targetEnergy === 0
      && motion.targetX === 0
      && motion.targetY === 0
      && activeGlassOwner === ownerRef.current
    ) {
      activeGlassOwner = null;
      resetActiveGlass = null;
    }
  }, [applyOpticalState, scheduleMotion, stopAndReset]);

  useEffect(() => {
    renderFrameRef.current = renderFrame;
  }, [renderFrame]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const idleWindow = window as IdleWindow;
    let measurementKey = "";
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;
    let disposed = false;
    let latestMeasurement: GlassMeasurement | null = null;
    let shouldBuildOptics = typeof IntersectionObserver === "undefined";
    const userAgent = navigator.userAgent;
    const isIOSWebKit = /iP(?:hone|ad|od)/.test(userAgent)
      || (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
    const isChromium = !isIOSWebKit
      && /(?:Chrome|Chromium|CriOS|Edg|OPR)\//.test(userAgent)
      && !/(?:Firefox|FxiOS)\//.test(userAgent);
    root.dataset.glassRefraction = isChromium ? "full" : "fallback";

    const cancelScheduledMap = () => {
      if (idleHandle !== null) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
      idleHandle = null;
      timeoutHandle = null;
    };

    const scheduleMap = (measurement: GlassMeasurement) => {
      cancelScheduledMap();
      const build = () => {
        idleHandle = null;
        timeoutHandle = null;
        if (!disposed) setDisplacementMap(generateDisplacementMap(measurement));
      };

      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(build, { timeout: 280 });
      } else {
        timeoutHandle = window.setTimeout(build, 24);
      }
    };

    const measure = () => {
      const rect = root.getBoundingClientRect();
      boundsRef.current = {
        rect,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
      const computedRadius = Number.parseFloat(getComputedStyle(root).borderTopLeftRadius) || 0;
      const next = {
        width: Math.max(4, Math.round(rect.width / 4) * 4),
        height: Math.max(4, Math.round(rect.height / 4) * 4),
        radius: Math.max(0, Math.round(computedRadius / 2) * 2),
      };
      const nextKey = `${next.width}:${next.height}:${next.radius}`;
      if (nextKey === measurementKey) return;
      measurementKey = nextKey;
      latestMeasurement = next;
      if (!isChromium) {
        setDisplacementMap("");
        return;
      }
      if (!shouldBuildOptics) return;
      scheduleMap(next);
    };

    const initialFrame = requestAnimationFrame(measure);
    const visibilityObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            shouldBuildOptics = true;
            visibilityObserver?.disconnect();
            if (isChromium && latestMeasurement) scheduleMap(latestMeasurement);
          },
          { rootMargin: "320px 0px" },
        );
    visibilityObserver?.observe(root);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
    } else {
      observer = new ResizeObserver(measure);
      observer.observe(root);
    }

    return () => {
      disposed = true;
      cancelScheduledMap();
      cancelAnimationFrame(initialFrame);
      visibilityObserver?.disconnect();
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      reducedMotionRef.current = media.matches;
      if (media.matches) stopAndReset();
    };
    syncMotionPreference();
    media.addEventListener?.("change", syncMotionPreference);
    return () => media.removeEventListener?.("change", syncMotionPreference);
  }, [stopAndReset]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) stopAndReset();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [stopAndReset]);

  useEffect(() => () => {
    if (activeGlassOwner === ownerRef.current) {
      activeGlassOwner = null;
      resetActiveGlass = null;
    }
    stopAndReset();
  }, [stopAndReset]);

  const claimActiveLens = useCallback(() => {
    if (activeGlassOwner !== ownerRef.current) {
      resetActiveGlass?.();
      activeGlassOwner = ownerRef.current;
      resetActiveGlass = stopAndReset;
    }
  }, [stopAndReset]);

  const updatePointerTarget = useCallback((event: ReactPointerEvent<T>) => {
    const target = event.currentTarget;
    const cachedBounds = boundsRef.current;
    const needsBounds = !cachedBounds
      || cachedBounds.scrollX !== window.scrollX
      || cachedBounds.scrollY !== window.scrollY;
    const rect = needsBounds ? target.getBoundingClientRect() : cachedBounds.rect;
    if (needsBounds) {
      boundsRef.current = {
        rect,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
    }
    if (!rect.width || !rect.height) return;

    const motion = motionRef.current;
    const normalizedX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const normalizedY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    motion.targetX = (normalizedX - 0.5) * 2;
    motion.targetY = (normalizedY - 0.5) * 2;

    const now = event.timeStamp || performance.now();
    if (motion.lastEventTime > 0) {
      const elapsed = Math.max(8, now - motion.lastEventTime);
      const pointerVelocity = Math.hypot(
        event.clientX - motion.lastClientX,
        event.clientY - motion.lastClientY,
      ) / elapsed * 1000;
      motion.targetSpeed = Math.max(motion.targetSpeed, clamp(pointerVelocity / 1100, 0, 1));
    }
    motion.lastClientX = event.clientX;
    motion.lastClientY = event.clientY;
    motion.lastEventTime = now;
  }, []);

  const handlePointerEnter = useCallback((event: ReactPointerEvent<T>) => {
    callbacksRef.current.onPointerEnter?.(event);
    if (eventTargetsNestedGlass(event) || glassControlIsDisabled(event)) return;
    if (event.pointerType === "touch" || reducedMotionRef.current) return;
    claimActiveLens();
    boundsRef.current = {
      rect: event.currentTarget.getBoundingClientRect(),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
    const motion = motionRef.current;
    motion.hovered = true;
    motion.targetEnergy = 0.2;
    updatePointerTarget(event);
    scheduleMotion();
  }, [claimActiveLens, scheduleMotion, updatePointerTarget]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<T>) => {
    callbacksRef.current.onPointerMove?.(event);
    if (eventTargetsNestedGlass(event) || glassControlIsDisabled(event)) return;
    if (reducedMotionRef.current) return;
    if (event.pointerType === "touch" && !optionsRef.current.interactiveTouch) return;
    if (event.pointerType === "touch" && !motionRef.current.pressed) return;
    claimActiveLens();
    updatePointerTarget(event);
    scheduleMotion();
  }, [claimActiveLens, scheduleMotion, updatePointerTarget]);

  const handlePointerLeave = useCallback((event: ReactPointerEvent<T>) => {
    callbacksRef.current.onPointerLeave?.(event);
    if (eventTargetsNestedGlass(event)) return;
    const motion = motionRef.current;
    motion.hovered = false;
    if (!motion.pressed) {
      motion.targetX = 0;
      motion.targetY = 0;
      motion.targetEnergy = 0;
      motion.targetSpeed = 0;
    }
    boundsRef.current = null;
    scheduleMotion();
  }, [scheduleMotion]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<T>) => {
    callbacksRef.current.onPointerDown?.(event);
    if (eventTargetsNestedGlass(event) || glassControlIsDisabled(event)) return;
    if (reducedMotionRef.current) return;
    if (event.pointerType === "touch" && !optionsRef.current.interactiveTouch) return;
    claimActiveLens();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The pointer can disappear between dispatch and capture on some WebKit builds.
    }
    motionRef.current.pressed = true;
    motionRef.current.targetEnergy = event.pointerType === "touch" ? 0.9 : 0.58;
    updatePointerTarget(event);
    scheduleMotion();
  }, [claimActiveLens, scheduleMotion, updatePointerTarget]);

  const releasePointer = useCallback((event: ReactPointerEvent<T>) => {
    const motion = motionRef.current;
    motion.pressed = false;
    motion.targetEnergy = motion.hovered && event.pointerType !== "touch" ? 0.2 : 0;
    if (!motion.hovered || event.pointerType === "touch") {
      motion.targetX = 0;
      motion.targetY = 0;
    }
    motion.targetSpeed = 0;
    scheduleMotion();
  }, [scheduleMotion]);

  const handlePointerUp = useCallback((event: ReactPointerEvent<T>) => {
    callbacksRef.current.onPointerUp?.(event);
    if (eventTargetsNestedGlass(event)) return;
    releasePointer(event);
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Capture may already have been released by the user agent.
    }
  }, [releasePointer]);

  const handlePointerCancel = useCallback((event: ReactPointerEvent<T>) => {
    callbacksRef.current.onPointerCancel?.(event);
    if (eventTargetsNestedGlass(event)) return;
    motionRef.current.hovered = false;
    releasePointer(event);
  }, [releasePointer]);

  const handleLostPointerCapture = useCallback((event: ReactPointerEvent<T>) => {
    callbacksRef.current.onLostPointerCapture?.(event);
    if (eventTargetsNestedGlass(event)) return;
    motionRef.current.hovered = false;
    releasePointer(event);
  }, [releasePointer]);

  return {
    rootRef,
    displacementMap,
    filterHandles,
    handlePointerEnter,
    handlePointerMove,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    handleLostPointerCapture,
  };
}

function GlassFilter({
  id,
  map,
  displacementScale,
  aberrationIntensity,
  handles,
}: {
  id: string;
  map: string;
  displacementScale: number;
  aberrationIntensity: number;
  handles: GlassFilterHandles;
}) {
  if (!map) return null;

  const chromaticSpread = Math.min(
    Math.max(aberrationIntensity, 0),
    REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR,
  );
  const halfChromaticSpread = chromaticSpread * 0.5;
  const refractiveScale = displacementScale * REALTIME_GLASS_EDGE_REFRACTION_SCALE;
  const redScale = refractiveScale + halfChromaticSpread;
  const greenScale = refractiveScale;
  const blueScale = Math.max(0, refractiveScale - halfChromaticSpread);

  return (
    <svg className={styles.filterDefinition} aria-hidden="true">
      <defs>
        <filter id={id} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feImage
            href={map}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="DISPLACEMENT_MAP"
          />
          <feColorMatrix
            ref={(node) => handles.setNormalMatrix(node)}
            in="DISPLACEMENT_MAP"
            type="matrix"
            values={IDENTITY_NORMAL_MATRIX}
            result="DYNAMIC_DISPLACEMENT_MAP"
          />
          <feDisplacementMap ref={(node) => handles.setRedDisplacement(node)} in="SourceGraphic" in2="DYNAMIC_DISPLACEMENT_MAP" scale={-redScale} xChannelSelector="R" yChannelSelector="B" result="RED_DISPLACED" />
          <feColorMatrix in="RED_DISPLACED" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="RED_CHANNEL" />

          <feDisplacementMap ref={(node) => handles.setGreenDisplacement(node)} in="SourceGraphic" in2="DYNAMIC_DISPLACEMENT_MAP" scale={-greenScale} xChannelSelector="R" yChannelSelector="B" result="GREEN_DISPLACED" />
          <feColorMatrix in="GREEN_DISPLACED" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="GREEN_CHANNEL" />

          <feDisplacementMap ref={(node) => handles.setBlueDisplacement(node)} in="SourceGraphic" in2="DYNAMIC_DISPLACEMENT_MAP" scale={-blueScale} xChannelSelector="R" yChannelSelector="B" result="BLUE_DISPLACED" />
          <feColorMatrix in="BLUE_DISPLACED" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="BLUE_CHANNEL" />

          <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
          <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />
          {/* One continuously refracted source covers the whole lens. The map
              itself becomes neutral in the center, so there is no edge/center
              composite boundary for high-contrast content to expose. */}
          <feGaussianBlur in="RGB_COMBINED" stdDeviation="0.24" />
        </filter>
      </defs>
    </svg>
  );
}

function rootStyle(
  style: CSSProperties | undefined,
  radius: string,
  depth: GlassDepth,
  blurAmount: number | undefined,
  saturation: number,
  overLight: boolean,
): GlassCSSProperties {
  const defaultBlur = depth === "deep" ? 7 : 4;
  const resolvedBlur = (blurAmount ?? defaultBlur) + (overLight ? 8 : 0);
  return {
    "--glass-radius": radius,
    "--glass-blur": `${resolvedBlur}px`,
    "--glass-saturation": `${saturation}%`,
    "--glass-elastic-x": "0px",
    "--glass-elastic-y": "0px",
    "--glass-scale-x": "1",
    "--glass-scale-y": "1",
    "--glass-light-x": "0%",
    "--glass-light-y": "0%",
    "--glass-light-angle": "0deg",
    "--glass-light-opacity": "0.58",
    "--glass-transmission-x": "0%",
    "--glass-transmission-y": "0%",
    "--glass-transmission-angle": "0deg",
    "--glass-transmission-opacity": "0.44",
    "--glass-rim-energy": "0.44",
    ...style,
  };
}

function GlassOptics({
  filterId,
  filterUrl,
  map,
  displacementScale,
  aberrationIntensity,
  filterHandles,
}: {
  filterId: string;
  filterUrl: string;
  map: string;
  displacementScale: number;
  aberrationIntensity: number;
  filterHandles: GlassFilterHandles;
}) {
  return (
    <>
      <GlassFilter
        id={filterId}
        map={map}
        displacementScale={displacementScale}
        aberrationIntensity={aberrationIntensity}
        handles={filterHandles}
      />
      <span className={styles.opticalBody} aria-hidden="true">
        <span className={styles.warp} style={{ filter: filterUrl }} />
        <span className={styles.lensShade} />
        <span className={styles.environmentKey} />
        <span className={styles.environmentTransmission} />
        <span className={styles.diffuseRim} />
        <span className={styles.borderScreen} />
        <span className={styles.borderOverlay} />
      </span>
    </>
  );
}

export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement>, GlassOptions {
  contentClassName?: string;
}

export function GlassSurface({
  children,
  className,
  contentClassName,
  tone = "clear",
  depth = "deep",
  radius = "1.75rem",
  displacementScale = 34,
  aberrationIntensity = 0.85,
  elasticity = 0.22,
  blurAmount,
  saturation = 155,
  overLight = false,
  style,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  ...props
}: GlassSurfaceProps) {
  const rawId = useId();
  const filterId = `liquid-glass-${rawId.replace(/:/g, "")}`;
  const {
    rootRef,
    displacementMap,
    filterHandles,
    handlePointerEnter,
    handlePointerMove,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    handleLostPointerCapture,
  } = useLiquidGlass<HTMLDivElement>(
    elasticity,
    displacementScale,
    aberrationIntensity,
    false,
    {
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
    },
  );

  return (
    <div
      ref={rootRef}
      className={classNames(styles.root, styles.surface, className)}
      data-glass-tone={tone}
      data-glass-depth={depth}
      data-glass-root=""
      data-over-light={overLight || undefined}
      style={rootStyle(style, radius, depth, blurAmount, saturation, overLight)}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      {...props}
    >
      <GlassOptics
        filterId={filterId}
        filterUrl={displacementMap ? `url(#${filterId})` : "none"}
        map={displacementMap}
        displacementScale={displacementScale}
        aberrationIntensity={aberrationIntensity}
        filterHandles={filterHandles}
      />
      <div className={classNames(styles.surfaceContent, contentClassName)}>{children}</div>
    </div>
  );
}

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, GlassOptions {}

export function GlassButton({
  children,
  className,
  tone = "clear",
  depth = "shallow",
  radius = "999px",
  displacementScale = 28,
  aberrationIntensity = 0.72,
  elasticity = 0.32,
  blurAmount,
  saturation = 160,
  overLight = false,
  style,
  type = "button",
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  ...props
}: GlassButtonProps) {
  const rawId = useId();
  const filterId = `liquid-glass-${rawId.replace(/:/g, "")}`;
  const {
    rootRef,
    displacementMap,
    filterHandles,
    handlePointerEnter,
    handlePointerMove,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    handleLostPointerCapture,
  } = useLiquidGlass<HTMLButtonElement>(
    elasticity,
    displacementScale,
    aberrationIntensity,
    true,
    {
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
    },
  );

  return (
    <button
      ref={rootRef}
      className={classNames(styles.root, styles.control, className)}
      data-glass-tone={tone}
      data-glass-depth={depth}
      data-glass-root=""
      data-over-light={overLight || undefined}
      style={rootStyle(style, radius, depth, blurAmount, saturation, overLight)}
      type={type}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      {...props}
    >
      <GlassOptics
        filterId={filterId}
        filterUrl={displacementMap ? `url(#${filterId})` : "none"}
        map={displacementMap}
        displacementScale={displacementScale}
        aberrationIntensity={aberrationIntensity}
        filterHandles={filterHandles}
      />
      <span className={styles.controlContent}>{children}</span>
    </button>
  );
}

export interface GlassLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, GlassOptions {}

export function GlassLink({
  children,
  className,
  tone = "clear",
  depth = "shallow",
  radius = "999px",
  displacementScale = 28,
  aberrationIntensity = 0.72,
  elasticity = 0.32,
  blurAmount,
  saturation = 160,
  overLight = false,
  style,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  ...props
}: GlassLinkProps) {
  const rawId = useId();
  const filterId = `liquid-glass-${rawId.replace(/:/g, "")}`;
  const {
    rootRef,
    displacementMap,
    filterHandles,
    handlePointerEnter,
    handlePointerMove,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    handleLostPointerCapture,
  } = useLiquidGlass<HTMLAnchorElement>(
    elasticity,
    displacementScale,
    aberrationIntensity,
    true,
    {
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
    },
  );

  return (
    <a
      ref={rootRef}
      className={classNames(styles.root, styles.control, className)}
      data-glass-tone={tone}
      data-glass-depth={depth}
      data-glass-root=""
      data-over-light={overLight || undefined}
      style={rootStyle(style, radius, depth, blurAmount, saturation, overLight)}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      {...props}
    >
      <GlassOptics
        filterId={filterId}
        filterUrl={displacementMap ? `url(#${filterId})` : "none"}
        map={displacementMap}
        displacementScale={displacementScale}
        aberrationIntensity={aberrationIntensity}
        filterHandles={filterHandles}
      />
      <span className={styles.controlContent}>{children}</span>
    </a>
  );
}
