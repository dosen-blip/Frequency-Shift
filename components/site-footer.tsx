import Link from "next/link";
import { footerNavigation, siteConfig } from "@/content/site";
import { NeonWordmark } from "./neon-wordmark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand" data-reveal="up">
        <p className="sr-only">Frequency Shift</p>
        <NeonWordmark variant="footer" />
      </div>
      <div className="footer-bottom" data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
        <p className="footer-meta">© 2026 Frequency Shift Ottawa</p>
        <nav className="footer-links" aria-label="Footer navigation">
          {footerNavigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <a href={siteConfig.instagram.href} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  );
}
