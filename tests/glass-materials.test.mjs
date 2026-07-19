import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { resolveRealtimeGlassMaterial } from "../components/true-glass/realtime-glass-materials.ts";
import {
  REALTIME_GLASS_EDGE_REFRACTION_BOOST,
  REALTIME_GLASS_EDGE_REFRACTION_SCALE,
  REALTIME_GLASS_MAX_CHROMATIC_SPREAD_CLEAR,
  REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR,
  REALTIME_GLASS_OPTICAL_SHOULDER_LIMIT,
  REALTIME_GLASS_OPTICAL_SHOULDER_MAX,
  REALTIME_GLASS_OPTICAL_SHOULDER_MIN,
  REALTIME_GLASS_OPTICAL_SHOULDER_RATIO,
  REALTIME_GLASS_OPTICAL_RESPONSE_GLSL,
  evaluateGlassDisplacementResponse,
  evaluateGlassNormalizedRefractionResponse,
  evaluateGlassOpticalEnvelope,
  evaluateGlassRefractionResponse,
} from "../components/true-glass/realtime-glass-optical-response.ts";

const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));

test("resolves the documented regular and clear material profiles", () => {
  const regular = resolveRealtimeGlassMaterial("regular");
  const clear = resolveRealtimeGlassMaterial("clear");

  assert.equal(regular.material, "regular");
  assert.equal(clear.material, "clear");
  assert.equal(regular.aberration, 1.1);
  assert.equal(clear.aberration, 0.78);
  assert.ok(regular.displacement > clear.displacement);
  assert.ok(regular.aberration > clear.aberration);
  assert.ok(regular.diffusion > clear.diffusion);
  assert.ok(regular.tint[3] > clear.tint[3]);
});

test("clamps intensity and tint without mutating the semantic base", () => {
  const absent = resolveRealtimeGlassMaterial({ base: "clear", intensity: -2 });
  const overdriven = resolveRealtimeGlassMaterial({
    base: "regular",
    intensity: 3,
    tint: [-1, 2, 0.4, 2],
  });

  assert.deepEqual(
    [absent.displacement, absent.aberration, absent.diffusion],
    [0, 0, 0],
  );
  assert.equal(absent.material, "clear");
  assert.deepEqual(overdriven.tint, [0, 1, 0.4, 0.32]);
  assert.equal(overdriven.displacement, 26);
});

test("uses one monotone asymptotic transfer with no finite inner cutoff", () => {
  assert.equal(evaluateGlassOpticalEnvelope(-1), 1);
  assert.equal(evaluateGlassOpticalEnvelope(0), 1);
  assert.ok(Math.abs(evaluateGlassOpticalEnvelope(1) - 2 ** -2.5) < 1e-12);
  assert.ok(Math.abs(evaluateGlassOpticalEnvelope(2) - 2 ** -9) < 1e-12);
  assert.equal(evaluateGlassDisplacementResponse(0), 1);
  assert.ok(evaluateGlassDisplacementResponse(2) > 0);

  let previous = evaluateGlassDisplacementResponse(0);
  for (let index = 1; index <= 4_096; index += 1) {
    const current = evaluateGlassDisplacementResponse(index / 2_048);
    assert.ok(
      current < previous,
      `response rebounded or plateaued at sample ${index}`,
    );
    assert.ok(current > 0 && current <= 1);
    previous = current;
  }
});

test("distributes displacement through the shoulder without a middle-third collapse", () => {
  const expected = new Map([
    [0, 1],
    [0.25, 0.871053],
    [0.5, 0.644309],
    [0.75, 0.395067],
    [1, 0.200119],
    [1.5, 0.029876],
    [2, 0.002221],
  ]);

  for (const [depth, target] of expected) {
    assert.ok(
      Math.abs(evaluateGlassDisplacementResponse(depth) - target) < 0.00001,
      `unexpected calibrated displacement at depth ${depth}`,
    );
  }
});

