import type { Metadata } from "next";
import { ArchiveCard } from "@/components/archive-card";
import { PageHeader } from "@/components/page-header";
import { archives } from "@/content/archives";

export const metadata: Metadata = {
  title: "Archive",
  description: "Our event recaps, images, credits, and history.",
};

export default function ArchiveIndexPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Afterimage"
        title="Archive"
        intro="This is where we keep the nights that built us—from our first Ottawa gathering to Frequency Fest—with the artists, partners, photographers, and dancers who made them."
      />
      <div className="archive-grid">
        {archives.map((entry, index) => (
          <ArchiveCard key={entry.slug} entry={entry} revealIndex={index} />
        ))}
      </div>
    </div>
  );
}
