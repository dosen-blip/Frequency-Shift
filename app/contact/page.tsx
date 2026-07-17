import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Frequency Shift for bookings, partnerships, and general questions.",
};

export default function ContactPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Open channel"
        title="Contact"
        intro="Bookings, collaborations, media, accessibility questions, or something else—use the right channel once the final inboxes are approved."
      />
      <section className="split-section section--rule">
        <h2>Routes, not a dead form.</h2>
        <div className="prose prose--large">
          <p>
            The scaffold intentionally does not publish an invented address or a
            form with nowhere to send. Final contact details and response
            expectations should be connected before launch.
          </p>
          <p className="notice">Pending: approved email, Instagram handle, booking route, and privacy-safe form decision.</p>
        </div>
      </section>
    </div>
  );
}
