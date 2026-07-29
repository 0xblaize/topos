import { RoomScene } from "./RoomScene";

const tiles = [
  { span: "md:col-span-2 md:row-span-2", variant: "cluttered" as const, kicker: "Input", title: "The Raw Room", size: "text-2xl" },
  { span: "md:col-span-1 md:row-span-1", variant: "masked" as const, kicker: "SAM", title: "Segment", size: "text-lg" },
  { span: "md:col-span-1 md:row-span-1", variant: "clean" as const, kicker: "SDXL", title: "Inpaint", size: "text-lg" },
  { span: "md:col-span-1 md:row-span-2", variant: "furnished" as const, kicker: "Three.js", title: "Placement", size: "text-lg" },
  { span: "md:col-span-1 md:row-span-1", variant: "clean" as const, kicker: "Output", title: "Empty Plane", size: "text-lg" },
  { span: "md:col-span-2 md:row-span-1", variant: "furnished" as const, kicker: "Catalog", title: "GLB Models", size: "text-xl" },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="bg-[#0C0F10] px-6 py-32 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div data-animation-on-scroll="" data-animation-direction="left">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.4em] text-brand-accent">Snap · Erase · Furnish</span>
            <h2 className="font-secondary text-4xl uppercase leading-[0.9] tracking-tightest text-text-primary md:text-6xl">
              The Static AR Pipeline
            </h2>
          </div>
          <p data-animation-on-scroll="" data-animation-direction="right" className="max-w-md italic text-text-primary/60">
            Real-time video inpainting is too heavy to be reliable. Topos uses a high-fidelity static approach — one frame, cleared and calibrated, that behaves like magic.
          </p>
        </div>

        <div className="grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-4">
          {tiles.map((tile, i) => (
            <div key={i} data-animation-on-scroll="" className={`group relative cursor-pointer overflow-hidden ${tile.span}`}>
              <div className="h-full w-full transition-transform duration-1000 group-hover:scale-105">
                <RoomScene variant={tile.variant} label="" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-brand-primary/70 p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:p-6">
                <span className="mb-1 text-[8px] font-bold uppercase tracking-[0.3em] text-brand-accent">{tile.kicker}</span>
                <h3 className={`font-secondary uppercase italic leading-none text-white ${tile.size}`}>{tile.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <a href="#demo" className="border border-brand-accent px-12 py-4 text-xs font-bold uppercase tracking-[0.3em] text-brand-accent transition-all hover:bg-brand-accent hover:text-brand-primary">
            Walk the full flow
          </a>
        </div>
      </div>
    </section>
  );
}
