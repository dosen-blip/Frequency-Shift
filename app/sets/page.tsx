import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RoomStage } from "@/components/room-stage";

export const metadata: Metadata = {
  title: "Sets",
  description: "Full recordings of the sets from Frequency Shift nights.",
};

// Recorded sets from our nights. Until the first ones are uploaded, the page is a lit "Coming soon" sign, set in
// capitals with the wide spacing of the FREQUENCY SHIFT sign and glowing in its pink.
export default function SetsPage() {
  return (
    <div className="page-shell sets-page">
      <RoomStage room="sets" />
      <PageHeader
        title="Sets"
        intro="Full recordings of the sets from our nights. We’ll be uploading them here."
        motion={false}
      />
      <section className="sets-soon" aria-label="Sets coming soon">
        <p className="sets-soon__sign">Coming soon</p>
      </section>
    </div>
  );
}
