import Link from "next/link";
import { RoomStage } from "@/components/room-stage";

export const metadata = {
  title: "Page not found",
};

export default function NotFoundPage() {
  return (
    <div className="page-shell">
      <RoomStage room="lost" />
      <p className="eyebrow" data-reveal="up">Error 404</p>
      <div className="detail-grid">
        <h1 className="detail-title" data-reveal="clip">Nothing here.</h1>
        <div className="prose" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <p>The page may have moved, expired, or never existed.</p>
          <Link className="button button--solid" href="/">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
