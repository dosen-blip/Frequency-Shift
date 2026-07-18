import Link from "next/link";
import type { ArchiveRecord } from "@/content/types";

type ArchiveCardProps = {
  entry: ArchiveRecord;
  revealIndex?: number;
};

export function ArchiveCard({ entry, revealIndex = 0 }: ArchiveCardProps) {
  const cover = entry.gallery[entry.coverImageIndex];
  const featureImages = (entry.featureImageIndices ?? [])
    .map((imageIndex) => entry.gallery[imageIndex])
    .filter(Boolean);

  return (
    <article
      className={`archive-card${entry.featured ? " archive-card--featured" : ""}`}
      data-reveal="card"
      style={{ "--reveal-delay": `${Math.min(revealIndex, 3) * 70}ms` } as React.CSSProperties}
    >
      <Link href={`/archive/${entry.slug}`} aria-label={`View ${entry.title} archive`}>
        <div
          className={`archive-card__visual${cover ? " archive-card__visual--photo" : ""}`}
          aria-hidden="true"
        >
          {featureImages.length ? (
            <div className="archive-card__feature-mosaic">
              {featureImages.map((image) => (
                <picture key={image.src}>
                  <source
                    media="(max-width: 760px)"
                    srcSet={image.mobileSrcSet}
                    sizes="calc(100vw - 2rem)"
                  />
                  <img
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes="30vw"
                    alt=""
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              ))}
            </div>
          ) : cover ? (
            <picture>
              <source
                media="(max-width: 760px)"
                srcSet={cover.mobileSrcSet}
                sizes="calc(100vw - 2rem)"
              />
              <img
                src={cover.src}
                srcSet={cover.srcSet}
                sizes="48vw"
                alt=""
                width={cover.width}
                height={cover.height}
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : null}
          <span className="archive-card__index">{entry.archiveLabel}</span>
          <span className="archive-card__pending">
            {entry.featured ? "Pinned archive" : cover ? "Photo archive" : "Image pending"}
          </span>
          {cover ? null : <span className="archive-card__mark">F/S</span>}
        </div>
        <div className="archive-card__overlay">
          <div className="archive-card__meta">
            <time dateTime={entry.dateIso}>{entry.dateLabel}</time>
            <span>
              {entry.gallery.length
                ? `${entry.gallery.length} photographs`
                : `${entry.gallerySlotCount} image slots`}
            </span>
          </div>
          <h2>{entry.title}</h2>
          <p className="archive-card__summary">{entry.summary}</p>
          <span className="archive-card__action">View archive</span>
        </div>
      </Link>
    </article>
  );
}
