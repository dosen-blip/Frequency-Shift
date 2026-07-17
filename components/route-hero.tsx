import type { ReactNode } from "react";

type RouteHeroProps = {
  eyebrow: string;
  title: string;
  body: string;
  detail?: string;
  imageSrc?: string;
  actions?: ReactNode;
};

export function RouteHero({ eyebrow, title, body, detail, imageSrc, actions }: RouteHeroProps) {
  return (
    <section className="route-hero">
      {imageSrc ? (
        <div className="route-hero__media" aria-hidden="true">
          <img src={imageSrc} alt="" width="2400" height="1600" />
        </div>
      ) : null}
      <div className="route-hero__lead">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="route-hero__aside">
        <p>{body}</p>
        {detail ? <p className="hero-mantra">{detail}</p> : null}
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </div>
    </section>
  );
}
