const stack = [
  ["Frontend", "Next.js + React", "Serverless API routes drive the whole erase pipeline."],
  ["3D Engine", "Three.js / R3F", "@react-three/fiber and drei render GLB models over the photo."],
  ["Segmentation", "Segment Anything", "Tap an object and SAM returns the mask instantly."],
  ["Inpainting", "SDXL Inpainting", "Fills the masked region with realistic floor and wall."],
];

export function Stack() {
  return (
    <section id="stack" className="border-t border-nav-divider bg-neutral-background px-6 py-32 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-16 space-y-4" data-animation-on-scroll="" data-animation-direction="left">
          <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">The Arsenal</span>
          <h2 className="font-secondary text-4xl uppercase leading-[0.9] tracking-tightest text-text-primary md:text-6xl">
            Built to ship fast
          </h2>
        </div>

        <div className="border-t border-nav-divider">
          {stack.map(([kicker, name, detail]) => (
            <article key={name} data-animation-on-scroll="" className="grid grid-cols-1 items-center gap-4 border-b border-nav-divider py-8 transition-all duration-300 hover:pl-4 md:grid-cols-[140px_260px_1fr]">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-accent">{kicker}</span>
              <h3 className="font-secondary text-xl uppercase tracking-tighter text-text-primary">{name}</h3>
              <p className="text-sm text-text-primary/60">{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="contact" className="border-t border-nav-divider bg-neutral-background px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] space-y-8 text-center" data-animation-on-scroll="" data-animation-direction="left">
        <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Clear the space</span>
        <h2 className="font-secondary text-4xl uppercase leading-[0.9] tracking-tightest text-text-primary md:text-6xl">
          Now, we build
        </h2>
        <p className="mx-auto max-w-lg text-base text-text-primary/60">
          Topos is a spatial engineering agent for rooms in transition. Point it at the mess and start designing.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 md:flex-row">
          <a href="mailto:hello@topos.space" className="w-full bg-brand-accent px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] text-brand-primary shadow-lg transition-all hover:bg-white md:w-auto">
            Request early access
          </a>
          <a href="#pipeline" className="w-full border border-brand-accent px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] text-brand-accent transition-all hover:bg-brand-accent/10 md:w-auto">
            Read the pipeline
          </a>
        </div>
      </div>
    </section>
  );
}
