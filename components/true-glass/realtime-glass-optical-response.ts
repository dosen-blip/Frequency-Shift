export const REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR = 1.1;
export const REALTIME_GLASS_MAX_CHROMATIC_SPREAD_CLEAR = 0.78;
export const REALTIME_GLASS_RESPONSE_COMPRESSION = 0.65;
export const REALTIME_GLASS_EDGE_REFRACTION_BOOST = 1.05;
export const REALTIME_GLASS_EDGE_REFRACTION_SCALE = 1 + REALTIME_GLASS_EDGE_REFRACTION_BOOST;
export const REALTIME_GLASS_OPTICAL_SHOULDER_RATIO = 0.3;
export const REALTIME_GLASS_OPTICAL_SHOULDER_MIN = 8;
export const REALTIME_GLASS_OPTICAL_SHOULDER_MAX = 64;
export const REALTIME_GLASS_OPTICAL_SHOULDER_LIMIT = 0.34;

/**
 * One asymptotic optical envelope spans the complete lens. It has no finite
 * center cutoff to expose, while its quadratic-exponential tail becomes
 * subpixel before a rounded rectangle's medial axis at calibrated widths.
 */
export function evaluateGlassOpticalEnvelope(normalizedDepth: number) {
  const depth = Math.max(Number.isFinite(normalizedDepth) ? normalizedDepth : 0, 0);
  return 2 ** -(0.5 * depth + 2 * depth * depth);
}

/**
 * A single normalized bend response shared by both renderers. Compression is
 * intentionally applied once here, so a second limiter cannot create a hidden
 * saturation contour farther into the material.
 */
export function evaluateGlassDisplacementResponse(normalizedDepth: number) {
  const envelope = evaluateGlassOpticalEnvelope(normalizedDepth);
  return Math.tanh(REALTIME_GLASS_RESPONSE_COMPRESSION * envelope)
    / Math.tanh(REALTIME_GLASS_RESPONSE_COMPRESSION);
}

/**
 * Concentrates additional optical power at the perimeter without introducing
 * a second band or cutoff. Because this is a smooth monotone function of the
 * existing bend, the edge grows more assertive while the center remains quiet.
 */
export function evaluateGlassRefractionResponse(normalizedDepth: number) {
  const bend = evaluateGlassDisplacementResponse(normalizedDepth);
  return bend * (1 + REALTIME_GLASS_EDGE_REFRACTION_BOOST * bend * bend);
}

/**
 * The SVG displacement texture must remain encodable in a normalized channel;
 * its filter scale restores the edge gain after sampling.
 */
export function evaluateGlassNormalizedRefractionResponse(normalizedDepth: number) {
  return evaluateGlassRefractionResponse(normalizedDepth)
    / REALTIME_GLASS_EDGE_REFRACTION_SCALE;
}

/**
 * Shared source keeps shader calibration and CPU-side regression tests from
 * silently drifting apart. Interpolate this after the fragment constants.
 */
export const REALTIME_GLASS_OPTICAL_RESPONSE_GLSL = `
const float GLASS_MAX_CHROMATIC_SPREAD_REGULAR = ${REALTIME_GLASS_MAX_CHROMATIC_SPREAD_REGULAR.toFixed(6)};
const float GLASS_MAX_CHROMATIC_SPREAD_CLEAR = ${REALTIME_GLASS_MAX_CHROMATIC_SPREAD_CLEAR.toFixed(6)};
const float GLASS_RESPONSE_COMPRESSION = ${REALTIME_GLASS_RESPONSE_COMPRESSION.toFixed(6)};
const float GLASS_EDGE_REFRACTION_BOOST = ${REALTIME_GLASS_EDGE_REFRACTION_BOOST.toFixed(6)};
const float GLASS_EDGE_REFRACTION_SCALE = ${REALTIME_GLASS_EDGE_REFRACTION_SCALE.toFixed(6)};
const float GLASS_OPTICAL_SHOULDER_RATIO = ${REALTIME_GLASS_OPTICAL_SHOULDER_RATIO.toFixed(6)};
const float GLASS_OPTICAL_SHOULDER_MIN = ${REALTIME_GLASS_OPTICAL_SHOULDER_MIN.toFixed(6)};
const float GLASS_OPTICAL_SHOULDER_MAX = ${REALTIME_GLASS_OPTICAL_SHOULDER_MAX.toFixed(6)};
const float GLASS_OPTICAL_SHOULDER_LIMIT = ${REALTIME_GLASS_OPTICAL_SHOULDER_LIMIT.toFixed(6)};

float glassOpticalEnvelope(float normalizedDepth) {
  float depth = max(normalizedDepth, 0.0);
  return exp2(-(0.5 * depth + 2.0 * depth * depth));
}

float glassDisplacementResponse(float normalizedDepth) {
  float envelope = glassOpticalEnvelope(normalizedDepth);
  return tanh(GLASS_RESPONSE_COMPRESSION * envelope)
    / tanh(GLASS_RESPONSE_COMPRESSION);
}

float glassRefractionResponse(float normalizedDepth) {
  float bend = glassDisplacementResponse(normalizedDepth);
  return bend * (1.0 + GLASS_EDGE_REFRACTION_BOOST * bend * bend);
}

float glassNormalizedRefractionResponse(float normalizedDepth) {
  return glassRefractionResponse(normalizedDepth) / GLASS_EDGE_REFRACTION_SCALE;
}

float glassMaxChromaticSpread(float materialMix) {
  return mix(
    GLASS_MAX_CHROMATIC_SPREAD_REGULAR,
    GLASS_MAX_CHROMATIC_SPREAD_CLEAR,
    clamp(materialMix, 0.0, 1.0)
  );
}
`;
