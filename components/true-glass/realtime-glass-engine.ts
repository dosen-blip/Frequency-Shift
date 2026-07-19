import {
  REALTIME_GLASS_FRAGMENT_SHADER,
  REALTIME_GLASS_VERTEX_SHADER,
} from "./realtime-glass-shaders";
import {
  resolveRealtimeGlassMaterial,
  type RealtimeGlassMaterial,
  type RealtimeGlassTint,
} from "./realtime-glass-materials";

export {
  resolveRealtimeGlassMaterial,
  type RealtimeGlassMaterial,
  type RealtimeGlassTint,
  type ResolvedRealtimeGlassMaterial,
} from "./realtime-glass-materials";

export type RealtimeGlassStatus =
  | "pending"
  | "ready"
  | "unsupported"
  | "context-lost"
  | "error";

export type RealtimeGlassSource =
  | {
      type: "image";
      src: string;
      position?: readonly [x: number, y: number];
    }
  | {
      type: "video";
      src: string;
      poster: string;
      position?: readonly [x: number, y: number];
      loop?: boolean;
    };

export type RealtimeGlassQuality = "high" | "balanced" | "safe";

export type RealtimeGlassMetrics = {
  quality: RealtimeGlassQuality;
  renderScale: number;
  cpuFrameMs: number;
  gpuFrameMs: number | null;
  frames: number;
  renderReason: "idle" | "source" | "interaction" | "invalidated";
};

export type RealtimeGlassDebugMode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type RealtimeGlassLensOptions = {
  /** Apple-aligned semantic material. Prefer this over the debug overrides below. */
  material?: RealtimeGlassMaterial;
  /** CSS-pixel radius. Omit to read the element's computed border radius. */
  radius?: number;
  /** Maximum optical displacement in CSS pixels. */
  displacement?: number;
  /** RGB channel separation in CSS pixels. */
  aberration?: number;
  /** Adaptive diffusion strength, from 0 to 1. */
  diffusion?: number;
  /** Linear RGB tint and blend amount, each from 0 to 1. */
  tint?: RealtimeGlassTint;
  /** Final canvas opacity for this lens. */
  opacity?: number;
  /** Enables touch/press deformation. Mouse hover remains available. */
  interactive?: boolean;
  disabled?: boolean;
  /** Lab-only shader diagnostic view. */
  debugMode?: RealtimeGlassDebugMode;
};

export type RealtimeGlassLensRegistration = {
  update: (options: RealtimeGlassLensOptions) => void;
  refresh: () => void;
  unregister: () => void;
};

export type RealtimeGlassEngineOptions = {
  canvas: HTMLCanvasElement;
  stage: HTMLElement;
  source: RealtimeGlassSource;
  sourceElement?: HTMLImageElement | HTMLVideoElement | null;
  onStatusChange?: (status: RealtimeGlassStatus) => void;
  onMetricsChange?: (metrics: RealtimeGlassMetrics) => void;
};

type ResolvedLensOptions = {
  material: "regular" | "clear";
  radius?: number;
  displacement: number;
  aberration: number;
  diffusion: number;
  tint: RealtimeGlassTint;
  opacity: number;
  interactive: boolean;
  disabled: boolean;
  debugMode: RealtimeGlassDebugMode;
};

type LensRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  radii: readonly [number, number, number, number];
};

type LensMotion = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  targetX: number;
  targetY: number;
  energy: number;
  energyVelocity: number;
  targetEnergy: number;
  hovered: boolean;
  pressed: boolean;
  focused: boolean;
  pointerId: number | null;
  pointerType: string;
  pressStartX: number;
  pressStartY: number;
};

type ContactBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
};

type LensListeners = {
  pointerEnter: (event: PointerEvent) => void;
  pointerMove: (event: PointerEvent) => void;
  pointerLeave: (event: PointerEvent) => void;
  pointerDown: (event: PointerEvent) => void;
  pointerUp: (event: PointerEvent) => void;
  pointerCancel: (event: PointerEvent) => void;
  lostPointerCapture: () => void;
  focus: (event: FocusEvent) => void;
  blur: (event: FocusEvent) => void;
};

type LensRecord = {
  id: symbol;
  element: HTMLElement;
  options: ResolvedLensOptions;
  rect: LensRect;
  contactBounds: ContactBounds | null;
  motion: LensMotion;
  listeners: LensListeners;
};

type FrameVideoElement = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: (now: number) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

type Uniforms = {
  backdrop: WebGLUniformLocation | null;
  stageSize: WebGLUniformLocation | null;
  framebufferScale: WebGLUniformLocation | null;
  imageSize: WebGLUniformLocation | null;
  coverPosition: WebGLUniformLocation | null;
  lensRect: WebGLUniformLocation | null;
  radius: WebGLUniformLocation | null;
  displacement: WebGLUniformLocation | null;
  aberration: WebGLUniformLocation | null;
  diffusion: WebGLUniformLocation | null;
  energy: WebGLUniformLocation | null;
  contact: WebGLUniformLocation | null;
  lightDirection: WebGLUniformLocation | null;
  tint: WebGLUniformLocation | null;
  opacity: WebGLUniformLocation | null;
  radii: WebGLUniformLocation | null;
  thickness: WebGLUniformLocation | null;
  material: WebGLUniformLocation | null;
  qualityTier: WebGLUniformLocation | null;
  debugMode: WebGLUniformLocation | null;
};

const DEFAULT_LENS_OPTIONS: ResolvedLensOptions = {
  ...resolveRealtimeGlassMaterial("regular"),
  opacity: 1,
  interactive: false,
  disabled: false,
  debugMode: 0,
};

const DESKTOP_DPR_CAP = 1.5;
const MOBILE_DPR_CAP = 1.25;
const DESKTOP_PIXEL_BUDGET = 1_000_000;
const MOBILE_PIXEL_BUDGET = 350_000;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function addMediaQueryChangeListener(
  query: MediaQueryList,
  listener: (event: MediaQueryListEvent) => void,
) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return;
  }
  query.addListener(listener);
}

function removeMediaQueryChangeListener(
  query: MediaQueryList | null,
  listener: (event: MediaQueryListEvent) => void,
) {
  if (!query) return;
  if (typeof query.removeEventListener === "function") {
    query.removeEventListener("change", listener);
    return;
  }
  query.removeListener(listener);
}

function parseCornerRadius(value: string, width: number, height: number) {
  const token = value.trim().split(/\s+/)[0] ?? "0";
  if (token.endsWith("%")) {
    return Math.min(width, height) * clamp(Number.parseFloat(token) / 100, 0, 1);
  }
  return Math.max(0, Number.parseFloat(token) || 0);
}

