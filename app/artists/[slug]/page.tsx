import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { artists, getArtist } from "@/content/artists";

type ArtistPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const artist = getArtist((await params).slug);
  return artist
    ? { title: artist.name, description: artist.bio[0] }
    : { title: "Artist not found" };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const artist = getArtist((await params).slug);
  if (!artist) notFound();

  return (
    <article className="page-shell">
      <p className="eyebrow" data-reveal="up">Artist</p>
      <div className="detail-grid">
        <div className="detail-content">
          <h1 className="detail-title" data-reveal="clip">{artist.name}</h1>
          <div className="prose prose--large" data-reveal="up" style={{ "--reveal-delay": "70ms" } as React.CSSProperties}>
            {artist.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <aside data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          {artist.city ? <p>{artist.city}</p> : null}
          {artist.links.map((link) => (
            <p key={link.href}>
              <a className="text-link" href={link.href} rel="noreferrer" target="_blank">
                {link.label}
              </a>
            </p>
          ))}
        </aside>
      </div>
    </article>
  );
}
