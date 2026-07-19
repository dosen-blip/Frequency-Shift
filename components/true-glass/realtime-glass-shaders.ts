import { REALTIME_GLASS_OPTICAL_RESPONSE_GLSL } from "./realtime-glass-optical-response";

/**
 * The realtime renderer deliberately samples only the stage's registered media.
 * Browsers do not expose arbitrary DOM pixels to WebGL, so semantic content is
 * composited above the canvas by RealtimeGlassStage.
 */
export const REALTIME_GLASS_VERTEX_SHADER = `#version 300 es
precision highp float;

const vec2 POSITIONS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2(3.0, -1.0),
  vec2(-1.0, 3.0)
);

void main() {
  gl_Position = vec4(POSITIONS[gl_VertexID], 0.0, 1.0);
}
`;

export const REALTIME_GLASS_FRAGMENT_SHADER = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D uBackdrop;
uniform vec2 uStageSize;
uniform vec2 uFramebufferScale;
uniform vec2 uImageSize;
uniform vec2 uCoverPosition;
uniform vec4 uLensRect;
uniform float uRadius;
uniform vec4 uRadii;
uniform float uDisplacement;
uniform float uAberration;
uniform float uDiffusion;
uniform float uMaterial;
uniform float uEnergy;
uniform vec2 uContact;
uniform vec2 uLightDirection;
uniform vec4 uTint;
uniform float uOpacity;
uniform int uQualityTier;
uniform int uDebugMode;

out vec4 outColor;

const float EPSILON = 0.00001;

${REALTIME_GLASS_OPTICAL_RESPONSE_GLSL}

float luminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec4 resolvedRadii(vec2 halfSize) {
  float maximumRadius = min(halfSize.x, halfSize.y);
  vec4 radii = uRadii;
  if (dot(abs(radii), vec4(1.0)) < EPSILON) {
    radii = vec4(uRadius);
  }
  return clamp(radii, vec4(0.0), vec4(maximumRadius));
}

// Preserve the previous implementation's circular CSS-corner geometry. The
// optical transfer is calibrated separately so corner shape cannot alter the
// strength of the material.
float roundedRectangleDistance(vec2 point, vec2 center, vec2 halfSize, vec4 radii) {
  vec2 local = point - center;
  float radius = local.x > 0.0
    ? (local.y > 0.0 ? radii.z : radii.y)
    : (local.y > 0.0 ? radii.w : radii.x);
  vec2 q = abs(local) - halfSize + vec2(radius);
  return min(max(q.x, q.y), 0.0)
    + length(max(q, vec2(0.0)))
    - radius;
}

float baseLensDistance(vec2 point) {
  vec2 center = uLensRect.xy + uLensRect.zw * 0.5;
  vec2 halfSize = max(uLensRect.zw * 0.5, vec2(1.0));
  return roundedRectangleDistance(point, center, halfSize, resolvedRadii(halfSize));
}

vec2 coverCoordinates(vec2 stagePoint) {
  float coverScale = max(uStageSize.x / uImageSize.x, uStageSize.y / uImageSize.y);
  vec2 renderedSize = uImageSize * coverScale;
  vec2 offset = (uStageSize - renderedSize) * uCoverPosition;
  vec2 uv = (stagePoint - offset) / renderedSize;
  return vec2(uv.x, 1.0 - uv.y);
}

vec3 backdropAt(vec2 stagePoint) {
  vec2 uv = clamp(coverCoordinates(stagePoint), vec2(0.001), vec2(0.999));
  return texture(uBackdrop, uv).rgb;
}

vec2 contactFieldGradient(vec2 point, vec2 center, vec2 halfSize) {
  vec2 local = (point - center) / halfSize;
  vec2 delta = local - uContact;
  float radiusSquared = dot(delta, delta);
  float nearField = exp(-radiusSquared * 0.72);
  float farField = exp(-radiusSquared * 0.18);
  // Two unbounded low-frequency modes spread pressure across the complete
  // material. There is no hidden cutoff contour or pointer-sized light spot.
  vec2 localGradient = -2.0 * delta
    * (0.4464 * nearField + 0.0684 * farField)
    * uEnergy;
  return localGradient / halfSize;
}

