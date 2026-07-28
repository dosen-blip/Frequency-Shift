import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
          <h1 className="detail-title">{entry.title}</h1>
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
                : "Event record"}
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
                  <picture>
                    <source
                      media="(max-width: 760px)"
                      srcSet={image.mobileSrcSet}
                      sizes="calc(100vw - 2rem)"
                    />
                    <img
                      src={image.src}
                      srcSet={image.srcSet}
                      sizes="(max-width: 1280px) 48vw, 600px"
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </figure>
              ))}
            </section>
          ) : null}
        </div>
        <aside data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
          <dl className="archive-provenance">
            {entry.photoCredit ? (
              <div>
                <dt>Photo credit</dt>
                <dd>{entry.photoCredit}</dd>
              </div>
            ) : null}
            <div>
              <dt>Sources</dt>
              <dd>
                {entry.sourceLinks.map((source) => (
                  <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
                    {source.label}
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
