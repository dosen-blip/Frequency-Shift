import Link from "next/link";
import { footerNavigation, siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand" data-reveal="up">
        <img className="footer-brand__mark" src="/media/brand/fs-icon.webp" alt="" width="404" height="410" decoding="async" />
        <img className="footer-brand__type" src="/media/brand/frequency-shift-wordmark.webp" alt="Frequency Shift" width="1111" height="81" decoding="async" />
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
