import type { ArtistRecord } from "./types";

// Artist records are added when a lineup is approved. Keeping this empty avoids
// publishing invented biographies or social links during the scaffold phase.
export const artists: ArtistRecord[] = [];

export function getArtist(slug: string) {
  return artists.find((artist) => artist.slug === slug);
}
