import { SectionHeading } from "./SectionHeading";

const capabilities = [
  ["01", "Selective, not destructive", "Choose only what needs to disappear. The rest of the room stays part of the design context."],
  ["02", "Perspective with purpose", "A static, calibrated plane makes a single capture useful without pretending to solve live AR."],
  ["03", "A bridge to the real room", "From the first picture to the next furnishing decision, every surface is designed for momentum."],
];

export function Capabilities() {
  return (
    <section className="capabilities section">
      <SectionHeading eyebrow="Built for a better before" number="SYSTEM NOTES" title={<>Spatial thinking,<br /><i>without the theatre.</i></>} />
      <div className="capability-list">
        {capabilities.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p><b>↘</b></article>)}
      </div>
    </section>
  );
}
