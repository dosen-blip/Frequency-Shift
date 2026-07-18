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
      <Link href={`/archive/${entry.slug}`} aria-label={`View ${entry.title} archive`} prefetch={false}>
        <div
          className={`archive-card__visual${cover ? " archive-card__visual--photo" : ""}`}
          aria-hidden="true"
        >
          {featureImages.length ? (
            <div className="archive-card__feature-mosaic">
              {featureImages.map((image, imageIndex) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  loading={imageIndex === 0 ? "eager" : "lazy"}
                  fetchPriority={imageIndex === 0 ? "high" : "auto"}
                />
              ))}
            </div>
          ) : cover ? (
            <img
              src={cover.src}
              alt=""
              width={cover.width}
              height={cover.height}
              loading="lazy"
            />
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
          <span className="archive-card__action">View archive <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
    </article>
  );
}
