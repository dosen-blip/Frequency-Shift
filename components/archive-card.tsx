import Link from "next/link";
import type { ArchiveRecord } from "@/content/types";

type ArchiveCardProps = {
  entry: ArchiveRecord;
  index: number;
};

export function ArchiveCard({ entry, index }: ArchiveCardProps) {
  return (
    <article className="archive-card">
      <Link href={`/archive/${entry.slug}`} aria-label={`View ${entry.title} archive`}>
        <div className="archive-card__visual" aria-hidden="true">
          <span className="archive-card__index">FS / {String(index + 1).padStart(2, "0")}</span>
          <span className="archive-card__pending">Image pending</span>
          <span className="archive-card__mark">F/S</span>
        </div>
        <div className="archive-card__overlay">
          <div className="archive-card__meta">
            <time>{entry.dateLabel}</time>
            <span>{entry.gallerySlotCount} image slots</span>
          </div>
          <h2>{entry.title}</h2>
          <span className="archive-card__action">View archive <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
    </article>
  );
}
