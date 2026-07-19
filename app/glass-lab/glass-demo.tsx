"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  GlassButton,
  GlassLink,
  GlassSurface,
  RealtimeGlassStage,
  useRealtimeGlassLens,
  useRealtimeGlassStage,
  type GlassDepth,
  type GlassTone,
  type RealtimeGlassDebugMode,
  type RealtimeGlassMaterial,
  type RealtimeGlassStatus,
} from "@/components/true-glass";
import styles from "./glass-lab.module.css";

const motionFixture = new URL("./assets/liquid-grid.webm", import.meta.url).href;

const backgrounds = ["club", "portrait", "mesh", "light"] as const;
type DemoBackground = (typeof backgrounds)[number];

const backgroundLabels: Record<DemoBackground, string> = {
  club: "Club",
  portrait: "Portrait",
  mesh: "Signal mesh",
  light: "High key",
};

const tones: readonly GlassTone[] = ["clear", "smoked", "signal"];
const depths: readonly GlassDepth[] = ["shallow", "deep"];

function LabPicker<T extends string | number>({
  label,
  options,
  value,
  getLabel,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  getLabel?: (option: T) => string;
  onChange: (option: T) => void;
}) {
  return (
    <fieldset className={styles.picker}>
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={option === value ? styles.pickerActive : undefined}
            aria-pressed={option === value}
            onClick={() => onChange(option)}
          >
            {getLabel ? getLabel(option) : String(option)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function LabRange({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.rangeControl}>
      <span>
        {label}
        <output>{value}{suffix}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

const diagnosticModes = [0, 8, 7, 9, 1, 2, 3, 4, 5, 6] as const;
const diagnosticLabels: Record<RealtimeGlassDebugMode, string> = {
  0: "Composite",
  1: "Mask",
  2: "Height",
  3: "Normals",
  4: "Vectors",
  5: "Dispersion",
  6: "Complexity",
  7: "Previous colour split",
  8: "Prior optical model",
  9: "Transfer field",
};

type CalibrationShape = "capsule" | "control" | "panel";
type CalibrationState = "neutral" | "center" | "edge" | "press" | "focus";

function RealtimeLensPanel({
  material,
  debugMode,
  shape = "panel",
}: {
  material: RealtimeGlassMaterial;
  debugMode: RealtimeGlassDebugMode;
  shape?: CalibrationShape;
}) {
  const lensRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const options = useMemo(
    () => ({
      material,
      debugMode,
      interactive: true,
    }),
    [debugMode, material],
  );
  useRealtimeGlassLens(lensRef, options);

  return (
    <article
      ref={lensRef}
      className={`${styles.realtimeLens} ${styles[`calibration-${shape}`]}`}
      data-calibration-lens={shape}
      tabIndex={0}
      aria-labelledby={titleId}
    >
      <p className={styles.materialReadout}>{shape} / semantic material</p>
      <h3 id={titleId}>{shape === "panel" ? "Move through the material" : "Frequency Shift"}</h3>
      <p>
        Thickness, dispersion and edge response are derived from this surface geometry.
      </p>
      <span className={styles.realtimePrompt}>Hover, press or focus</span>
    </article>
  );
}

function RealtimeMetrics() {
  const stage = useRealtimeGlassStage();
  const [readout, setReadout] = useState(() => stage.getMetrics());

  useEffect(() => {
    const handle = window.setInterval(() => setReadout(stage.getMetrics()), 250);
    return () => window.clearInterval(handle);
  }, [stage]);

  return (
    <output className={styles.metrics} aria-live="off">
      <span>quality <strong>{readout.quality}</strong></span>
      <span>scale <strong>{readout.renderScale.toFixed(2)}</strong></span>
      <span>cpu <strong>{readout.cpuFrameMs.toFixed(1)}ms</strong></span>
      <span>gpu <strong>{readout.gpuFrameMs === null ? "n/a" : `${readout.gpuFrameMs.toFixed(1)}ms`}</strong></span>
      <span>frames <strong>{readout.frames}</strong></span>
      <span>reason <strong>{readout.renderReason}</strong></span>
    </output>
  );
}

function dispatchCalibrationState(state: CalibrationState) {
  const target = document.querySelector<HTMLElement>('[data-calibration-lens="panel"]');
  if (!target) return;
  target.dispatchEvent(new PointerEvent("pointerup", {
    bubbles: true,
    pointerType: "mouse",
    pointerId: 88,
    isPrimary: true,
  }));
  target.blur();
  const rect = target.getBoundingClientRect();
  const point = state === "edge"
    ? { x: rect.left + rect.width * 0.86, y: rect.top + rect.height * 0.22 }
    : { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 };
  if (state === "neutral") {
    target.dispatchEvent(new PointerEvent("pointerleave", { bubbles: false, pointerType: "mouse", ...{ clientX: point.x, clientY: point.y } }));
    return;
  }
  if (state === "focus") {
    target.focus();
    return;
  }
  target.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, pointerType: "mouse", clientX: point.x, clientY: point.y }));
  target.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse", clientX: point.x, clientY: point.y }));
  if (state === "press") {
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", pointerId: 88, isPrimary: true, buttons: 1, clientX: point.x, clientY: point.y }));
  }
}

export function GlassDemo() {
  const [background, setBackground] = useState<DemoBackground>("club");
  const [tone, setTone] = useState<GlassTone>("clear");
  const [depth, setDepth] = useState<GlassDepth>("deep");
  const [displacement, setDisplacement] = useState(34);
  const [aberration, setAberration] = useState(0.85);
  const [elasticity, setElasticity] = useState(0.28);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeGlassStatus>("pending");
  const [realtimeMaterial, setRealtimeMaterial] = useState<"regular" | "clear">("regular");
  const [realtimeSource, setRealtimeSource] = useState<"image" | "video">("image");
  const [diagnosticMode, setDiagnosticMode] = useState<RealtimeGlassDebugMode>(0);
  const [calibrationState, setCalibrationState] = useState<CalibrationState>("neutral");

  useEffect(() => {
    dispatchCalibrationState(calibrationState);
  }, [calibrationState, realtimeMaterial, realtimeSource]);

  return (
    <div className={styles.lab}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Local material study / not production</p>
        <h1>True glass system</h1>
        <p>
          A live WebGL optical field now bends its registered scene in real time. The universal
          component path uses the same continuous transfer over arbitrary page content, while both
          renderers keep illumination environmental instead of attaching a spotlight to the pointer.
        </p>
        <p className={styles.compatibilityNote}>
          Realtime image refraction: modern WebGL2 browsers. Arbitrary DOM refraction: Chromium,
          with a layered glass fallback elsewhere. Reduced transparency, forced colours and
          unavailable GPU contexts automatically select the functional fallback.
        </p>
        <nav className={styles.jumpNav} aria-label="Glass demo sections">
          <a href="#realtime">Realtime</a>
          <a href="#diagnostics">Diagnostics</a>
          <a href="#playground">Playground</a>
          <a href="#materials">Materials</a>
          <a href="#contexts">Contexts</a>
          <a href="#controls">Controls</a>
        </nav>
      </header>

      <section id="realtime" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>01 / Realtime optical field</p>
          <h2>Refraction that moves</h2>
          <p>
            A bounded GPU stage owns this photograph, so it can recompute the lens surface and
            resample the scene on every active frame without faking a cursor light.
          </p>
        </div>

        <div className={styles.realtimeMeta}>
          <span role="status" aria-live="polite">Renderer / {realtimeStatus}</span>
          <span>Source-driven frames / zero image idle</span>
        </div>
        <div className={styles.labControls}>
          <LabPicker
            label="Material"
            options={["regular", "clear"] as const}
            value={realtimeMaterial}
            onChange={setRealtimeMaterial}
          />
          <LabPicker
            label="Source"
            options={["image", "video"] as const}
            value={realtimeSource}
            onChange={setRealtimeSource}
          />
          <LabPicker
            label="State"
            options={["neutral", "center", "edge", "press", "focus"] as const}
            value={calibrationState}
            onChange={setCalibrationState}
          />
        </div>
        <RealtimeGlassStage
          className={styles.realtimeStage}
          source={realtimeSource === "video"
            ? {
                type: "video",
                src: motionFixture,
                poster: "/media/figma/hero-crowd-1440.webp",
                position: [0.5, 0.5],
                loop: true,
              }
            : {
                type: "image",
                src: "/media/figma/hero-crowd-1440.webp",
                position: [0.5, 0.5],
              }}
          onGlassStatusChange={setRealtimeStatus}
        >
          <div className={styles.realtimeScene}>
            <div className={styles.realtimeBackdropType} aria-hidden="true">
              Live
              <br />
              Field
            </div>
            <RealtimeLensPanel material={realtimeMaterial} debugMode={0} />
            <p className={styles.realtimeBoundary}>
              Texture-backed stage: true live sampling. DOM, text and controls remain semantic and sharp above it.
            </p>
            <RealtimeMetrics />
          </div>
        </RealtimeGlassStage>
      </section>

      <section id="diagnostics" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>02 / Optical calibration</p>
          <h2>See every layer</h2>
          <p>
            Inspect the same material as a capsule, compact control and panel. Diagnostic views
            isolate geometry, the monotonic optical transfer, refraction vectors, restrained
            spectral dispersion and backdrop complexity. “Prior optical model” reconstructs the
            pre-final-sprint height field for a direct full-composite comparison.
          </p>
        </div>
        <LabPicker
          label="Shader view"
          options={diagnosticModes}
          value={diagnosticMode}
          getLabel={(mode) => diagnosticLabels[mode]}
          onChange={setDiagnosticMode}
        />
        <RealtimeGlassStage
          className={`${styles.realtimeStage} ${styles.diagnosticStage}`}
          source={{
            type: "image",
            src: "/media/archive/dopamine/dopamine-15-800.webp",
            position: [0.5, 0.42],
          }}
        >
          <div className={styles.diagnosticScene}>
            <div className={styles.stressGrid} aria-hidden="true">FS 27 / GLASS / 012345</div>
            <RealtimeLensPanel material={realtimeMaterial} debugMode={diagnosticMode} shape="capsule" />
            <RealtimeLensPanel material={realtimeMaterial} debugMode={diagnosticMode} shape="control" />
            <RealtimeLensPanel material={realtimeMaterial} debugMode={diagnosticMode} shape="panel" />
            <RealtimeMetrics />
          </div>
        </RealtimeGlassStage>
      </section>

      <section id="playground" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>03 / Universal component playground</p>
          <h2>Stress-test the fallback</h2>
          <p>Change the scene and tune the arbitrary-content optical path used outside a registered GPU stage.</p>
        </div>

        <div className={styles.labControls}>
          <LabPicker
            label="Background"
            options={backgrounds}
            value={background}
            getLabel={(option) => backgroundLabels[option]}
            onChange={setBackground}
          />
          <LabPicker label="Tone" options={tones} value={tone} onChange={setTone} />
          <LabPicker label="Depth" options={depths} value={depth} onChange={setDepth} />
        </div>

        <div className={styles.opticalControls}>
          <LabRange label="Displacement" value={displacement} min={0} max={96} onChange={setDisplacement} />
          <LabRange
            label="Aberration"
            value={aberration}
            min={0}
            max={1.1}
            step={0.01}
            suffix="px"
            onChange={setAberration}
          />
          <LabRange label="Elasticity" value={elasticity} min={0} max={0.65} step={0.01} onChange={setElasticity} />
        </div>

        <div className={`${styles.playground} ${styles[`background-${background}`]}`}>
          <div className={styles.sceneType} aria-hidden="true">
            Frequency
            <br />
            Shift
          </div>
          <GlassSurface
            className={styles.playgroundGlass}
            tone={tone}
            depth={depth}
            radius="2rem"
            displacementScale={displacement}
            aberrationIntensity={aberration}
            elasticity={elasticity}
            overLight={background === "light"}
          >
            <p className={styles.materialReadout}>displacement {displacement} / aberration {aberration}</p>
            <h3>Frequency in motion</h3>
            <p>
              The center remains readable while the lens physically bends and separates the
              scene beneath its perimeter.
            </p>
            <div className={styles.actions}>
              <GlassButton tone={tone} depth={depth}>Open transmission</GlassButton>
              <GlassLink href="#contexts" tone="clear" depth="shallow">View contexts</GlassLink>
            </div>
          </GlassSurface>
        </div>
      </section>

      <section id="materials" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>03 / Material matrix</p>
          <h2>Every optical recipe</h2>
          <p>The same information card across three tones and two depths.</p>
        </div>
        <div className={styles.materialMatrix}>
          {tones.flatMap((materialTone) =>
            depths.map((materialDepth) => (
              <div className={styles.matrixScene} key={`${materialTone}-${materialDepth}`}>
                <span className={styles.orb} aria-hidden="true" />
                <span className={styles.matrixLines} aria-hidden="true" />
                <GlassSurface
                  className={styles.matrixGlass}
                  tone={materialTone}
                  depth={materialDepth}
                  radius="1.35rem"
                >
                  <span className={styles.matrixLabel}>{materialTone}</span>
                  <strong>{materialDepth} optics</strong>
                  <p>Blur, saturation, edge separation and internal light.</p>
                </GlassSurface>
              </div>
            )),
          )}
        </div>
      </section>

      <section id="contexts" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>04 / Interface contexts</p>
          <h2>Put it to work</h2>
          <p>Navigation, editorial cards, utility controls and transient feedback.</p>
        </div>

        <div className={styles.contextGrid}>
          <article className={`${styles.context} ${styles.navContext}`}>
            <span className={styles.contextLabel}>Navigation / colour field</span>
            <GlassSurface
              className={styles.glassNav}
              contentClassName={styles.glassNavContent}
              tone="smoked"
              depth="shallow"
              radius="999px"
            >
              <strong>FS</strong>
              <nav aria-label="Demo navigation">
                <a href="#contexts">Events</a>
                <a href="#materials">Archive</a>
                <a href="#controls">About</a>
              </nav>
              <GlassLink href="#controls" tone="signal">Latest</GlassLink>
            </GlassSurface>
          </article>

          <article className={`${styles.context} ${styles.posterContext}`}>
            <span className={styles.contextLabel}>Editorial card / photography</span>
            <GlassSurface className={styles.eventCard} tone="signal" depth="deep" radius="1.6rem">
              <span>Saturday / 10 PM</span>
              <h3>Frequency Shift 006</h3>
              <p>Club SAW, Ottawa</p>
              <GlassLink href="#controls" tone="clear">Event details</GlassLink>
            </GlassSurface>
          </article>

          <article className={`${styles.context} ${styles.captionContext}`}>
            <span className={styles.contextLabel}>Media caption / complex detail</span>
            <GlassSurface
              className={styles.captionCard}
              contentClassName={styles.captionCardContent}
              tone="clear"
              depth="shallow"
              radius="1.2rem"
            >
              <div>
                <span>Archive still / 04</span>
                <strong>Dopamine</strong>
              </div>
              <span>2024</span>
            </GlassSurface>
          </article>

          <article className={`${styles.context} ${styles.typeContext}`}>
            <span className={styles.contextLabel}>Floating dock / high contrast</span>
            <div className={styles.giantType} aria-hidden="true">SHIFT</div>
            <GlassSurface
              className={styles.dock}
              contentClassName={styles.dockContent}
              tone="smoked"
              depth="deep"
              radius="999px"
            >
              <GlassButton tone="clear">Previous</GlassButton>
              <span>04 / 18</span>
              <GlassButton tone="signal">Next</GlassButton>
            </GlassSurface>
          </article>

          <article className={`${styles.context} ${styles.lightContext}`}>
            <span className={styles.contextLabel}>Information / high-key field</span>
            <GlassSurface className={styles.lightCard} tone="smoked" depth="deep" radius="1.5rem">
              <span>Transmission note</span>
              <h3>Dark absorption preserves contrast.</h3>
              <p>The material remains recognisably glass without losing legibility on white.</p>
            </GlassSurface>
          </article>

          <article className={`${styles.context} ${styles.noticeContext}`}>
            <span className={styles.contextLabel}>Notification / atmospheric image</span>
            {noticeVisible ? (
              <GlassSurface
                className={styles.notice}
                contentClassName={styles.noticeContent}
                tone="clear"
                depth="deep"
                radius="1.25rem"
                role="status"
              >
                <div>
                  <strong>Transmission saved</strong>
                  <span>Your place in the frequency is held.</span>
                </div>
                <GlassButton tone="smoked" aria-label="Dismiss notification" onClick={() => setNoticeVisible(false)}>
                  Dismiss
                </GlassButton>
              </GlassSurface>
            ) : (
              <button className={styles.restoreNotice} type="button" onClick={() => setNoticeVisible(true)}>
                Restore notification
              </button>
            )}
          </article>
        </div>
      </section>

      <section id="controls" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>05 / Controls and states</p>
          <h2>Small surfaces</h2>
          <p>Hover, focus, press and disabled states retain the same optical language.</p>
        </div>
        <div className={styles.controlScene}>
          <GlassButton tone="clear">Clear action</GlassButton>
          <GlassButton tone="smoked">Smoked action</GlassButton>
          <GlassButton tone="signal">Signal action</GlassButton>
          <GlassLink href="#playground" tone="clear">Glass link</GlassLink>
          <GlassButton tone="signal" disabled>Unavailable</GlassButton>
        </div>
      </section>

      <footer className={styles.note}>
        Local-only prototype. This route is unavailable in production and no live site component
        imports the glass system.
      </footer>
    </div>
  );
}
