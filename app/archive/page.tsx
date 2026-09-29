import type { Metadata } from "next";
import { ArchiveCard } from "@/components/archive-card";
import { PageHeader } from "@/components/page-header";
import { archives } from "@/content/archives";

const firstNight = [...archives].sort((a, b) => a.dateIso.localeCompare(b.dateIso))[0];
const since = firstNight
  ? new Date(`${firstNight.dateIso}T12:00:00Z`).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
  : "";

export const metadata: Metadata = {
  title: "Archive",
  description: "Our event recaps, images, credits, and history.",
};

export default function ArchiveIndexPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`Archive / ${archives.length} nights${since ? ` since ${since}` : ""}`}
        title="Archive"
        intro="This is where we keep the nights that built us—from our first Ottawa gathering to Techno Special—with the artists, partners, photographers, and dancers who made them."
      />
      <div className="archive-grid">
        {archives.map((entry, index) => (
          <ArchiveCard key={entry.slug} entry={entry} revealIndex={index} />
        ))}
      </div>
    </div>
  );
}
