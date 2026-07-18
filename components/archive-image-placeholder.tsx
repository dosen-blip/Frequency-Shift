type ArchiveImagePlaceholderProps = {
  eventTitle: string;
  index: number;
};

export function ArchiveImagePlaceholder({ eventTitle, index }: ArchiveImagePlaceholderProps) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <div
      className="archive-image-placeholder"
      data-reveal="media"
      style={{ "--reveal-delay": `${Math.min(index, 3) * 70}ms` } as React.CSSProperties}
      role="img"
      aria-label={`${eventTitle} gallery image ${number} placeholder`}
    >
      <span>FS / {number}</span>
      <strong>Image pending</strong>
    </div>
  );
}
