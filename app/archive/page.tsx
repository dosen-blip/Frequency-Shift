import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { archives } from "@/content/archives";

export const metadata: Metadata = {
  title: "Archive",
  description: "Frequency Shift event recaps, images, credits, and history.",
};

export default function ArchiveIndexPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Afterimage"
        title="Archive"
        intro="The archive turns past events into durable editorial stories instead of letting them disappear beneath the next announcement."
      />
      <ol className="archive-list">
        {archives.map((entry) => (
          <li key={entry.slug}>
            <Link href={`/archive/${entry.slug}`}>
              <time>{entry.dateLabel}</time>
              <strong>{entry.title}</strong>
              <span aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