vec2 softLimitOffset(vec2 offset, float maximumOffset) {
  float limit = max(maximumOffset, EPSILON);
  float magnitude = length(offset);
  if (magnitude <= EPSILON || maximumOffset <= EPSILON) {
    return vec2(0.0);
  }
  float ratio = magnitude / limit;
  return offset * (tanh(ratio) / ratio);
}

vec2 normalizedOrZero(vec2 vector) {
  float magnitude = length(vector);
  return magnitude > 0.0001 ? vector / magnitude : vec2(0.0);
}

// Reconstructed pre-final-sprint height field used only by diagnostic mode 8.
// It remains a visual reference while mode 0 uses the new transfer model.
float previousHeightField(vec2 point, float shoulderWidth, vec2 center, vec2 halfSize) {
  vec2 local = (point - center) / halfSize;
  vec2 delta = local - uContact;
  float contact = exp(-dot(delta, delta) * 1.15) * uEnergy;
  float deformedDistance = baseLensDistance(point) - contact * 2.8;
  float inward = max(-deformedDistance, 0.0);
  float edge = 1.0 - smoothstep(0.0, shoulderWidth, inward);
  float pressure = exp(-dot(delta, delta) * 1.55) * uEnergy * 0.14;
  float wholeSurface = exp(-dot(delta, delta) * 0.48) * uEnergy * 0.055;
  return edge * 0.82 + pressure + wholeSurface;
}

