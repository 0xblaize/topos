type RoomVisualProps = { clean?: boolean; compact?: boolean };

export function RoomVisual({ clean = false, compact = false }: RoomVisualProps) {
  return (
    <div className={`room-visual ${clean ? "is-clean" : ""} ${compact ? "is-compact" : ""}`} aria-label={clean ? "Clean spatial canvas" : "Room capture with detected clutter"} role="img">
      <div className="room-grid" />
      <div className="room-window"><span /><span /></div>
      <div className="room-floor" />
      {!clean && <>
        <div className="scene-object sofa"><div /><div /><div /></div>
        <div className="scene-object chair"><div /><div /></div>
        <div className="scene-object boxes"><i /><i /><i /></div>
        <div className="mask mask-sofa"><span>01 / SOFA</span></div>
        <div className="mask mask-chair"><span>02 / CHAIR</span></div>
        <div className="mask mask-boxes"><span>03 / CLUTTER</span></div>
      </>}
      {clean && <>
        <div className="placed-object"><div className="placed-sofa"><i /><i /><i /></div><span>NEW OBJECT / SOFA_01</span></div>
        <div className="floor-anchor"><i /> FLOOR PLANE LOCKED</div>
      </>}
      <div className="reticle" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="scene-meta"><span>DEPTH MAP / {clean ? "READY" : "SCANNING"}</span><span>1.62M / 22°</span></div>
    </div>
  );
}
