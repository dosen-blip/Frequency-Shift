"use client";

import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RealtimeGlassEngine,
  type RealtimeGlassLensOptions,
  type RealtimeGlassLensRegistration,
  type RealtimeGlassMetrics,
  type RealtimeGlassSource,
  type RealtimeGlassStatus,
} from "./realtime-glass-engine";
import styles from "./realtime-glass-stage.module.css";

export type RealtimeGlassStageApi = {
  registerLens: (
    element: HTMLElement,
    options?: RealtimeGlassLensOptions,
  ) => RealtimeGlassLensRegistration;
  invalidate: () => void;
  getStatus: () => RealtimeGlassStatus;
  getMetrics: () => RealtimeGlassMetrics;
};

export type RealtimeGlassStageProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Same-origin image or muted inline video mirrored into WebGL. */
  source?: RealtimeGlassSource;
  /** @deprecated Use `source={{ type: "image", src }}`. */
  backgroundSrc?: string;
  /** @deprecated Put `position` on `source`. */
  backgroundPosition?: readonly [x: number, y: number];
  children: ReactNode;
  onGlassStatusChange?: (status: RealtimeGlassStatus) => void;
  onGlassMetricsChange?: (metrics: RealtimeGlassMetrics) => void;
};

type RegistryEntry = {
  element: HTMLElement;
  options: RealtimeGlassLensOptions;
  engineRegistration: RealtimeGlassLensRegistration | null;
};

class RealtimeGlassRegistry implements RealtimeGlassStageApi {
  private engine: RealtimeGlassEngine | null = null;
  private entries = new Map<symbol, RegistryEntry>();
  private status: RealtimeGlassStatus = "pending";

  attachEngine(engine: RealtimeGlassEngine) {
    if (this.engine === engine) return;
    this.detachEngine();
    this.engine = engine;
    for (const entry of this.entries.values()) {
      entry.engineRegistration = engine.registerLens(entry.element, entry.options);
    }
  }

  detachEngine() {
    for (const entry of this.entries.values()) {
      entry.engineRegistration?.unregister();
      entry.engineRegistration = null;
    }
    this.engine = null;
  }

  setStatus(status: RealtimeGlassStatus) {
    this.status = status;
  }

  setBackground(backgroundSrc: string, position: readonly [number, number]) {
    this.engine?.setSource({ type: "image", src: backgroundSrc, position });
  }

  setSource(source: RealtimeGlassSource, element: HTMLImageElement | HTMLVideoElement | null) {
    this.engine?.setSource(source, element);
  }

  registerLens(element: HTMLElement, options: RealtimeGlassLensOptions = {}) {
    const id = Symbol("realtime-glass-registry-entry");
    const entry: RegistryEntry = {
      element,
      options,
      engineRegistration: this.engine?.registerLens(element, options) ?? null,
    };
    this.entries.set(id, entry);
    let registered = true;
    return {
      update: (nextOptions: RealtimeGlassLensOptions) => {
        if (!registered) return;
        entry.options = nextOptions;
        entry.engineRegistration?.update(nextOptions);
      },
      refresh: () => {
        if (!registered) return;
        entry.engineRegistration?.refresh();
      },
      unregister: () => {
        if (!registered) return;
        registered = false;
        entry.engineRegistration?.unregister();
        entry.engineRegistration = null;
        this.entries.delete(id);
      },
    } satisfies RealtimeGlassLensRegistration;
  }

  invalidate() {
    this.engine?.invalidate();
  }

  getStatus() {
    return this.status;
  }

  getMetrics() {
    return this.engine?.getMetrics() ?? {
      quality: "high",
      renderScale: 1,
      cpuFrameMs: 0,
      gpuFrameMs: null,
      frames: 0,
      renderReason: "idle",
    };
  }
}

const RealtimeGlassContext = createContext<RealtimeGlassStageApi | null>(null);

