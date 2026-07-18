import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Policy scaffold"
        title="Privacy"
        intro="This route is reserved for the final privacy notice and data-handling commitments."
      />
      <div className="prose" data-reveal="up">
        <p className="notice">
          Draft only. Define analytics, contact-form, ticket-provider, cookie, retention, and deletion practices before publishing legal copy.
        </p>
      </div>
    </div>
  );
}
