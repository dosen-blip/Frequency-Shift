import type { ArchiveRecord } from "./types";

type ArchiveGallery = ArchiveRecord["gallery"];

export type PopulatedArchiveSlug =
  | "frequency-fest"
  | "frequency-shift-001"
  | "frequency-shift-002"
  | "frequency-shift-003"
  | "world-cup"
  | "dopamine";

function buildGallery(
  slug: string,
  title: string,
  dimensions: Array<readonly [number, number]>,
): ArchiveGallery {
  return dimensions.map(([width, height], index) => {
    const stem = `/media/archive/${slug}/${slug}-${String(index + 1).padStart(2, "0")}`;
    const responsiveSources = [
      width > 480 ? `${stem}-480.webp 480w` : null,
      width > 800 ? `${stem}-800.webp 800w` : null,
      `${stem}.webp ${width}w`,
    ].filter(Boolean);
    const mobileSources = [
      width > 480 ? `${stem}-480.webp 480w` : null,
      width > 800 ? `${stem}-800.webp 800w` : `${stem}.webp ${width}w`,
    ].filter(Boolean);

    return {
      src: `${stem}.webp`,
      srcSet: responsiveSources.join(", "),
      mobileSrcSet: mobileSources.join(", "),
      alt: `${title} event photograph ${index + 1} of ${dimensions.length}`,
      width,
      height,
    };
  });
}

export const archiveGalleries = {
  "frequency-fest": buildGallery(
    "frequency-fest",
    "Frequency Fest Vol. 1",
    [[1052,1402],[1179,1571],[1179,1571],[1440,1920],[1179,1571],[1179,1571],[1179,1571],[1179,1571],[1440,1920],[1179,1571],[1179,1571],[1179,1571],[1440,1918],[1069,1425],[1179,1571]],
  ),
  "frequency-shift-001": buildGallery(
    "frequency-shift-001",
    "Frequency Shift 001",
    [[1440,960],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,963],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961],[1440,961]],
  ),
  "frequency-shift-002": buildGallery(
    "frequency-shift-002",
    "Frequency Shift 002",
    [[1440,1344],[1440,1348],[1440,1348],[1440,1344],[1440,1348],[1440,1348],[1440,1344],[1440,1348],[1440,1344],[1440,1344],[1011,946]],
  ),
  "frequency-shift-003": buildGallery(
    "frequency-shift-003",
    "Frequency Shift 003",
    [[1364,908],[1324,886],[1365,913],[1364,908],[1365,913],[1364,908],[1365,913],[1365,913],[1338,895],[1365,913],[1089,612],[1089,612],[1089,612],[1104,621],[1089,612],[726,408]],
  ),
  "world-cup": buildGallery(
    "world-cup",
    "World Cup",
    [[1080,720],[1080,720],[1440,960],[1080,720],[1080,720],[1440,960],[1440,960],[1080,720],[1080,720],[1080,720]],
  ),
  "dopamine": buildGallery(
    "dopamine",
    "Dopamine",
    [[1179,1572],[1179,1572],[1178,1570],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1179,1572],[1178,1570],[1179,1572],[1179,1572]],
  ),
} satisfies Record<PopulatedArchiveSlug, ArchiveGallery>;
