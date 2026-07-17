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
        intro="Past events, preserved as visual records. Photography is being edited; the first archive structure is now in place."
      />
      <div className="archive-grid">
        {archives.map((entry, index) => (
          <ArchiveCard key={entry.slug} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}
