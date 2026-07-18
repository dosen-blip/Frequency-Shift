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
          <p className="eyebrow" data-reveal="up">Archive / {entry.dateLabel}</p>
          <h1 className="detail-title" data-reveal="clip" style={{ "--reveal-delay": "45ms" } as React.CSSProperties}>{entry.title}</h1>
        </div>
        <dl className="detail-meta" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <div>
            <dt>Date</dt>
            <dd>
              <time dateTime={entry.dateIso}>{entry.dateLabel}</time>
            </dd>
          </div>
          {entry.locationLabel ? (
            <div>
              <dt>Location</dt>
              <dd>{entry.locationLabel}</dd>
            </div>
          ) : null}
          <div>
            <dt>Archive</dt>
            <dd>
              {entry.gallery.length
                ? `${entry.gallery.length} photographs`
                : `${entry.gallerySlotCount} image slots`}
            </dd>
          </div>
        </dl>
      </header>

      <div className="archive-detail-layout">
        <div className="detail-content">
          <p className="archive-summary" data-reveal="up">{entry.summary}</p>
          <div className="prose prose--large" data-reveal="up" style={{ "--reveal-delay": "70ms" } as React.CSSProperties}>
            {entry.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {entry.gallery.length ? (
            <section className="archive-gallery" aria-labelledby="gallery-heading">
              <h2 id="gallery-heading" className="sr-only">
                {entry.title} event gallery
              </h2>
              {entry.gallery.map((image, index) => (
                <figure
                  key={image.src}
                  data-reveal="media"
                  style={{ "--reveal-delay": `${Math.min(index, 3) * 70}ms` } as React.CSSProperties}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                  />
                </figure>
              ))}
            </section>
          ) : (
            <section className="archive-placeholder-section" aria-labelledby="gallery-heading">
              <div className="archive-placeholder-heading" data-reveal="up">
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
        <aside data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
          <p className="notice">
            {entry.gallery.length
              ? "Photography published in the event recaps is in place. Final captions and editorial sequencing remain open for review."
              : "Archive record established. Original event photography remains to be supplied and approved."}
          </p>
          <dl className="archive-provenance">
            {entry.photoCredit ? (
              <div>
                <dt>Photo credit</dt>
                <dd>{entry.photoCredit}</dd>
              </div>
            ) : null}
            <div>
              <dt>Classification</dt>
              <dd>{entry.sourceNote}</dd>
            </div>
            <div>
              <dt>Sources</dt>
              <dd>
                {entry.sourceLinks.map((source) => (
                  <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
                    {source.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </dd>
            </div>
          </dl>
          <Link className="text-link" href="/archive">
            Back to archive
          </Link>
        </aside>
      </div>
    </article>
  );
}