function resolveLensOptions(options: RealtimeGlassLensOptions): ResolvedLensOptions {
  const material = resolveRealtimeGlassMaterial(options.material);
  const tint = options.tint ?? material.tint;
  return {
    material: material.material,
    radius: typeof options.radius === "number" && Number.isFinite(options.radius)
      ? Math.max(0, options.radius)
      : undefined,
    displacement: clamp(finiteOr(options.displacement, material.displacement), 0, 48),
    aberration: clamp(finiteOr(options.aberration, material.aberration), 0, 6),
    diffusion: clamp(finiteOr(options.diffusion, material.diffusion), 0, 1),
    tint: [
      clamp(finiteOr(tint[0], DEFAULT_LENS_OPTIONS.tint[0]), 0, 1),
      clamp(finiteOr(tint[1], DEFAULT_LENS_OPTIONS.tint[1]), 0, 1),
      clamp(finiteOr(tint[2], DEFAULT_LENS_OPTIONS.tint[2]), 0, 1),
      clamp(finiteOr(tint[3], DEFAULT_LENS_OPTIONS.tint[3]), 0, 0.32),
    ],
    opacity: clamp(finiteOr(options.opacity, DEFAULT_LENS_OPTIONS.opacity), 0, 1),
    interactive: options.interactive ?? DEFAULT_LENS_OPTIONS.interactive,
    disabled: options.disabled ?? DEFAULT_LENS_OPTIONS.disabled,
    debugMode: clamp(Math.round(finiteOr(options.debugMode, 0)), 0, 9) as RealtimeGlassDebugMode,
  };
}

function lensOptionsEqual(left: ResolvedLensOptions, right: ResolvedLensOptions) {
  return left.radius === right.radius
    && left.material === right.material
    && left.displacement === right.displacement
    && left.aberration === right.aberration
    && left.diffusion === right.diffusion
    && left.opacity === right.opacity
    && left.interactive === right.interactive
    && left.disabled === right.disabled
    && left.debugMode === right.debugMode
    && left.tint.every((value, index) => value === right.tint[index]);
}

function springStep(
  value: number,
  velocity: number,
  target: number,
  deltaTime: number,
) {
  const frequency = 19;
  const damping = 0.79;
  const stiffness = frequency * frequency;
  const friction = 2 * damping * frequency;
  const acceleration = stiffness * (target - value) - friction * velocity;
  const nextVelocity = velocity + acceleration * deltaTime;
  return [value + nextVelocity * deltaTime, nextVelocity] as const;
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate a WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader compile error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, REALTIME_GLASS_VERTEX_SHADER);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, REALTIME_GLASS_FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error("Unable to allocate a WebGL program.");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown WebGL link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function getUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): Uniforms {
  return {
    backdrop: gl.getUniformLocation(program, "uBackdrop"),
    stageSize: gl.getUniformLocation(program, "uStageSize"),
    framebufferScale: gl.getUniformLocation(program, "uFramebufferScale"),
    imageSize: gl.getUniformLocation(program, "uImageSize"),
    coverPosition: gl.getUniformLocation(program, "uCoverPosition"),
    lensRect: gl.getUniformLocation(program, "uLensRect"),
    radius: gl.getUniformLocation(program, "uRadius"),
    displacement: gl.getUniformLocation(program, "uDisplacement"),
    aberration: gl.getUniformLocation(program, "uAberration"),
    diffusion: gl.getUniformLocation(program, "uDiffusion"),
    energy: gl.getUniformLocation(program, "uEnergy"),
    contact: gl.getUniformLocation(program, "uContact"),
    lightDirection: gl.getUniformLocation(program, "uLightDirection"),
    tint: gl.getUniformLocation(program, "uTint"),
    opacity: gl.getUniformLocation(program, "uOpacity"),
    radii: gl.getUniformLocation(program, "uRadii"),
    thickness: gl.getUniformLocation(program, "uThickness"),
    material: gl.getUniformLocation(program, "uMaterial"),
    qualityTier: gl.getUniformLocation(program, "uQualityTier"),
    debugMode: gl.getUniformLocation(program, "uDebugMode"),
  };
}

function neutralMotion(): LensMotion {
  return {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    targetX: 0,
    targetY: 0,
    energy: 0,
    energyVelocity: 0,
    targetEnergy: 0,
    hovered: false,
    pressed: false,
    focused: false,
    pointerId: null,
    pointerType: "",
    pressStartX: 0,
    pressStartY: 0,
  };
}

function eventTargetsNestedLens(record: LensRecord, event: Event) {
  const target = event.target;
  return target instanceof Element
    && target.closest('[data-realtime-glass-lens="true"]') !== record.element;
}

export function canUseRealtimeGlass() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (typeof WebGL2RenderingContext === "undefined") return false;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return false;
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
}

/**
 * One renderer owns one bounded stage canvas and any number of registered lens
 * elements. It performs no work between interactions, resizes, or explicit
 * invalidations.
 */
