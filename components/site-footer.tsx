import Link from "next/link";
import { footerNavigation } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="footer-links" aria-label="Footer navigation">
        {footerNavigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="footer-meta">Frequency Shift · Independent event platform</p>
    </footer>
  );
}
