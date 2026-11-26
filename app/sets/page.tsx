import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RoomStage } from "@/components/room-stage";

export const metadata: Metadata = {
  title: "Sets",
  description: "Full recordings of the sets from Frequency Shift nights.",
};

// Recorded sets from our nights. Until the first ones are uploaded, the page is its title, marked "(coming soon)",
// with one line under it.
export default function SetsPage() {
  return (
    <div className="page-shell sets-page">
      <RoomStage room="sets" />
      <PageHeader
        title="Sets"
        note="(coming soon)"
        intro="Full recordings of the sets from our nights. We’ll be uploading them here."
        motion={false}
      />
    </div>
  );
}
