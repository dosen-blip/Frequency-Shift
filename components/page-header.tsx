type PageHeaderProps = {
  title: string;
  intro: string;
  motion?: boolean;
};

export function PageHeader({
  title,
  intro,
  motion = true,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
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
