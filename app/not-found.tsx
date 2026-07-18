import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFoundPage() {
  return (
    <div className="page-shell">
      <p className="eyebrow" data-reveal="up">404 / Signal lost</p>
      <div className="detail-grid">
        <h1 className="detail-title" data-reveal="clip">Nothing here.</h1>
        <div className="prose" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <p>The page may have moved, expired, or never existed.</p>
          <Link className="button button--solid" href="/" prefetch={false}>
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