export class RealtimeGlassEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly stage: HTMLElement;
  private readonly onStatusChange?: (status: RealtimeGlassStatus) => void;
  private readonly onMetricsChange?: (metrics: RealtimeGlassMetrics) => void;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vertexArray: WebGLVertexArrayObject | null = null;
  private uniforms: Uniforms | null = null;
  private texture: WebGLTexture | null = null;
  private imageSize: readonly [number, number] = [1, 1];
  private source: RealtimeGlassSource;
  private sourceElement: HTMLImageElement | HTMLVideoElement | null;
  private sourceLoadToken = 0;
  private videoFrameHandle: number | null = null;
  private videoFrameUsesCallback = false;
  private lenses = new Map<symbol, LensRecord>();
  private resizeObserver: ResizeObserver | null = null;
  private stageRect: DOMRect | null = null;
  private stageScrollX = 0;
  private stageScrollY = 0;
  private activeLensId: symbol | null = null;
  private frameHandle: number | null = null;
  private lastFrameTime = 0;
  private geometryDirty = false;
  private drawAllNextFrame = false;
  private animateNextFrame = false;
  private contextLost = false;
  private destroyed = false;
  private reducedMotion = false;
  private reducedMotionQuery: MediaQueryList | null = null;
  private reducedTransparencyQuery: MediaQueryList | null = null;
  private forcedColorsQuery: MediaQueryList | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private visible = true;
  private mediaFallback = false;
  private renderScale = 1;
  private quality: RealtimeGlassQuality = "high";
  private slowFrameCount = 0;
  private fastFrameCount = 0;
  private frameCount = 0;
  private cpuFrameMs = 0;
  private gpuFrameMs: number | null = null;
  private renderReason: RealtimeGlassMetrics["renderReason"] = "idle";
  private timerExtension: { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number } | null = null;
  private timerQueries: WebGLQuery[] = [];
  private timerPollFrames = 0;

  constructor(options: RealtimeGlassEngineOptions) {
    this.canvas = options.canvas;
    this.stage = options.stage;
    this.source = options.source;
    this.sourceElement = options.sourceElement ?? null;
    this.onStatusChange = options.onStatusChange;
    this.onMetricsChange = options.onMetricsChange;
    this.stage.dataset.realtimeGlassQuality = this.quality;
    this.handleContextLost = this.handleContextLost.bind(this);
    this.handleContextRestored = this.handleContextRestored.bind(this);
    this.handleViewportChange = this.handleViewportChange.bind(this);
    this.handleReducedMotionChange = this.handleReducedMotionChange.bind(this);
    this.handleFallbackPreferenceChange = this.handleFallbackPreferenceChange.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleSourceReady = this.handleSourceReady.bind(this);
    this.handleSourceError = this.handleSourceError.bind(this);
    this.handleVideoPlay = this.handleVideoPlay.bind(this);
    this.handleVideoPause = this.handleVideoPause.bind(this);
    this.handleVideoSeeked = this.handleVideoSeeked.bind(this);
    this.handleVideoFrame = this.handleVideoFrame.bind(this);

    this.canvas.addEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.addEventListener("webglcontextrestored", this.handleContextRestored);
    window.addEventListener("resize", this.handleViewportChange, { passive: true });

    this.reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.reducedMotionQuery.matches;
    addMediaQueryChangeListener(this.reducedMotionQuery, this.handleReducedMotionChange);
    this.reducedTransparencyQuery = window.matchMedia("(prefers-reduced-transparency: reduce)");
    this.forcedColorsQuery = window.matchMedia("(forced-colors: active)");
    this.mediaFallback = this.reducedTransparencyQuery.matches || this.forcedColorsQuery.matches;
    addMediaQueryChangeListener(
      this.reducedTransparencyQuery,
      this.handleFallbackPreferenceChange,
    );
    addMediaQueryChangeListener(this.forcedColorsQuery, this.handleFallbackPreferenceChange);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const nextVisible = entries.some((entry) => entry.isIntersecting);
          if (this.visible === nextVisible) return;
          this.visible = nextVisible;
          if (!nextVisible) {
            this.cancelFrame();
            this.cancelVideoFrame();
            for (const record of this.lenses.values()) this.resetMotion(record);
            this.activeLensId = null;
            return;
          }
          this.queueGeometryRefresh();
          this.scheduleVideoFrame();
        },
        { rootMargin: "160px 0px" },
      );
      this.intersectionObserver.observe(this.stage);
    }

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.queueGeometryRefresh();
      });
      this.resizeObserver.observe(this.stage);
    }

    this.setStatus("pending");
    if (this.mediaFallback) {
      this.setStatus("unsupported");
      return;
    }
    if (!this.initializeGL()) return;
    this.refreshGeometry();
    this.attachSource();
  }

  setBackground(backgroundSrc: string, position: readonly [number, number]) {
    this.setSource({ type: "image", src: backgroundSrc, position });
  }

  setSource(source: RealtimeGlassSource, element?: HTMLImageElement | HTMLVideoElement | null) {
    const sourceChanged = source.type !== this.source.type
      || source.src !== this.source.src
      || (source.type === "video" && this.source.type === "video"
        && (source.poster !== this.source.poster || source.loop !== this.source.loop));
    const elementChanged = element !== undefined && element !== this.sourceElement;
    if (sourceChanged || elementChanged) this.detachSource();
    this.source = source;
    if (element !== undefined) this.sourceElement = element;
    if (sourceChanged) {
      this.sourceLoadToken += 1;
      this.clearCanvas();
      if (this.texture && this.gl && !this.contextLost) this.gl.deleteTexture(this.texture);
      this.texture = null;
    }
    if (this.mediaFallback) {
      this.setStatus("unsupported");
      return;
    }
    if (sourceChanged || elementChanged) {
      this.setStatus("pending");
      this.clearCanvas();
      this.attachSource();
      return;
    }
    this.requestDrawAll();
  }

  getMetrics(): RealtimeGlassMetrics {
    return {
      quality: this.quality,
      renderScale: this.renderScale,
      cpuFrameMs: this.cpuFrameMs,
      gpuFrameMs: this.gpuFrameMs,
      frames: this.frameCount,
      renderReason: this.renderReason,
    };
  }

  registerLens(element: HTMLElement, options: RealtimeGlassLensOptions = {}): RealtimeGlassLensRegistration {
    const id = Symbol("realtime-glass-lens");
    const record: LensRecord = {
      id,
      element,
      options: resolveLensOptions(options),
      rect: { x: 0, y: 0, width: 0, height: 0, radius: 0, radii: [0, 0, 0, 0] },
      contactBounds: null,
      motion: neutralMotion(),
      listeners: {} as LensListeners,
    };

    record.listeners = this.createLensListeners(record);
    this.lenses.set(id, record);
    element.dataset.realtimeGlassLens = "true";
    this.addLensListeners(record);
    this.resizeObserver?.observe(element);
    this.refreshLensGeometry(record);
    this.requestDrawAll();

    let registered = true;
    return {
      update: (nextOptions) => {
        if (!registered) return;
        const resolvedOptions = resolveLensOptions(nextOptions);
        if (lensOptionsEqual(record.options, resolvedOptions)) return;
        const geometryChanged = record.options.radius !== resolvedOptions.radius;
        record.options = resolvedOptions;
        if (record.options.disabled) this.deactivateLens(record, true);
        if (geometryChanged) this.refreshLensGeometry(record);
        this.requestDrawAll();
      },
      refresh: () => {
        if (!registered) return;
        this.queueGeometryRefresh();
      },
      unregister: () => {
        if (!registered) return;
        registered = false;
        this.removeLensListeners(record);
        this.resizeObserver?.unobserve(element);
        if (element.dataset.realtimeGlassLens === "true") {
          delete element.dataset.realtimeGlassLens;
        }
        delete element.dataset.realtimeGlassActive;
        this.lenses.delete(id);
        if (this.activeLensId === id) this.activeLensId = null;
        this.requestDrawAll();
      },
    };
  }

  invalidate() {
    this.renderReason = "invalidated";
    this.queueGeometryRefresh();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.sourceLoadToken += 1;
    this.cancelFrame();
    this.detachSource();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    for (const record of this.lenses.values()) {
      this.removeLensListeners(record);
      if (record.element.dataset.realtimeGlassLens === "true") {
        delete record.element.dataset.realtimeGlassLens;
      }
      delete record.element.dataset.realtimeGlassActive;
    }
    this.lenses.clear();
    window.removeEventListener("resize", this.handleViewportChange);
    removeMediaQueryChangeListener(this.reducedMotionQuery, this.handleReducedMotionChange);
    removeMediaQueryChangeListener(
      this.reducedTransparencyQuery,
      this.handleFallbackPreferenceChange,
    );
    removeMediaQueryChangeListener(this.forcedColorsQuery, this.handleFallbackPreferenceChange);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.handleContextRestored);
    this.releaseGLResources();
    this.gl = null;
  }

  private setStatus(status: RealtimeGlassStatus) {
    if (this.destroyed) return;
    this.onStatusChange?.(status);
  }

  private initializeGL() {
    if (typeof WebGL2RenderingContext === "undefined") {
      this.setStatus("unsupported");
      return false;
    }
    const gl = this.canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      this.setStatus("unsupported");
      return false;
    }
    try {
      this.gl = gl;
      this.program = createProgram(gl);
      this.vertexArray = gl.createVertexArray();
      if (!this.vertexArray) throw new Error("Unable to allocate a vertex array.");
      this.uniforms = getUniforms(gl, this.program);
      this.timerExtension = gl.getExtension("EXT_disjoint_timer_query_webgl2") as {
        TIME_ELAPSED_EXT: number;
        GPU_DISJOINT_EXT: number;
      } | null;
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.useProgram(this.program);
      gl.bindVertexArray(this.vertexArray);
      gl.uniform1i(this.uniforms.backdrop, 0);
      return true;
    } catch {
      this.releaseGLResources();
      this.gl = null;
      this.setStatus("error");
      return false;
    }
  }

  private releaseGLResources() {
    const gl = this.gl;
    if (!gl || this.contextLost) return;
    if (this.texture) gl.deleteTexture(this.texture);
    for (const query of this.timerQueries) gl.deleteQuery(query);
    this.timerQueries = [];
    this.timerExtension = null;
    if (this.vertexArray) gl.deleteVertexArray(this.vertexArray);
    if (this.program) gl.deleteProgram(this.program);
    this.texture = null;
    this.vertexArray = null;
    this.program = null;
    this.uniforms = null;
  }

  private resolveSourceUrl() {
    let resolved: URL;
    try {
      resolved = new URL(this.source.src, window.location.href);
      if (resolved.origin !== window.location.origin || !["http:", "https:"].includes(resolved.protocol)) {
        this.setStatus("unsupported");
        return null;
      }
    } catch {
      this.setStatus("error");
      return null;
    }
    return resolved;
  }

  private attachSource() {
    if (!this.gl || this.contextLost || this.destroyed || this.mediaFallback) return;
    const resolved = this.resolveSourceUrl();
    if (!resolved) return;
    const token = ++this.sourceLoadToken;
    let element = this.sourceElement;

    if (this.source.type === "video") {
      if (!(element instanceof HTMLVideoElement)) {
        element = document.createElement("video");
        element.muted = true;
        element.playsInline = true;
        element.loop = this.source.loop ?? true;
        element.preload = "auto";
        element.src = resolved.href;
        element.load();
        this.sourceElement = element;
      }
      element.addEventListener("loadeddata", this.handleSourceReady);
      element.addEventListener("canplay", this.handleSourceReady);
      element.addEventListener("error", this.handleSourceError);
      element.addEventListener("play", this.handleVideoPlay);
      element.addEventListener("pause", this.handleVideoPause);
      element.addEventListener("ended", this.handleVideoPause);
      element.addEventListener("seeked", this.handleVideoSeeked);
      if (element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        this.uploadSourceFrame(token, true);
      }
      if (!element.paused) this.scheduleVideoFrame();
      return;
    }

    if (!(element instanceof HTMLImageElement)) {
      element = new Image();
      element.decoding = "async";
      element.src = resolved.href;
      this.sourceElement = element;
    }
    element.addEventListener("load", this.handleSourceReady);
    element.addEventListener("error", this.handleSourceError);
    if (element.complete && element.naturalWidth > 0) this.uploadSourceFrame(token, true);
  }

  private detachSource() {
    const element = this.sourceElement;
    this.cancelVideoFrame();
    if (!element) return;
    element.removeEventListener("load", this.handleSourceReady);
    element.removeEventListener("loadeddata", this.handleSourceReady);
    element.removeEventListener("canplay", this.handleSourceReady);
    element.removeEventListener("error", this.handleSourceError);
    if (element instanceof HTMLVideoElement) {
      element.removeEventListener("play", this.handleVideoPlay);
      element.removeEventListener("pause", this.handleVideoPause);
      element.removeEventListener("ended", this.handleVideoPause);
      element.removeEventListener("seeked", this.handleVideoSeeked);
    }
  }

  private handleSourceReady() {
    this.uploadSourceFrame(this.sourceLoadToken, !this.texture);
    if (this.sourceElement instanceof HTMLVideoElement && !this.sourceElement.paused) {
      this.scheduleVideoFrame();
    }
  }

  private handleSourceError() {
    this.cancelVideoFrame();
    this.setStatus("error");
  }

  private handleVideoPlay() {
    this.scheduleVideoFrame();
  }

  private handleVideoPause() {
    this.cancelVideoFrame();
  }

  private handleVideoSeeked() {
    this.uploadSourceFrame(this.sourceLoadToken, !this.texture);
  }

  private handleVideoFrame() {
    this.videoFrameHandle = null;
    this.videoFrameUsesCallback = false;
    const video = this.sourceElement;
    if (!(video instanceof HTMLVideoElement) || video.paused || video.ended) return;
    this.uploadSourceFrame(this.sourceLoadToken, !this.texture);
    this.renderReason = "source";
    this.requestDrawAll();
    this.scheduleVideoFrame();
  }

  private scheduleVideoFrame() {
    if (
      this.videoFrameHandle !== null
      || this.destroyed
      || this.mediaFallback
      || this.contextLost
      || !this.visible
      || document.hidden
    ) return;
    const video = this.sourceElement as FrameVideoElement | null;
    if (!(video instanceof HTMLVideoElement) || video.paused || video.ended) return;
    if (video.requestVideoFrameCallback) {
      this.videoFrameUsesCallback = true;
      this.videoFrameHandle = video.requestVideoFrameCallback(this.handleVideoFrame);
    } else {
      this.videoFrameUsesCallback = false;
      this.videoFrameHandle = window.requestAnimationFrame(this.handleVideoFrame);
    }
  }

  private cancelVideoFrame() {
    if (this.videoFrameHandle === null) return;
    const video = this.sourceElement as FrameVideoElement | null;
    if (this.videoFrameUsesCallback) {
      video?.cancelVideoFrameCallback?.(this.videoFrameHandle);
    } else {
      window.cancelAnimationFrame(this.videoFrameHandle);
    }
    this.videoFrameHandle = null;
    this.videoFrameUsesCallback = false;
  }

  private uploadSourceFrame(token: number, initial: boolean) {
    if (
      this.destroyed
      || this.contextLost
      || this.mediaFallback
      || token !== this.sourceLoadToken
    ) return;
    const gl = this.gl;
    const element = this.sourceElement;
    if (!gl || !this.program || !this.vertexArray || !this.uniforms || !element) return;
    const width = element instanceof HTMLVideoElement ? element.videoWidth : element.naturalWidth;
    const height = element instanceof HTMLVideoElement ? element.videoHeight : element.naturalHeight;
    if (width <= 0 || height <= 0) return;

    let uploadSource: TexImageSource = element;
    let uploadWidth = width;
    let uploadHeight = height;
    if (element instanceof HTMLImageElement) {
      const maximumTextureSize = Math.min(Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 4096, 4096);
      const stageCeiling = Math.max(this.canvas.width, this.canvas.height) * 1.6;
      const targetCeiling = Math.max(512, Math.min(maximumTextureSize, stageCeiling));
      const sourceScale = Math.min(1, targetCeiling / Math.max(width, height, 1));
      if (sourceScale < 0.999) {
        uploadWidth = Math.max(1, Math.round(width * sourceScale));
        uploadHeight = Math.max(1, Math.round(height * sourceScale));
        const downsample = document.createElement("canvas");
        downsample.width = uploadWidth;
        downsample.height = uploadHeight;
        const context = downsample.getContext("2d", { alpha: false });
        if (!context) {
          this.setStatus("error");
          return;
        }
        context.drawImage(element, 0, 0, uploadWidth, uploadHeight);
        uploadSource = downsample;
      }
    }

    let nextTexture: WebGLTexture | null = null;
    try {
      if (
        !this.texture
        || initial
        || this.imageSize[0] !== uploadWidth
        || this.imageSize[1] !== uploadHeight
      ) {
        nextTexture = gl.createTexture();
        if (!nextTexture) throw new Error("Unable to allocate the backdrop texture.");
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, nextTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, uploadSource);
        if (gl.getError() !== gl.NO_ERROR) throw new Error("The GPU rejected the source texture.");
        const previousTexture = this.texture;
        this.texture = nextTexture;
        nextTexture = null;
        if (previousTexture) gl.deleteTexture(previousTexture);
        this.imageSize = [uploadWidth, uploadHeight];
        this.setStatus("ready");
        this.refreshGeometry();
      } else {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, uploadSource);
      }
      this.renderReason = "source";
      this.requestDrawAll();
    } catch {
      if (nextTexture) gl.deleteTexture(nextTexture);
      if (this.texture) gl.bindTexture(gl.TEXTURE_2D, this.texture);
      this.setStatus("error");
    }
  }

  private createLensListeners(record: LensRecord): LensListeners {
    return {
      pointerEnter: (event) => {
        if (
          record.options.disabled
          || this.reducedMotion
          || event.pointerType === "touch"
          || eventTargetsNestedLens(record, event)
        ) return;
        this.refreshLensGeometry(record);
        record.motion.hovered = true;
        this.updateContact(record, event);
        record.motion.targetEnergy = 0.2;
        this.activateLens(record);
      },
      pointerMove: (event) => {
        if (
          record.options.disabled
          || this.reducedMotion
          || eventTargetsNestedLens(record, event)
        ) return;
        if (!event.isPrimary) return;
        if (
          record.motion.pressed
          && record.motion.pointerId !== null
          && event.pointerId !== record.motion.pointerId
        ) return;
        if (event.pointerType === "touch" && (!record.options.interactive || !record.motion.pressed)) return;
        if (!record.motion.hovered && !record.motion.pressed) {
          if (event.pointerType === "touch") return;
          this.refreshLensGeometry(record);
          record.motion.hovered = true;
          record.motion.targetEnergy = 0.2;
        }
        if (
          event.pointerType === "touch"
          && Math.hypot(
            event.clientX - record.motion.pressStartX,
            event.clientY - record.motion.pressStartY,
          ) > 10
        ) {
          record.motion.pressed = false;
          record.motion.hovered = false;
          this.returnToFocusOrRest(record);
          this.releasePointerCapture(record, event.pointerId);
          return;
        }
        this.updateContact(record, event);
        this.activateLens(record);
      },
      pointerLeave: (event) => {
        if (event.pointerType === "touch" || eventTargetsNestedLens(record, event)) return;
        record.motion.hovered = false;
        record.contactBounds = null;
        if (!record.motion.pressed && !record.motion.focused) this.deactivateLens(record);
      },
      pointerDown: (event) => {
        if (
          record.options.disabled
          || this.reducedMotion
          || !record.options.interactive
          || eventTargetsNestedLens(record, event)
        ) return;
        if (!event.isPrimary || record.motion.pointerId !== null) return;
        this.refreshLensGeometry(record);
        try {
          record.element.setPointerCapture(event.pointerId);
        } catch {
          // WebKit may retire a touch pointer before capture is established.
        }
        record.motion.pressed = true;
        record.motion.pointerId = event.pointerId;
        record.motion.pointerType = event.pointerType;
        record.motion.pressStartX = event.clientX;
        record.motion.pressStartY = event.clientY;
        this.updateContact(record, event);
        record.motion.targetEnergy = event.pointerType === "touch" ? 0.9 : 0.58;
        this.activateLens(record);
      },
      pointerUp: (event) => {
        if (eventTargetsNestedLens(record, event)) return;
        if (record.motion.pointerId !== null && event.pointerId !== record.motion.pointerId) return;
        const wasPressed = record.motion.pressed;
        record.motion.pressed = false;
        record.motion.pointerId = null;
        record.motion.pointerType = "";
        if (wasPressed && event.pointerType !== "touch" && record.motion.hovered) {
          record.motion.targetEnergy = 0.2;
          this.activateLens(record);
        } else if (wasPressed) {
          this.returnToFocusOrRest(record);
        }
        this.releasePointerCapture(record, event.pointerId);
      },
      pointerCancel: (event) => {
        if (eventTargetsNestedLens(record, event)) return;
        if (record.motion.pointerId !== null && event.pointerId !== record.motion.pointerId) return;
        record.motion.pressed = false;
        record.motion.hovered = false;
        record.motion.pointerId = null;
        record.motion.pointerType = "";
        this.returnToFocusOrRest(record);
      },
      lostPointerCapture: () => {
        if (!record.motion.pressed) return;
        record.motion.pressed = false;
        record.motion.hovered = false;
        record.motion.pointerId = null;
        record.motion.pointerType = "";
        this.returnToFocusOrRest(record);
      },
      focus: (event) => {
        if (record.options.disabled || eventTargetsNestedLens(record, event)) return;
        record.motion.focused = true;
        if (record.motion.pressed || this.reducedMotion) return;
        record.motion.targetX = 0;
        record.motion.targetY = 0;
        record.motion.targetEnergy = 0.18;
        this.activateLens(record);
      },
      blur: (event) => {
        if (eventTargetsNestedLens(record, event)) return;
        if (
          event.relatedTarget instanceof Node
          && record.element.contains(event.relatedTarget)
        ) return;
        record.motion.focused = false;
        if (!record.motion.hovered && !record.motion.pressed) this.deactivateLens(record);
      },
    };
  }

  private addLensListeners(record: LensRecord) {
    const { element, listeners } = record;
    element.addEventListener("pointerenter", listeners.pointerEnter, { passive: true });
    element.addEventListener("pointermove", listeners.pointerMove, { passive: true });
    element.addEventListener("pointerleave", listeners.pointerLeave, { passive: true });
    element.addEventListener("pointerdown", listeners.pointerDown, { passive: true });
    element.addEventListener("pointerup", listeners.pointerUp, { passive: true });
    element.addEventListener("pointercancel", listeners.pointerCancel, { passive: true });
    element.addEventListener("lostpointercapture", listeners.lostPointerCapture);
    element.addEventListener("focusin", listeners.focus);
    element.addEventListener("focusout", listeners.blur);
  }

  private removeLensListeners(record: LensRecord) {
    const { element, listeners } = record;
    element.removeEventListener("pointerenter", listeners.pointerEnter);
    element.removeEventListener("pointermove", listeners.pointerMove);
    element.removeEventListener("pointerleave", listeners.pointerLeave);
    element.removeEventListener("pointerdown", listeners.pointerDown);
    element.removeEventListener("pointerup", listeners.pointerUp);
    element.removeEventListener("pointercancel", listeners.pointerCancel);
    element.removeEventListener("lostpointercapture", listeners.lostPointerCapture);
    element.removeEventListener("focusin", listeners.focus);
    element.removeEventListener("focusout", listeners.blur);
  }

  private updateContact(record: LensRecord, event: PointerEvent) {
    const bounds = record.contactBounds;
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return;
    const left = bounds.left - (window.scrollX - bounds.scrollX);
    const top = bounds.top - (window.scrollY - bounds.scrollY);
    record.motion.targetX = clamp(((event.clientX - left) / bounds.width) * 2 - 1, -0.88, 0.88);
    record.motion.targetY = clamp(((event.clientY - top) / bounds.height) * 2 - 1, -0.88, 0.88);
  }

  private releasePointerCapture(record: LensRecord, pointerId: number) {
    try {
      if (record.element.hasPointerCapture(pointerId)) {
        record.element.releasePointerCapture(pointerId);
      }
    } catch {
      // The browser may have already released implicit touch capture.
    }
  }

  private returnToFocusOrRest(record: LensRecord) {
    record.motion.targetX = 0;
    record.motion.targetY = 0;
    if (record.motion.focused && !this.reducedMotion) {
      record.motion.targetEnergy = 0.18;
      this.activateLens(record);
      return;
    }
    this.deactivateLens(record);
  }

  private activateLens(record: LensRecord) {
    if (this.mediaFallback || !this.gl || !this.program || !this.texture || this.contextLost) {
      this.resetMotion(record);
      return;
    }
    if (this.reducedMotion) {
      this.resetMotion(record);
      this.requestDrawAll();
      return;
    }
    if (this.activeLensId && this.activeLensId !== record.id) {
      const previous = this.lenses.get(this.activeLensId);
      if (previous) this.resetMotion(previous);
      this.drawAllNextFrame = true;
    }
    this.activeLensId = record.id;
    this.renderReason = "interaction";
    record.element.dataset.realtimeGlassActive = "true";
    this.animateNextFrame = true;
    this.scheduleFrame();
  }

  private deactivateLens(record: LensRecord, immediate = false) {
    record.motion.targetX = 0;
    record.motion.targetY = 0;
    record.motion.targetEnergy = 0;
    this.renderReason = "interaction";
    if (this.mediaFallback || !this.gl || !this.program || !this.texture || this.contextLost) {
      this.resetMotion(record);
      if (this.activeLensId === record.id) this.activeLensId = null;
      return;
    }
    if (immediate || this.reducedMotion) {
      this.resetMotion(record);
      if (this.activeLensId === record.id) this.activeLensId = null;
      this.requestDrawAll();
      return;
    }
    this.activeLensId = record.id;
    this.animateNextFrame = true;
    this.scheduleFrame();
  }

  private resetMotion(record: LensRecord) {
    record.motion.x = 0;
    record.motion.y = 0;
    record.motion.velocityX = 0;
    record.motion.velocityY = 0;
    record.motion.targetX = 0;
    record.motion.targetY = 0;
    record.motion.energy = 0;
    record.motion.energyVelocity = 0;
    record.motion.targetEnergy = 0;
    record.motion.pointerId = null;
    record.motion.pointerType = "";
    record.contactBounds = null;
    delete record.element.dataset.realtimeGlassActive;
  }

  private stepActiveLens(time: number) {
    if (!this.activeLensId || this.reducedMotion) return false;
    const record = this.lenses.get(this.activeLensId);
    if (!record) return false;
    const deltaTime = this.lastFrameTime === 0
      ? 1 / 60
      : clamp((time - this.lastFrameTime) / 1000, 1 / 240, 1 / 30);
    this.lastFrameTime = time;

    [record.motion.x, record.motion.velocityX] = springStep(
      record.motion.x,
      record.motion.velocityX,
      record.motion.targetX,
      deltaTime,
    );
    [record.motion.y, record.motion.velocityY] = springStep(
      record.motion.y,
      record.motion.velocityY,
      record.motion.targetY,
      deltaTime,
    );
    [record.motion.energy, record.motion.energyVelocity] = springStep(
      record.motion.energy,
      record.motion.energyVelocity,
      record.motion.targetEnergy,
      deltaTime,
    );

    const settled =
      Math.abs(record.motion.x - record.motion.targetX) < 0.0015
      && Math.abs(record.motion.y - record.motion.targetY) < 0.0015
      && Math.abs(record.motion.energy - record.motion.targetEnergy) < 0.0015
      && Math.abs(record.motion.velocityX) < 0.006
      && Math.abs(record.motion.velocityY) < 0.006
      && Math.abs(record.motion.energyVelocity) < 0.006;
    if (settled) {
      record.motion.x = record.motion.targetX;
      record.motion.y = record.motion.targetY;
      record.motion.energy = record.motion.targetEnergy;
      record.motion.velocityX = 0;
      record.motion.velocityY = 0;
      record.motion.energyVelocity = 0;
      if (record.motion.targetEnergy === 0) {
        delete record.element.dataset.realtimeGlassActive;
        this.activeLensId = null;
      }
    }
    return !settled;
  }

  private handleViewportChange() {
    if (!this.visible || document.hidden) return;
    this.queueGeometryRefresh();
  }

  private handleReducedMotionChange(event: MediaQueryListEvent) {
    this.reducedMotion = event.matches;
    if (this.reducedMotion) {
      for (const record of this.lenses.values()) this.resetMotion(record);
      this.activeLensId = null;
      this.animateNextFrame = false;
      this.lastFrameTime = 0;
    }
    this.requestDrawAll();
  }

  private handleFallbackPreferenceChange() {
    const nextFallback = Boolean(
      this.reducedTransparencyQuery?.matches || this.forcedColorsQuery?.matches,
    );
    if (nextFallback === this.mediaFallback) return;
    this.mediaFallback = nextFallback;
    if (nextFallback) {
      this.sourceLoadToken += 1;
      this.cancelFrame();
      this.cancelVideoFrame();
      this.detachSource();
      for (const record of this.lenses.values()) this.resetMotion(record);
      this.activeLensId = null;
      this.clearCanvas();
      if (this.texture && this.gl && !this.contextLost) this.gl.deleteTexture(this.texture);
      this.texture = null;
      this.setStatus("unsupported");
      return;
    }

    this.setStatus("pending");
    if (!this.gl && !this.initializeGL()) return;
    if (this.texture) {
      this.setStatus("ready");
      this.refreshGeometry();
      this.requestDrawAll();
      return;
    }
    this.attachSource();
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.cancelFrame();
      this.cancelVideoFrame();
      for (const record of this.lenses.values()) this.resetMotion(record);
      this.activeLensId = null;
      return;
    }
    if (this.visible && !this.mediaFallback) {
      this.queueGeometryRefresh();
      this.scheduleVideoFrame();
    }
  }

  private handleContextLost(event: Event) {
    event.preventDefault();
    this.contextLost = true;
    this.cancelFrame();
    this.cancelVideoFrame();
    this.detachSource();
    for (const record of this.lenses.values()) this.resetMotion(record);
    this.activeLensId = null;
    this.texture = null;
    this.program = null;
    this.vertexArray = null;
    this.uniforms = null;
    this.timerQueries = [];
    this.timerExtension = null;
    this.timerPollFrames = 0;
    this.setStatus("context-lost");
  }

  private handleContextRestored() {
    if (this.destroyed) return;
    this.contextLost = false;
    if (this.mediaFallback) {
      this.setStatus("unsupported");
      return;
    }
    this.setStatus("pending");
    if (!this.initializeGL()) return;
    this.refreshGeometry();
    this.attachSource();
  }

  private refreshGeometry() {
    if (this.destroyed) return;
    this.geometryDirty = false;
    this.stageRect = this.stage.getBoundingClientRect();
    this.stageScrollX = window.scrollX;
    this.stageScrollY = window.scrollY;
    this.resizeCanvas();
    for (const record of this.lenses.values()) this.refreshLensGeometry(record);
  }

  private refreshLensGeometry(record: LensRecord) {
    const stageRect = this.stageRect ?? this.stage.getBoundingClientRect();
    const elementRect = record.element.getBoundingClientRect();
    const stageLeft = stageRect.left - (window.scrollX - this.stageScrollX);
    const stageTop = stageRect.top - (window.scrollY - this.stageScrollY);
    const style = getComputedStyle(record.element);
    const computedRadii = [
      parseCornerRadius(style.borderTopLeftRadius, elementRect.width, elementRect.height),
      parseCornerRadius(style.borderTopRightRadius, elementRect.width, elementRect.height),
      parseCornerRadius(style.borderBottomRightRadius, elementRect.width, elementRect.height),
      parseCornerRadius(style.borderBottomLeftRadius, elementRect.width, elementRect.height),
    ] as const;
    const radii = typeof record.options.radius === "number"
      ? [record.options.radius, record.options.radius, record.options.radius, record.options.radius] as const
      : computedRadii;
    record.rect = {
      x: elementRect.left - stageLeft,
      y: elementRect.top - stageTop,
      width: elementRect.width,
      height: elementRect.height,
      radius: radii[0],
      radii,
    };
    record.contactBounds = {
      left: elementRect.left,
      top: elementRect.top,
      width: elementRect.width,
      height: elementRect.height,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  }

  private resizeCanvas() {
    const rect = this.stageRect;
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches || rect.width <= 768;
    const dprCap = coarse ? MOBILE_DPR_CAP : DESKTOP_DPR_CAP;
    const pixelBudget = coarse ? MOBILE_PIXEL_BUDGET : DESKTOP_PIXEL_BUDGET;
    const nativeDpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const budgetDpr = Math.sqrt(pixelBudget / Math.max(rect.width * rect.height, 1));
    const dpr = Math.min(nativeDpr, budgetDpr) * this.renderScale;
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private requestDrawAll() {
    if (this.destroyed) return;
    this.drawAllNextFrame = true;
    this.scheduleFrame();
  }

  private queueGeometryRefresh() {
    if (this.destroyed) return;
    this.geometryDirty = true;
    this.drawAllNextFrame = true;
    this.scheduleFrame();
  }

  private scheduleFrame() {
    if (
      this.frameHandle !== null
      || this.destroyed
      || !this.visible
      || document.hidden
      || this.mediaFallback
    ) return;
    this.stage.dataset.realtimeGlassAnimating = "true";
    this.frameHandle = window.requestAnimationFrame((time) => {
      this.frameHandle = null;
      const frameStart = performance.now();
      if (this.geometryDirty) this.refreshGeometry();
      this.pollGpuTimers();
      const animate = this.animateNextFrame;
      this.animateNextFrame = false;
      const keepAnimating = animate ? this.stepActiveLens(time) : false;
      let rendered = false;
      if (this.drawAllNextFrame || animate) {
        this.drawAllNextFrame = false;
        this.drawAll();
        rendered = true;
      }
      const frameCost = performance.now() - frameStart;
      if (rendered) this.recordFrameTiming(frameCost);
      if (keepAnimating || this.drawAllNextFrame || this.timerQueries.length > 0) {
        this.animateNextFrame = true;
        if (!keepAnimating) this.animateNextFrame = false;
        this.scheduleFrame();
      } else {
        this.lastFrameTime = 0;
        this.renderReason = "idle";
        delete this.stage.dataset.realtimeGlassAnimating;
      }
    });
  }

  private cancelFrame() {
    if (this.frameHandle !== null) window.cancelAnimationFrame(this.frameHandle);
    this.frameHandle = null;
    this.animateNextFrame = false;
    this.drawAllNextFrame = false;
    this.lastFrameTime = 0;
    delete this.stage.dataset.realtimeGlassAnimating;
  }

  private clearCanvas() {
    const gl = this.gl;
    if (!gl || this.contextLost) return;
    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  private drawAll() {
    const gl = this.gl;
    const program = this.program;
    const uniforms = this.uniforms;
    const stageRect = this.stageRect;
    if (
      !gl
      || !program
      || !uniforms
      || !this.texture
      || !stageRect
      || this.contextLost
      || stageRect.width <= 0
      || stageRect.height <= 0
    ) return;

    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(this.vertexArray);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    const scaleX = this.canvas.width / stageRect.width;
    const scaleY = this.canvas.height / stageRect.height;
    gl.uniform2f(uniforms.stageSize, stageRect.width, stageRect.height);
    gl.uniform2f(uniforms.framebufferScale, scaleX, scaleY);
    gl.uniform2f(uniforms.imageSize, this.imageSize[0], this.imageSize[1]);
    const position = this.source.position ?? [0.5, 0.5];
    gl.uniform2f(uniforms.coverPosition, position[0], position[1]);
    gl.enable(gl.SCISSOR_TEST);
    const timerQuery = this.beginGpuTimer();

    for (const record of this.lenses.values()) {
      if (record.options.disabled || record.rect.width <= 0 || record.rect.height <= 0) continue;
      this.drawLens(record, scaleX, scaleY, stageRect.height);
    }
    if (timerQuery && this.timerExtension) {
      gl.endQuery(this.timerExtension.TIME_ELAPSED_EXT);
      this.timerQueries.push(timerQuery);
    }
    gl.disable(gl.SCISSOR_TEST);
  }

  private beginGpuTimer() {
    const gl = this.gl;
    const extension = this.timerExtension;
    if (!gl || !extension || this.timerQueries.length >= 3) return null;
    const query = gl.createQuery();
    if (!query) return null;
    try {
      gl.beginQuery(extension.TIME_ELAPSED_EXT, query);
      return query;
    } catch {
      gl.deleteQuery(query);
      return null;
    }
  }

  private pollGpuTimers() {
    const gl = this.gl;
    const extension = this.timerExtension;
    if (!gl || !extension || this.timerQueries.length === 0) return;
    if (gl.getParameter(extension.GPU_DISJOINT_EXT)) {
      for (const query of this.timerQueries) gl.deleteQuery(query);
      this.timerQueries = [];
      this.timerPollFrames = 0;
      this.gpuFrameMs = null;
      return;
    }
    const query = this.timerQueries[0];
    if (gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
      const nanoseconds = Number(gl.getQueryParameter(query, gl.QUERY_RESULT));
      this.gpuFrameMs = Number.isFinite(nanoseconds) ? nanoseconds / 1_000_000 : null;
      gl.deleteQuery(query);
      this.timerQueries.shift();
      this.timerPollFrames = 0;
      return;
    }
    this.timerPollFrames += 1;
    if (this.timerPollFrames > 8) {
      for (const pending of this.timerQueries) gl.deleteQuery(pending);
      this.timerQueries = [];
      this.timerPollFrames = 0;
    }
  }

  private recordFrameTiming(frameCost: number) {
    this.frameCount += 1;
    this.cpuFrameMs = this.frameCount === 1
      ? frameCost
      : this.cpuFrameMs * 0.86 + frameCost * 0.14;
    const measuredCost = Math.max(this.cpuFrameMs, this.gpuFrameMs ?? 0);
    const activeSampling = this.renderReason === "interaction" || this.source.type === "video";
    if (activeSampling && measuredCost > 17) {
      this.slowFrameCount += 1;
      this.fastFrameCount = 0;
    } else if (activeSampling && measuredCost < 10) {
      this.fastFrameCount += 1;
      this.slowFrameCount = Math.max(0, this.slowFrameCount - 1);
    } else {
      this.slowFrameCount = Math.max(0, this.slowFrameCount - 1);
      this.fastFrameCount = 0;
    }

    if (this.slowFrameCount >= 8) {
      this.setQuality(this.quality === "high" ? "balanced" : "safe");
    } else if (this.fastFrameCount >= 180) {
      this.setQuality(this.quality === "safe" ? "balanced" : "high");
    }
    this.onMetricsChange?.(this.getMetrics());
  }

  private setQuality(nextQuality: RealtimeGlassQuality) {
    if (nextQuality === this.quality) {
      this.slowFrameCount = 0;
      this.fastFrameCount = 0;
      return;
    }
    this.quality = nextQuality;
    this.renderScale = nextQuality === "high" ? 1 : nextQuality === "balanced" ? 0.82 : 0.68;
    this.slowFrameCount = 0;
    this.fastFrameCount = 0;
    this.stage.dataset.realtimeGlassQuality = nextQuality;
    this.resizeCanvas();
    this.drawAllNextFrame = true;
    this.onMetricsChange?.(this.getMetrics());
  }

  private drawLens(record: LensRecord, scaleX: number, scaleY: number, stageHeight: number) {
    const gl = this.gl;
    const uniforms = this.uniforms;
    if (!gl || !uniforms) return;
    const { rect, motion, options } = record;
    const left = clamp(rect.x, 0, this.stageRect?.width ?? rect.x + rect.width);
    const top = clamp(rect.y, 0, stageHeight);
    const right = clamp(rect.x + rect.width, 0, this.stageRect?.width ?? rect.x + rect.width);
    const bottom = clamp(rect.y + rect.height, 0, stageHeight);
    if (right <= left || bottom <= top) return;

    const paddingX = Math.ceil(4 * scaleX);
    const paddingY = Math.ceil(4 * scaleY);
    const scissorX = Math.max(0, Math.floor(left * scaleX) - paddingX);
    const scissorY = Math.max(0, Math.floor((stageHeight - bottom) * scaleY) - paddingY);
    const scissorRight = Math.min(this.canvas.width, Math.ceil(right * scaleX) + paddingX);
    const scissorTop = Math.min(this.canvas.height, Math.ceil((stageHeight - top) * scaleY) + paddingY);
    gl.scissor(
      scissorX,
      scissorY,
      Math.max(0, scissorRight - scissorX),
      Math.max(0, scissorTop - scissorY),
    );

    const lightX = -0.58;
    const lightY = -0.72;
    const liveDisplacement = options.displacement * (1 + motion.energy * 0.12);
    const maximumRadius = Math.min(rect.width / 2, rect.height / 2);
    const radii = rect.radii.map((radius) => Math.min(radius, maximumRadius)) as [
      number,
      number,
      number,
      number,
    ];
    const shortSide = Math.min(rect.width, rect.height);
    const thickness = clamp(
      shortSide * (options.material === "clear" ? 0.14 : 0.18),
      options.material === "clear" ? 6 : 7,
      options.material === "clear" ? 24 : 30,
    );
    const qualityTier = this.quality === "high" ? 2 : this.quality === "balanced" ? 1 : 0;
    gl.uniform4f(uniforms.lensRect, rect.x, rect.y, rect.width, rect.height);
    gl.uniform1f(uniforms.radius, Math.min(rect.radius, rect.width / 2, rect.height / 2));
    gl.uniform4f(uniforms.radii, radii[0], radii[1], radii[2], radii[3]);
    gl.uniform1f(uniforms.thickness, thickness);
    gl.uniform1f(uniforms.material, options.material === "clear" ? 1 : 0);
    gl.uniform1i(uniforms.qualityTier, qualityTier);
    gl.uniform1i(uniforms.debugMode, options.debugMode);
    gl.uniform1f(uniforms.displacement, liveDisplacement);
    gl.uniform1f(uniforms.aberration, options.aberration);
    gl.uniform1f(uniforms.diffusion, options.diffusion);
    gl.uniform1f(uniforms.energy, motion.energy);
    gl.uniform2f(uniforms.contact, motion.x, motion.y);
    gl.uniform2f(uniforms.lightDirection, lightX, lightY);
    gl.uniform4f(
      uniforms.tint,
      options.tint[0],
      options.tint[1],
      options.tint[2],
      options.tint[3],
    );
    gl.uniform1f(uniforms.opacity, options.opacity);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
