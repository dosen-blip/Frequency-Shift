import type { ArchiveRecord } from "./types";

type ArchiveGallery = ArchiveRecord["gallery"];

export type PopulatedArchiveSlug =
  | "techno-special"
  | "frequency-fest"
  | "frequency-shift-001"
  | "frequency-shift-002"
  | "frequency-shift-003"
  | "frequency-shift-004"
  | "world-cup"
  | "dopamine";

function buildGallery(
  slug: string,
  title: string,
  dimensions: Array<readonly [number, number]>,
  mediaLabel = "event photograph",
  altTexts?: string[],
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
      alt: altTexts?.[index] ?? `${title} ${mediaLabel} ${index + 1} of ${dimensions.length}`,
      width,
      height,
    };
  });
}

export const archiveGalleries = {
  "techno-special": buildGallery(
    "techno-special",
    "Techno Special",
    [
      [1280, 1920],
      [1280, 1920],
      [1280, 1920],
      [1920, 1280],
      [1280, 1920],
      [1920, 1280],
      [1280, 1920],
      [1279, 1920],
      [1280, 1920],
      [1280, 1920],
      [1280, 1920],
      [1280, 1920],
      [1280, 1920],
      [1920, 1280],
      [1920, 1280],
      [1280, 1920],
    ],
    "event photograph",
    [
      "A DJ in a pointed party hat at the decks, framed by red light and silhouettes.",
      "An orange beam cuts across the dancefloor beneath the glowing Frequency Shift roundel.",
      "A DJ in a leather jacket leans into the mixer under red and violet light.",
      "Red lasers fan over the decks and crowd in a wide view from behind the booth.",
      "A dancer in sunglasses turns beneath a diagonal red spotlight.",
      "Raised hands fill the dancefloor as red light sweeps across the crowd.",
      "A smiling DJ looks across the decks in blue-green and magenta light.",
      "Dancers crowd together under narrow white beams reaching across the room.",
      "Hands rise beyond the mixer as turquoise light washes over the front row.",
      "A DJ in headphones faces the red-lit dancefloor beneath geometric ceiling lights.",
      "Two DJs share the booth, with a capped performer smiling above the mixer.",
      "A raised arm breaks the silhouette of the crowd beneath bright crossing laser beams.",
      "A smiling DJ reaches across the decks against a deep red and blue background.",
      "A DJ is silhouetted against the Frequency Shift roundel and horizontal red lasers.",
      "White lasers cut across a wide view of the DJ booth and packed front row.",
      "A DJ raises both arms over the decks as the front row responds under red lights.",
    ],
  ),
  "frequency-fest": buildGallery(
    "frequency-fest",
    "Frequency Fest Vol. 1",
    [
      [1052, 1402],
      [1179, 1571],
      [1179, 1571],
      [1440, 1920],
      [1179, 1571],
      [1179, 1571],
      [1179, 1571],
      [1179, 1571],
      [1440, 1920],
      [1179, 1571],
      [1179, 1571],
      [1179, 1571],
      [1440, 1918],
      [1069, 1425],
      [1179, 1571],
      // Supplied Club SAW originals, in source order:
      // C_A09109, C_A09325, C_A09676, C_A09717, C_A09855, C_A09928,
      // C_A00064, C_A00229, C_A00268, C_A00403, C_A00464, C_A00509.
      [1920, 1281],
      [1920, 1281],
      [1280, 1920],
      [1920, 1281],
      [1920, 1281],
      [1920, 1281],
      [1920, 1281],
      [1920, 1281],
      [1920, 1281],
      [1920, 1281],
      [1920, 1281],
      [1920, 1281],
    ],
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
  "frequency-shift-004": buildGallery(
    "frequency-shift-004",
    "Frequency Shift 004",
    [
      [1179, 2096],
      [720, 1280],
    ],
    "event recap still frame",
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
