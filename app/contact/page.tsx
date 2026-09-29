import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach us for bookings, partnerships, media, and general questions.",
};

const enquiries = [
  {
    topic: "Artists & bookings",
    detail: "Who you are, where we can hear you, and the dates you have in mind.",
  },
  {
    topic: "Venues & partners",
    detail: "The room or project, the date, and what you’d like to build together.",
  },
  {
    topic: "Photo & video",
    detail: "A link to your work and which night you’d like to cover.",
  },
  {
    topic: "Press",
    detail: "Your outlet, the angle, and your deadline.",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="page-shell contact-page">
      <PageHeader
        eyebrow="Bookings / Partners / Press"
        title="Contact"
        intro="For bookings, collaborations, media, or an idea for the next room, send us a message."
      />
      <section className="split-section section--rule contact-section">
        <h2>Send us a message.</h2>
        <div className="prose prose--large" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <p>
            We work with artists, promoters, photographers, production teams,
            venues, and community partners across Ottawa. Instagram is the
            fastest way to reach us. A few lines up front help:
          </p>
          <dl className="contact-enquiries">
            {enquiries.map((item) => (
              <div key={item.topic}>
                <dt>{item.topic}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
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
