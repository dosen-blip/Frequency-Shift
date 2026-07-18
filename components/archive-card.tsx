import Link from "next/link";
import type { ArchiveRecord } from "@/content/types";

type ArchiveCardProps = {
  entry: ArchiveRecord;
};

export function ArchiveCard({ entry }: ArchiveCardProps) {
  const cover = entry.gallery[entry.coverImageIndex];
  const featureImages = (entry.featureImageIndices ?? [])
    .map((imageIndex) => entry.gallery[imageIndex])
    .filter(Boolean);

  return (
    <article className={`archive-card${entry.featured ? " archive-card--featured" : ""}`}>
      <Link href={`/archive/${entry.slug}`} aria-label={`View ${entry.title} archive`}>
        <div
          className={`archive-card__visual${cover ? " archive-card__visual--photo" : ""}`}
          aria-hidden="true"
        >
          {featureImages.length ? (
            <div className="archive-card__feature-mosaic">
              {featureImages.map((image) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  loading="eager"
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
          <span className="archive-card__action">View archive <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
    </article>
  );
}
