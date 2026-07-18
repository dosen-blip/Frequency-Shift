import type { ReactNode } from "react";

type RouteHeroProps = {
  eyebrow: string;
  title: string;
  titleLines?: readonly string[];
  body: string;
  detail?: string;
  imageSrc?: string;
  actions?: ReactNode;
};

export function RouteHero({ eyebrow, title, titleLines, body, detail, imageSrc, actions }: RouteHeroProps) {
  const lines = titleLines?.length ? titleLines : [title];

  return (
    <section className="route-hero">
      {imageSrc ? (
        <div className="route-hero__media" aria-hidden="true">
          <img src={imageSrc} alt="" width="2400" height="1600" />
        </div>
      ) : null}
      <div className="route-hero__lead">
        <p className="eyebrow route-hero__eyebrow">{eyebrow}</p>
        <h1 className="hero-title" aria-label={title}>
          {lines.map((line) => (
            <span className="hero-title__line" key={line}>
              <span data-text={line}>{line}</span>
            </span>
          ))}
        </h1>
      </div>
      <div className="route-hero__aside">
        <p className="route-hero__body">{body}</p>
        {detail ? <p className="hero-mantra route-hero__mantra">{detail}</p> : null}
        {actions ? <div className="hero-actions route-hero__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
