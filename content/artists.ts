import type { ArtistRecord } from "./types";

// Artist records are added when a lineup and publishable biography are approved.
// Keeping this empty avoids inventing biographies or social links.
export const artists: ArtistRecord[] = [];

export function getArtist(slug: string) {
  return artists.find((artist) => artist.slug === slug);
}
