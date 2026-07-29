import { SectionHeading } from "./SectionHeading";

const stages = [
  { number: "01", tag: "Spatial capture", title: "Snap the room\nyou actually have.", copy: "A single wide capture is enough to begin. No lidar rig, no perfect showroom required.", icon: "⌁" },
  { number: "02", tag: "Generative clearing", title: "Remove what\nis in the way.", copy: "Select the bed, desk, or visual noise. Topos maps the object and imagines the space behind it.", icon: "⊘" },
  { number: "03", tag: "Static AR canvas", title: "Place what\ncomes next.", copy: "Work with a cleaned spatial view, calibrated to feel naturally grounded in the room.", icon: "⌖" },
];

export function Workflow() {
  return (
    <section id="workflow" className="workflow section">
      <div className="section-topline">TOPOS / CORE LOOP <span>SCROLL TO REVEAL</span></div>
      <SectionHeading eyebrow="A more useful starting point" number="01 — 03" title={<>One room.<br /><i>Three moves.</i></>} copy="Traditional furniture AR competes with the space you already occupy. Topos starts by making room for the possible." />
      <div className="workflow-grid">
        {stages.map((stage, index) => (
          <article className="stage-card" key={stage.number}>
            <div className="stage-card-top"><span>{stage.number}</span><b>{stage.icon}</b></div>
            <div className="stage-diagram" aria-hidden="true"><i /><i /><i /><em /></div>
            <p className="card-tag">{stage.tag}</p>
            <h3>{stage.title.split("\n").map(line => <span key={line}>{line}</span>)}</h3>
            <p className="card-copy">{stage.copy}</p>
            <div className="card-footer"><span>{index === 0 ? "SINGLE FRAME INPUT" : index === 1 ? "SELECTIVE INPAINT" : "PERSPECTIVE-LED"}</span><b>↗</b></div>
          </article>
        ))}
      </div>
    </section>
  );
}
