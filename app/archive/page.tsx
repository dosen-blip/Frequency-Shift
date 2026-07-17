import type { Metadata } from "next";
import { ArchiveCard } from "@/components/archive-card";
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
        intro="Eight past events, preserved as visual records. Dates, stories, and photography will be added as the archive is assembled."
      />
      <div className="archive-grid">
        {archives.map((entry, index) => (
          <ArchiveCard key={entry.slug} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}
