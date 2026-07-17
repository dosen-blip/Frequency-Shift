import Link from "next/link";
import { footerNavigation } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src="/media/figma/fs-logo.png" alt="" width="443" height="466" />
        <strong>Frequency Shift</strong>
      </div>
      <div className="footer-bottom">
        <p className="footer-meta">© 2026 Frequency Shift Ottawa</p>
        <nav className="footer-links" aria-label="Footer navigation">
          {footerNavigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
