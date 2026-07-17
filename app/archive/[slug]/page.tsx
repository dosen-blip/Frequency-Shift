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
      <p className="eyebrow">Archive / {entry.dateLabel}</p>
      <div className="detail-grid">
        <div className="detail-content">
          <h1 className="detail-title">{entry.title}</h1>
          <div className="prose prose--large">
            {entry.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {entry.gallery.length === 0 ? (
            <p className="empty-state">Selected event media will live here after the final edit and rights check.</p>
          ) : null}
        </div>
        <aside>
          <p className="notice">Draft archive record — copy, credits, and media remain to be approved.</p>
          <Link className="text-link" href="/archive">
            Back to archive
          </Link>
        </aside>
      </div>
    </article>
  );
}
