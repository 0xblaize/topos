import { RoomVisual } from "./RoomVisual";

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-copy">
        <div className="eyebrow-row"><span className="pulse-dot" /> SPATIAL ENGINEERING / 01</div>
        <h1>Clear the room.<br /><span>Design <span className="mobile-break">what&apos;s next.</span></span></h1>
        <p className="hero-intro">Topos turns one room photo into an empty spatial canvas—so new ideas have somewhere real to live.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#workflow">Explore the workflow <b>↓</b></a>
          <a className="text-link" href="#capabilities">What makes it different <b>↘</b></a>
        </div>
        <div className="hero-proof"><span><b>01</b> Still image first</span><span><b>02</b> AI-clearable space</span><span><b>03</b> Static AR canvas</span></div>
      </div>
      <div className="hero-visual-wrap">
        <div className="visual-label visual-label-left"><span>INPUT</span><b>WIDE ROOM CAPTURE</b></div>
        <RoomVisual />
        <div className="visual-label visual-label-right"><span>STATUS</span><b><i /> OBJECTS DETECTED</b></div>
        <div className="hero-coordinate">45.4215° N&nbsp;&nbsp; / &nbsp;&nbsp;73.5239° W</div>
      </div>
    </section>
  );
}