test("adds continuous edge-weighted lens power without a finite shoulder seam", () => {
  assert.equal(REALTIME_GLASS_EDGE_REFRACTION_BOOST, 1.05);
  assert.equal(REALTIME_GLASS_EDGE_REFRACTION_SCALE, 2.05);
  assert.equal(evaluateGlassRefractionResponse(0), 2.05);
  assert.equal(evaluateGlassNormalizedRefractionResponse(0), 1);

  const gains = [0, 0.25, 0.5, 1].map((depth) =>
    evaluateGlassRefractionResponse(depth) / evaluateGlassDisplacementResponse(depth));
  assert.ok(gains[0] > gains[1]);
  assert.ok(gains[1] > gains[2]);
  assert.ok(gains[2] > gains[3]);
  assert.ok(gains[3] > 1);

  let previous = evaluateGlassRefractionResponse(0);
  for (let index = 1; index <= 4_096; index += 1) {
    const depth = index / 2_048;
    const current = evaluateGlassRefractionResponse(depth);
    const normalized = evaluateGlassNormalizedRefractionResponse(depth);
    assert.ok(current < previous, `edge refraction rebounded at sample ${index}`);
    assert.ok(normalized > 0 && normalized <= 1);
    previous = current;
  }
});

test("shares the tested response with GLSL and bounds total chromatic separation", async () => {
  assert.equal(REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR, 1.1);
  assert.equal(REALTIME_GLASS_MAX_CHROMATIC_SPREAD_CLEAR, 0.78);
  assert.equal(REALTIME_GLASS_OPTICAL_SHOULDER_RATIO, 0.3);
  assert.equal(REALTIME_GLASS_OPTICAL_SHOULDER_MIN, 8);
  assert.equal(REALTIME_GLASS_OPTICAL_SHOULDER_MAX, 64);
  assert.equal(REALTIME_GLASS_OPTICAL_SHOULDER_LIMIT, 0.34);
  assert.ok(
    REALTIME_GLASS_MAX_CHROMATIC_SPREAD_CLEAR
      < REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR,
  );

  const shaderSource = await readFile(
    `${workspaceRoot}components/true-glass/realtime-glass-shaders.ts`,
    "utf8",
  );
  assert.match(
    shaderSource,
    /import\s*\{\s*REALTIME_GLASS_OPTICAL_RESPONSE_GLSL\s*\}\s*from/,
  );
  assert.match(shaderSource, /\$\{REALTIME_GLASS_OPTICAL_RESPONSE_GLSL\}/);
  assert.ok(REALTIME_GLASS_OPTICAL_RESPONSE_GLSL.includes("glassOpticalEnvelope"));
  assert.ok(
    (shaderSource.match(/\bglassDisplacementResponse\s*\(/g) ?? []).length >= 1,
    "fragment shader must call the shared displacement response",
  );
  assert.match(shaderSource, /restingOffset\s*=\s*-outwardNormal\s*\*\s*uDisplacement\s*\*\s*refractionResponse/);
  assert.ok(
    (shaderSource.match(/\bglassMaxChromaticSpread\s*\(/g) ?? []).length >= 1,
    "fragment shader must use the shared chromatic cap",
  );
  assert.match(
    shaderSource,
    /float\s+chromaSpread\s*=\s*min\(max\(uAberration,\s*0\.0\),\s*chromaCap\)\s*\*\s*bend/,
  );
  assert.match(shaderSource, /offsetRed\s*=\s*offsetGreen\s*\+\s*chromaOffset/);
  assert.match(shaderSource, /offsetBlue\s*=\s*offsetGreen\s*-\s*chromaOffset/);
  assert.match(shaderSource, /compressedTransmission\s*=\s*backdropAt\(point\s*\+\s*causticOffset\)/);
  assert.match(shaderSource, /pow\(normalizedRefraction,\s*2\.35\)/);
  assert.match(shaderSource, /uDebugMode\s*==\s*8/);

  for (let materialStep = 0; materialStep <= 10; materialStep += 1) {
    const materialMix = materialStep / 10;
    const cap = REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR
      + (REALTIME_GLASS_MAX_CHROMATIC_SPREAD_CLEAR
        - REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR) * materialMix;
    for (let depthStep = 0; depthStep <= 100; depthStep += 1) {
      const bend = evaluateGlassDisplacementResponse(depthStep / 100);
      for (const requestedSpread of [0, 0.1, 0.5, 10]) {
        const totalSeparation = Math.min(requestedSpread, cap) * bend;
        assert.ok(totalSeparation <= cap * bend + Number.EPSILON);
      }
    }
  }
});

test("keeps the arbitrary-content renderer on one continuous optical source", async () => {
  const source = await readFile(
    `${workspaceRoot}components/true-glass/true-glass.tsx`,
    "utf8",
  );

  assert.match(source, /evaluateGlassNormalizedRefractionResponse\s*\(/);
  assert.match(source, /REALTIME_GLASS_EDGE_REFRACTION_SCALE/);
  assert.match(source, /REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR/);
  assert.doesNotMatch(source, /CENTER_MASK|CLEAN_CENTER/);
  assert.doesNotMatch(source, /EDGE_MASK|REFRACTED_EDGE/);
  assert.match(source, /liveScale\s*\+\s*halfChromaticSpread/);
  assert.match(source, /liveScale\s*-\s*halfChromaticSpread/);
});

test("keeps edge reflections restrained and diagnostics false-colour", async () => {
  const [shaderSource, componentSource, componentStyles, stageStyles] = await Promise.all([
    readFile(`${workspaceRoot}components/true-glass/realtime-glass-shaders.ts`, "utf8"),
    readFile(`${workspaceRoot}components/true-glass/true-glass.tsx`, "utf8"),
    readFile(`${workspaceRoot}components/true-glass/true-glass.module.css`, "utf8"),
    readFile(`${workspaceRoot}components/true-glass/realtime-glass-stage.module.css`, "utf8"),
  ]);

  assert.match(shaderSource, /fresnel\s*\*\s*0\.115/);
  assert.match(shaderSource, /brightEdge\s*\*\s*mix\(0\.075,\s*0\.10/);
  assert.doesNotMatch(shaderSource, /color\s*=\s*vec3\(bend,\s*opticalField,\s*normalizedOffset\)/);
  assert.match(
    shaderSource,
    /glassNormalizedRefractionResponse\(normalizedDepth\)\s*\*\s*0\.46\s*\+\s*normalizedOffset\s*\*\s*0\.08/,
  );

  assert.match(componentSource, /--glass-rim-energy",\s*\(0\.44\s*\+\s*energy\s*\*\s*0\.07/);
  assert.match(componentStyles, /--glass-rim-energy:\s*0\.44/);
  assert.doesNotMatch(componentStyles, /rgba\(255,\s*255,\s*255,\s*0\.62\)/);
  assert.match(stageStyles, /rgba\(205,\s*225,\s*242,\s*0\.075\)/);
});

test("keeps media-query listeners compatible with legacy Safari", async () => {
  const source = await readFile(
    `${workspaceRoot}components/true-glass/realtime-glass-engine.ts`,
    "utf8",
  );

  assert.match(source, /typeof\s+query\.addEventListener\s*===\s*["']function["']/);
  assert.match(source, /query\.addListener\(listener\)/);
  assert.match(source, /query\.removeListener\(listener\)/);
});

test("keeps the glass lab behind serve-only middleware and out of public modules", async () => {
  const viteConfig = await readFile(`${workspaceRoot}vite.config.ts`, "utf8");
  assert.match(viteConfig, /function\s+localGlassLab\s*\(/);
  assert.match(viteConfig, /apply:\s*["']serve["']/);
  assert.match(viteConfig, /pathname\s*!==\s*["']\/glass-lab["']/);

  for (const root of ["app", "components"]) {
    const absoluteRoot = `${workspaceRoot}${root}`;
    const paths = await readdir(absoluteRoot, { recursive: true });
    const publicModules = paths.filter((path) =>
      /\.(?:[cm]?[jt]sx?)$/.test(path)
      && !path.startsWith("glass-lab/")
      && !path.startsWith("true-glass/"),
    );
    const source = (
      await Promise.all(
        publicModules.map((path) => readFile(`${absoluteRoot}/${path}`, "utf8")),
      )
    ).join("\n");

    assert.doesNotMatch(
      source,
      /(?:from\s*["'][^"']*true-glass|import\s*\([^)]*true-glass|glass-lab-root)/,
      `${root} must not import the local-only glass implementation`,
    );
  }
});