void main() {
  vec2 point = vec2(
    gl_FragCoord.x / uFramebufferScale.x,
    uStageSize.y - gl_FragCoord.y / uFramebufferScale.y
  );
  vec2 center = uLensRect.xy + uLensRect.zw * 0.5;
  vec2 halfSize = max(uLensRect.zw * 0.5, vec2(1.0));
  bool previousBaseline = uDebugMode == 8;
  vec2 local = (point - center) / halfSize;
  vec2 contactDelta = local - uContact;
  float previousContact = exp(-dot(contactDelta, contactDelta) * 1.15) * uEnergy;
  float baseDistanceToShape = baseLensDistance(point);
  float distanceToShape = previousBaseline
    ? baseDistanceToShape - previousContact * 2.8
    : baseDistanceToShape;
  float antialias = max(fwidth(distanceToShape), 0.65);
  float mask = 1.0 - smoothstep(-antialias, antialias, distanceToShape);
  if (mask <= 0.001) {
    discard;
  }

  float shortSide = min(uLensRect.z, uLensRect.w);
  float materialMix = clamp(uMaterial, 0.0, 1.0);
  float opticalWidth = min(
    clamp(
      shortSide * mix(GLASS_OPTICAL_SHOULDER_RATIO, GLASS_OPTICAL_SHOULDER_RATIO * 0.90, materialMix),
      GLASS_OPTICAL_SHOULDER_MIN,
      GLASS_OPTICAL_SHOULDER_MAX
    ),
    shortSide * GLASS_OPTICAL_SHOULDER_LIMIT
  );
  float previousHeightWidth = clamp(shortSide * 0.28, 8.0, 28.0);
  float sampleStep = 1.0 / max(min(uFramebufferScale.x, uFramebufferScale.y), 0.65);
  float inward = max(-baseDistanceToShape, 0.0);
  float normalizedDepth = inward / max(opticalWidth, EPSILON);
  float opticalField = glassOpticalEnvelope(normalizedDepth);
  float bend = glassDisplacementResponse(normalizedDepth);
  float refractionResponse = glassRefractionResponse(normalizedDepth);
  float normalizedRefraction = clamp(
    refractionResponse / GLASS_EDGE_REFRACTION_SCALE,
    0.0,
    1.0
  );

  float distanceLeft = baseLensDistance(point - vec2(sampleStep, 0.0));
  float distanceRight = baseLensDistance(point + vec2(sampleStep, 0.0));
  float distanceTop = baseLensDistance(point - vec2(0.0, sampleStep));
  float distanceBottom = baseLensDistance(point + vec2(0.0, sampleStep));
  vec2 distanceGradient = vec2(
    distanceRight - distanceLeft,
    distanceBottom - distanceTop
  ) / (2.0 * sampleStep);
  vec2 outwardNormal = normalizedOrZero(distanceGradient);
  vec2 interactionGradient = contactFieldGradient(point, center, halfSize);

  // Edge-only optical gain increases the apparent lens power without changing
  // the lighting, aberration budget or the seam-free asymptotic profile.
  vec2 restingOffset = -outwardNormal * uDisplacement * refractionResponse;
  vec2 interactionRaw = interactionGradient
    * shortSide
    * uDisplacement
    * 0.060;
  vec2 interactionOffset = softLimitOffset(
    interactionRaw,
    max(uDisplacement * 0.085, 0.35)
  );
  vec2 offsetGreen = restingOffset + interactionOffset;
  vec2 surfaceTilt = outwardNormal
    * normalizedRefraction
    * mix(0.74, 0.63, materialMix)
    - interactionGradient * shortSide * 0.08;
  vec3 surfaceNormal = normalize(vec3(surfaceTilt, 1.0));
  float edgeDepth = normalizedRefraction;
  float heightCenter = opticalField;

  float chromaCap = glassMaxChromaticSpread(materialMix);
  float chromaSpread = min(max(uAberration, 0.0), chromaCap) * bend;
  vec2 chromaOffset = normalizedOrZero(offsetGreen) * chromaSpread * 0.5;
  vec2 offsetRed = offsetGreen + chromaOffset;
  vec2 offsetBlue = offsetGreen - chromaOffset;

  if (previousBaseline) {
    float previousCenter = previousHeightField(
      point, previousHeightWidth, center, halfSize
    );
    float previousLeft = previousHeightField(
      point - vec2(sampleStep, 0.0), previousHeightWidth, center, halfSize
    );
    float previousRight = previousHeightField(
      point + vec2(sampleStep, 0.0), previousHeightWidth, center, halfSize
    );
    float previousTop = previousHeightField(
      point - vec2(0.0, sampleStep), previousHeightWidth, center, halfSize
    );
    float previousBottom = previousHeightField(
      point + vec2(0.0, sampleStep), previousHeightWidth, center, halfSize
    );
    vec2 previousGradient = vec2(
      previousRight - previousLeft,
      previousBottom - previousTop
    ) / (2.0 * sampleStep);
    vec3 previousNormal = normalize(vec3(
      -previousGradient * 12.0 + contactDelta * previousContact * 1.35,
      1.0
    ));
    vec3 previousRay = refract(
      vec3(0.0, 0.0, -1.0),
      previousNormal,
      1.0 / 1.5
    );
    vec2 previousBend = previousRay.xy / max(abs(previousRay.z), 0.25);
    float previousInward = max(-distanceToShape, 0.0);
    float previousEdgeEnergy = 1.0 - smoothstep(
      0.0,
      clamp(shortSide * 0.30, 9.0, 30.0),
      previousInward
    );
    offsetGreen = previousBend
      * uDisplacement
      * clamp(previousEdgeEnergy * 0.88 + uEnergy * 0.22, 0.0, 1.0);
    float previousAberration = mix(1.35, 1.10, materialMix);
    float previousSplit = previousAberration * (0.15 + previousEdgeEnergy * 0.85);
    vec2 previousDirection = normalizedOrZero(previousBend);
    offsetRed = offsetGreen + previousDirection * previousSplit;
    offsetBlue = offsetGreen - previousDirection * previousSplit * 0.82;
    surfaceNormal = previousNormal;
    edgeDepth = previousEdgeEnergy;
    heightCenter = previousCenter;
  }

  vec3 refracted = vec3(
    backdropAt(point + offsetRed).r,
    backdropAt(point + offsetGreen).g,
    backdropAt(point + offsetBlue).b
  );
  // A second, closely related ray gives the thick shoulder the compressed
  // transmission visible in deep moulded glass. It is strongest at the outer
  // perimeter and disappears continuously before the calm reading field.
  float causticWeight = pow(normalizedRefraction, 2.35)
    * mix(0.22, 0.15, materialMix);
  vec2 causticDirection = normalizedOrZero(offsetGreen);
  vec2 causticOffset = offsetGreen * 0.74
    - causticDirection * min(uDisplacement * 0.055, 1.5);
  vec3 compressedTransmission = backdropAt(point + causticOffset);
  refracted = mix(refracted, compressedTransmission, causticWeight);

  // Symmetric, deterministic diffusion avoids the diagonal streak and temporal
  // shimmer produced by an animated or one-axis kernel.
  float roughness = clamp(uDiffusion, 0.0, 1.0) * mix(1.0, 0.42, uMaterial);
  float edgeDiffraction = pow(normalizedRefraction, 1.8);
  float diffusionRadius = mix(0.75, 4.2, roughness)
    + edgeDiffraction * mix(3.2, 2.35, materialMix);
  vec2 axisX = vec2(diffusionRadius, 0.0);
  vec2 axisY = vec2(0.0, diffusionRadius);
  vec3 sampleXPositive = backdropAt(point + offsetGreen + axisX);
  vec3 sampleXNegative = backdropAt(point + offsetGreen - axisX);
  vec3 sampleYPositive = sampleXPositive;
  vec3 sampleYNegative = sampleXNegative;
  if (uQualityTier >= 2) {
    sampleYPositive = backdropAt(point + offsetGreen + axisY);
    sampleYNegative = backdropAt(point + offsetGreen - axisY);
  }
  vec3 neighborhood = uQualityTier >= 2
    ? (sampleXPositive + sampleXNegative + sampleYPositive + sampleYNegative) * 0.25
    : (sampleXPositive + sampleXNegative) * 0.5;
  float localLuma = luminance(refracted);
  vec4 lumaSamples = vec4(
    luminance(sampleXPositive), luminance(sampleXNegative),
    luminance(sampleYPositive), luminance(sampleYNegative)
  );
  float lumaMinimum = min(min(lumaSamples.x, lumaSamples.y), min(lumaSamples.z, lumaSamples.w));
  float lumaMaximum = max(max(lumaSamples.x, lumaSamples.y), max(lumaSamples.z, lumaSamples.w));
  float complexity = clamp(lumaMaximum - lumaMinimum, 0.0, 1.0);
  float complexityResponse = smoothstep(0.035, 0.31, complexity);
  float diffusionMix = roughness * complexityResponse * mix(0.76, 0.42, uMaterial);
  diffusionMix = max(
    diffusionMix,
    edgeDiffraction * complexityResponse * mix(0.34, 0.23, materialMix)
  );
  if (uQualityTier == 0) {
    diffusionMix *= 0.78;
  }
  vec3 color = mix(refracted, neighborhood, diffusionMix);

  // Content adaptivity compresses extremes just enough to keep glass edges and
  // overlaid semantics legible, without turning clear glass into frosted glass.
  float clearResponse = materialMix;
  float adaptiveLift = (0.5 - localLuma) * mix(0.055, 0.028, clearResponse);
  float detailDamping = complexityResponse * mix(0.025, 0.012, clearResponse);
  color += vec3(adaptiveLift);
  color = mix(color, vec3(localLuma), detailDamping);
  // Real thickness absorbs a small amount of transmission at grazing angles.
  // This is neutral density, not a painted border, and therefore follows the
  // same continuous surface depth as refraction and diffraction.
  color *= 1.0 - pow(normalizedRefraction, 1.45)
    * mix(0.065, 0.042, clearResponse);

  // Reflection is coupled to the same broad environmental source for every
  // component. Interaction changes the normal and therefore the reflection.
  vec2 lightXY = length(uLightDirection) > EPSILON
    ? normalize(uLightDirection)
    : normalize(vec2(-0.65, -0.76));
  vec3 lightDirection = normalize(vec3(lightXY, 0.92));
  vec3 viewDirection = vec3(0.0, 0.0, 1.0);
  vec3 halfDirection = normalize(lightDirection + viewDirection);
  float normalFacing = clamp(dot(surfaceNormal, viewDirection), 0.0, 1.0);
  float fresnel = 0.04 + 0.96 * pow(1.0 - normalFacing, 5.0);
  float broadSpecular = pow(max(dot(surfaceNormal, halfDirection), 0.0), mix(8.0, 13.0, clearResponse));
  float directionalEdge = smoothstep(-0.42, 0.72, dot(surfaceNormal.xy, lightXY));
  float opposingEdge = smoothstep(-0.38, 0.78, dot(-surfaceNormal.xy, lightXY));
  float brightEdge = edgeDepth * directionalEdge;
  float darkEdge = edgeDepth * opposingEdge;
  // Keep the rim subordinate to the refracted scene. A bright neutral rim reads
  // as a painted diffraction halo, so the reflection remains dim, cool and
  // directional while the opposing edge supplies most of the perceived depth.
  vec3 reflectionColor = mix(vec3(0.13, 0.16, 0.21), vec3(0.20, 0.24, 0.31), clearResponse);
  color += reflectionColor * (fresnel * 0.115 + broadSpecular * mix(0.075, 0.095, clearResponse));
  color += vec3(0.11, 0.15, 0.20) * brightEdge * mix(0.075, 0.10, clearResponse);
  color *= 1.0 - darkEdge * mix(0.12, 0.16, clearResponse);
  float tintMix = clamp(uTint.a, 0.0, 0.32) * mix(1.0, 0.58, clearResponse);
  color = mix(color, uTint.rgb, tintMix);

  float alpha = mask * clamp(uOpacity, 0.0, 1.0);
  if (uDebugMode == 1) {
    color = vec3(mask);
    alpha = 1.0;
  } else if (uDebugMode == 2) {
    color = vec3(clamp(heightCenter, 0.0, 1.0));
    alpha = 1.0;
  } else if (uDebugMode == 3) {
    color = surfaceNormal * 0.5 + 0.5;
    alpha = 1.0;
  } else if (uDebugMode == 4) {
    vec2 vectorView = offsetGreen / max(uDisplacement, 1.0);
    color = vec3(vectorView * 0.5 + 0.5, clamp(length(vectorView), 0.0, 1.0));
    alpha = 1.0;
  } else if (uDebugMode == 5) {
    vec2 spread = (offsetBlue - offsetRed) / max(uDisplacement, 1.0);
    color = vec3(clamp(abs(spread) * 8.0, 0.0, 1.0), clamp(length(spread) * 8.0, 0.0, 1.0));
    alpha = 1.0;
  } else if (uDebugMode == 6) {
    color = vec3(roughness, complexity, complexityResponse);
    alpha = 1.0;
  } else if (uDebugMode == 7) {
    // Frozen pre-sprint optical model for direct A/B review in the local lab.
    // This intentionally uses one scalar bend and a uniform RGB split.
    vec2 legacyDirection = length(offsetGreen) > EPSILON
      ? normalize(offsetGreen)
      : vec2(0.0);
    float legacyAberration = mix(1.35, 1.10, materialMix);
    float legacySplit = legacyAberration * (0.15 + edgeDepth * 0.85);
    vec3 legacyRefracted = vec3(
      backdropAt(point + offsetGreen + legacyDirection * legacySplit).r,
      backdropAt(point + offsetGreen).g,
      backdropAt(point + offsetGreen - legacyDirection * legacySplit * 0.82).b
    );
    float legacyRadius = 1.5 + uDiffusion * 3.5;
    vec2 legacyTap = vec2(legacyRadius * 0.70710678);
    vec3 legacyPlus = backdropAt(point + offsetGreen + legacyTap);
    vec3 legacyMinus = backdropAt(point + offsetGreen - legacyTap);
    vec3 legacyDiffused = (legacyRefracted * 2.0 + legacyPlus + legacyMinus) * 0.25;
    float legacyComplexity = max(
      abs(legacyPlus.r - legacyMinus.r),
      max(abs(legacyPlus.g - legacyMinus.g), abs(legacyPlus.b - legacyMinus.b))
    );
    color = mix(
      legacyRefracted,
      legacyDiffused,
      smoothstep(0.055, 0.34, legacyComplexity) * clamp(uDiffusion, 0.0, 1.0)
    );
    color = mix(color, uTint.rgb, clamp(uTint.a, 0.0, 0.32));
  } else if (uDebugMode == 9) {
    // False-colour diagnostic: red tracks calibrated bend, green the optical
    // envelope, and blue the final offset. Keeping channel peaks below white
    // prevents this instrumentation view from resembling a literal rim effect.
    float normalizedOffset = clamp(
      length(offsetGreen) / max(uDisplacement, 1.0),
      0.0,
      1.0
    );
    color = vec3(
      glassNormalizedRefractionResponse(normalizedDepth) * 0.46 + normalizedOffset * 0.08,
      opticalField * 0.16 + normalizedOffset * 0.05,
      opticalField * 0.32 + normalizedOffset * 0.38
    );
    alpha = 1.0;
  }

  outColor = vec4(color * alpha, alpha);
}
`;
