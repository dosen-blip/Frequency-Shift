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
        intro="Frequency Fest stays pinned as the permanent lead feature, followed by eight numbered and special-event records reconstructed from original captions and photography."
      />
      <div className="archive-grid">
        {archives.map((entry) => (
          <ArchiveCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </div>
  );
}
