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
        intro="Nine gatherings, collaborations, and afterimages—from the first Ottawa night to Frequency Fest—kept with the artists, partners, photographers, and dancers who made them."
      />
      <div className="archive-grid">
        {archives.map((entry, index) => (
          <ArchiveCard key={entry.slug} entry={entry} revealIndex={index} />
        ))}
      </div>
    </div>
  );
}
