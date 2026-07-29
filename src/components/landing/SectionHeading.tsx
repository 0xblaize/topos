type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  copy?: string;
  number?: string;
};

export function SectionHeading({ eyebrow, title, copy, number }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div className="eyebrow-row"><span className="pulse-dot" /> <span>{eyebrow}</span>{number && <em>{number}</em>}</div>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}
