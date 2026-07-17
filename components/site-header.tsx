import Link from "next/link";
import { primaryNavigation } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Frequency Shift home">
        Frequency <span>Shift</span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {primaryNavigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="header-location">Ottawa, Canada</p>
      <details className="mobile-nav">
        <summary>Menu</summary>
        <nav className="mobile-nav__panel" aria-label="Mobile navigation">
          {primaryNavigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
