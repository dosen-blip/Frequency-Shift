import Link from "next/link";
import { footerNavigation, siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand" data-reveal="up">
        <img src="/media/figma/fs-logo.png" alt="" width="443" height="466" />
        <strong>Frequency Shift</strong>
      </div>
      <div className="footer-bottom" data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
        <p className="footer-meta">© 2026 Frequency Shift Ottawa</p>
        <nav className="footer-links" aria-label="Footer navigation">
          {footerNavigation.map((item) => (
            <Link href={item.href} key={item.href} prefetch={false}>
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
