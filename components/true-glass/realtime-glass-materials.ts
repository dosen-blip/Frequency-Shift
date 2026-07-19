export type RealtimeGlassTint = readonly [red: number, green: number, blue: number, amount: number];

export type RealtimeGlassMaterial =
  | "regular"
  | "clear"
  | {
      base: "regular" | "clear";
      intensity?: number;
      tint?: RealtimeGlassTint;
    };

export type ResolvedRealtimeGlassMaterial = {
  material: "regular" | "clear";
  displacement: number;
  aberration: number;
  diffusion: number;
  tint: RealtimeGlassTint;
};

const REGULAR_MATERIAL: ResolvedRealtimeGlassMaterial = {
  material: "regular",
  displacement: 26,
  aberration: 1.1,
  diffusion: 0.38,
  tint: [0.44, 0.5, 0.62, 0.055],
};

const CLEAR_MATERIAL: ResolvedRealtimeGlassMaterial = {
  material: "clear",
  displacement: 22,
  aberration: 0.78,
  diffusion: 0.16,
  tint: [0.52, 0.57, 0.66, 0.025],
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function resolveRealtimeGlassMaterial(
  material: RealtimeGlassMaterial | undefined,
): ResolvedRealtimeGlassMaterial {
  const descriptor = typeof material === "object" ? material : null;
  const base = descriptor?.base ?? material ?? "regular";
  const preset = base === "clear" ? CLEAR_MATERIAL : REGULAR_MATERIAL;
  const intensity = clamp(finiteOr(descriptor?.intensity, 1), 0, 1);
  const tint = descriptor?.tint ?? preset.tint;
  return {
    material: preset.material,
    displacement: preset.displacement * intensity,
    aberration: preset.aberration * intensity,
    diffusion: preset.diffusion * intensity,
    tint: [
      clamp(finiteOr(tint[0], preset.tint[0]), 0, 1),
      clamp(finiteOr(tint[1], preset.tint[1]), 0, 1),
      clamp(finiteOr(tint[2], preset.tint[2]), 0, 1),
      clamp(finiteOr(tint[3], preset.tint[3]), 0, 0.32),
    ],
  };
}
