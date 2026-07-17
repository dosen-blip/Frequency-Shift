import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveImagePlaceholder } from "@/components/archive-image-placeholder";
import { archives, getArchive } from "@/content/archives";

type ArchivePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return archives.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  const entry = getArchive((await params).slug);
  return entry
    ? { title: entry.title, description: entry.summary }
    : { title: "Archive entry not found" };
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const entry = getArchive((await params).slug);
  if (!entry) notFound();

  return (
    <article className="page-shell">
      <header className="archive-detail-hero">
        <div>
          <p className="eyebrow">Archive / {entry.dateLabel}</p>
          <h1 className="detail-title">{entry.title}</h1>
        </div>
        <dl className="detail-meta">
          <div>
            <dt>Date</dt>
            <dd>{entry.dateLabel}</dd>
          </div>
          {entry.locationLabel ? (
            <div>
              <dt>Location</dt>
              <dd>{entry.locationLabel}</dd>
            </div>
          ) : null}
          <div>
            <dt>Archive</dt>
            <dd>{entry.gallerySlotCount} image slots</dd>
          </div>
        </dl>
      </header>

      <div className="archive-detail-layout">
        <div className="detail-content">
          <p className="archive-summary">{entry.summary}</p>
          <div className="prose prose--large">
            {entry.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {entry.gallery.length ? (
            <div className="archive-gallery" aria-label={`${entry.title} gallery`}>
              {entry.gallery.map((image) => (
                <figure key={image.src}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>
          ) : (
            <section className="archive-placeholder-section" aria-labelledby="gallery-heading">
              <div className="archive-placeholder-heading">
                <div>
                  <p className="eyebrow">Contact sheet</p>
                  <h2 id="gallery-heading">Event images</h2>
                </div>
                <p>Photography placeholders / final edit pending</p>
              </div>
              <div className="archive-placeholder-grid">
                {Array.from({ length: entry.gallerySlotCount }, (_, index) => (
                  <ArchiveImagePlaceholder key={index} eventTitle={entry.title} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside>
          <p className="notice">Archive record established. Final photography, captions, credits, and editorial copy remain to be approved.</p>
          <Link className="text-link" href="/archive">
            Back to archive
          </Link>
        </aside>
      </div>
    </article>
  );
}
