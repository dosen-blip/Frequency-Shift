import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="page-shell">
      <p className="eyebrow">404 / Signal lost</p>
      <div className="detail-grid">
        <h1 className="detail-title">Nothing here.</h1>
        <div className="prose">
          <p>The page may have moved, expired, or never existed.</p>
          <Link className="button button--solid" href="/">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
