import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Frequency Shift for bookings, partnerships, and general questions.",
};

export default function ContactPage() {
  return (
    <div className="page-shell contact-page">
      <PageHeader
        eyebrow="Open channel"
        title="Contact"
        intro="Bookings, collaborations, media, and ideas for the next room all start through the active Frequency Shift channel."
      />
      <section className="split-section section--rule contact-section">
        <h2>Meet us on the frequency.</h2>
        <div className="prose prose--large" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <p>
            Frequency Shift works with artists, promoters, photographers,
            production teams, venues, and community partners across Ottawa. Send
            the account a direct message with the essentials and a real person
            can pick up the conversation.
          </p>
          <div className="contact-actions">
            <a
              className="button button--solid"
              href={siteConfig.instagram.href}
              target="_blank"
              rel="noreferrer"
            >
              Message {siteConfig.instagram.handle}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
