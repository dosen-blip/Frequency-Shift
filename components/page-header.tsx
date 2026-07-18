type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro: string;
};

export function PageHeader({ eyebrow, title, intro }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div data-reveal="group">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title" data-reveal="clip">{title}</h1>
      </div>
      <p className="page-intro" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>{intro}</p>
    </header>
  );
}
