type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro: string;
};

export function PageHeader({ eyebrow, title, intro }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow" data-reveal="up">{eyebrow}</p>
        <h1 className="page-title" data-reveal="clip" style={{ "--reveal-delay": "45ms" } as React.CSSProperties}>{title}</h1>
      </div>
      <p className="page-intro" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>{intro}</p>
    </header>
  );
}
