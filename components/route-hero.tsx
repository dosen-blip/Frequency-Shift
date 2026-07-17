import type { ReactNode } from "react";

type RouteHeroProps = {
  eyebrow: string;
  title: string;
  body: string;
  actions?: ReactNode;
};

export function RouteHero({ eyebrow, title, body, actions }: RouteHeroProps) {
  return (
    <section className="route-hero">
      <div className="route-hero__lead">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="route-hero__aside">
        <p>{body}</p>
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </div>
    </section>
  );
}
