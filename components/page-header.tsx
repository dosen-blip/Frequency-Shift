type PageHeaderProps = {
  title: string;
  /** a short aside set beside the title in its own face, smaller, e.g. "(coming soon)" */
  note?: string;
  intro: string;
  motion?: boolean;
};

export function PageHeader({
  title,
  note,
  intro,
  motion = true,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">
          {title}
          {note ? (
            <>
              {" "}
              <span className="page-title__note">{note}</span>
            </>
          ) : null}
        </h1>
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
