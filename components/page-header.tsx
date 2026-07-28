type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro: string;
  motion?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  intro,
  motion = true,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow" data-reveal={motion ? "up" : undefined}>
          {eyebrow}
        </p>
        <h1 className="page-title">{title}</h1>
      </div>
      <p
        className="page-intro"
        data-reveal={motion ? "up" : undefined}
        style={motion ? { "--reveal-delay": "90ms" } as React.CSSProperties : undefined}
      >
        {intro}
      </p>
    </header>
  );
}
