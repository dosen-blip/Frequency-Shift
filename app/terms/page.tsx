import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Policy scaffold"
        title="Terms"
        intro="This route is reserved for site terms and any event-specific purchase or attendance conditions."
      />
      <div className="prose">
        <p className="notice">
          Draft only. Align the final language with the ticket provider, refund policy, venue rules, photo policy, and applicable Ontario law.
        </p>
      </div>
    </div>
  );
}
