"use client";

import { useState } from "react";
import { RoomVisual } from "./RoomVisual";

export function RoomComparison() {
  const [clean, setClean] = useState(false);
  return (
    <section id="capabilities" className="comparison section">
      <div className="comparison-copy">
        <div className="eyebrow-row"><span className="pulse-dot" /> THE TOPOS DIFFERENCE</div>
        <h2>Don&apos;t place around the past.<br /><i>Rebuild the plane.</i></h2>
        <p>Before an object can feel right in a room, it needs believable space beneath it. Topos makes that space visible first.</p>
        <ul className="feature-list">
          <li><span>01</span><b>Tap-targeted clearing</b><em>Choose the objects you want out.</em></li>
          <li><span>02</span><b>Context-aware reconstruction</b><em>Walls, floors, light, and perspective remain the brief.</em></li>
          <li><span>03</span><b>Static spatial placement</b><em>Build on a stable view rather than imperfect live video.</em></li>
        </ul>
      </div>
      <div className="comparison-panel">
        <div className="comparison-panel-head"><span>CANVAS PREVIEW</span><span>{clean ? "STAGE 03 / PLACE" : "STAGE 02 / ERASE"}</span></div>
        <RoomVisual clean={clean} compact />
        <div className="comparison-controls" role="group" aria-label="Canvas preview state">
          <button className={!clean ? "active" : ""} onClick={() => setClean(false)} aria-pressed={!clean}><i /> Original scan</button>
          <button className={clean ? "active" : ""} onClick={() => setClean(true)} aria-pressed={clean}><i /> Cleared canvas</button>
        </div>
        <p className="comparison-note"><b>Prototype preview.</b> The final workspace will connect this interaction to selective segmentation and inpainting.</p>
      </div>
    </section>
  );
}