function clampPosition(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

export function RealtimeGlassStage({
  source,
  backgroundSrc,
  backgroundPosition = [0.5, 0.5],
  children,
  className,
  onGlassStatusChange,
  onGlassMetricsChange,
  ...props
}: RealtimeGlassStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const registry = useMemo(() => new RealtimeGlassRegistry(), []);
  const normalizedSource = useMemo<RealtimeGlassSource>(() => {
    if (source) return source;
    return {
      type: "image",
      src: backgroundSrc ?? "",
      position: backgroundPosition,
    };
  }, [backgroundPosition, backgroundSrc, source]);
  const sourcePosition = normalizedSource.position ?? backgroundPosition;
  const positionX = clampPosition(sourcePosition?.[0], 0.5);
  const positionY = clampPosition(sourcePosition?.[1], 0.5);
  const statusCallbackRef = useRef(onGlassStatusChange);
  const metricsCallbackRef = useRef(onGlassMetricsChange);
  const [initialConfig] = useState(() => ({
    source: normalizedSource,
    position: [positionX, positionY] as const,
  }));

  useEffect(() => {
    statusCallbackRef.current = onGlassStatusChange;
  }, [onGlassStatusChange]);

  useEffect(() => {
    metricsCallbackRef.current = onGlassMetricsChange;
  }, [onGlassMetricsChange]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const engine = new RealtimeGlassEngine({
      canvas,
      stage,
      source: { ...initialConfig.source, position: initialConfig.position },
      sourceElement: mediaRef.current,
      onStatusChange: (status) => {
        stage.dataset.realtimeGlassStatus = status;
        registry.setStatus(status);
        statusCallbackRef.current?.(status);
      },
      onMetricsChange: (metrics) => metricsCallbackRef.current?.(metrics),
    });
    registry.attachEngine(engine);
    return () => {
      registry.detachEngine();
      engine.destroy();
    };
  }, [initialConfig, registry]);

  useEffect(() => {
    registry.setSource(
      { ...normalizedSource, position: [positionX, positionY] },
      mediaRef.current,
    );
  }, [normalizedSource, positionX, positionY, registry]);

  const combinedClassName = className ? `${styles.stage} ${className}` : styles.stage;
  const objectPosition = `${positionX * 100}% ${positionY * 100}%`;

  return (
    <RealtimeGlassContext.Provider value={registry}>
      <div
        {...props}
        ref={stageRef}
        className={combinedClassName}
      >
        {normalizedSource.type === "video" ? (
          <video
            aria-hidden="true"
            autoPlay
            className={styles.backdrop}
            key={`video:${normalizedSource.src}`}
            loop={normalizedSource.loop ?? true}
            muted
            playsInline
            poster={normalizedSource.poster}
            ref={mediaRef as RefObject<HTMLVideoElement>}
            src={normalizedSource.src}
            style={{ objectPosition }}
          />
        ) : (
          <img
            alt=""
            aria-hidden="true"
            className={styles.backdrop}
            draggable="false"
            key={`image:${normalizedSource.src}`}
            ref={mediaRef as RefObject<HTMLImageElement>}
            src={normalizedSource.src}
            style={{ objectPosition }}
          />
        )}
        <canvas aria-hidden="true" className={styles.canvas} ref={canvasRef} />
        <div className={styles.content}>{children}</div>
      </div>
    </RealtimeGlassContext.Provider>
  );
}

export function useRealtimeGlassStage() {
  const context = useContext(RealtimeGlassContext);
  if (!context) {
    throw new Error("useRealtimeGlassStage must be used inside RealtimeGlassStage.");
  }
  return context;
}

/**
 * Registers an existing semantic element without introducing a wrapper. Motion
 * is driven imperatively by native pointer events and never enters React state.
 */
export function useRealtimeGlassLens<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  options: RealtimeGlassLensOptions = {},
) {
  const stage = useRealtimeGlassStage();
  const registrationRef = useRef<RealtimeGlassLensRegistration | null>(null);
  const [initialOptions] = useState(options);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const registration = stage.registerLens(element, initialOptions);
    registrationRef.current = registration;
    return () => {
      registration.unregister();
      if (registrationRef.current === registration) registrationRef.current = null;
    };
  }, [elementRef, initialOptions, stage]);

  useEffect(() => {
    registrationRef.current?.update(options);
  }, [options]);

  return useCallback(() => registrationRef.current?.refresh(), []);
}

export type {
  RealtimeGlassDebugMode,
  RealtimeGlassLensOptions,
  RealtimeGlassLensRegistration,
  RealtimeGlassMaterial,
  RealtimeGlassMetrics,
  RealtimeGlassQuality,
  RealtimeGlassSource,
  RealtimeGlassStatus,
} from "./realtime-glass-engine";

export { resolveRealtimeGlassMaterial } from "./realtime-glass-engine";
