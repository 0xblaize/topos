const columns = [
  { title: "pipeline", items: ["capture", "segment", "inpaint", "place"] },
  { title: "engine", items: ["next.js", "three.js", "sam", "sdxl"] },
];

export function SiteFooter() {
  return (
    <>
      <footer id="footer" className="border-t border-nav-divider bg-[#0C0F10]">
        <div className="mx-auto grid min-h-[400px] max-w-[1280px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 flex flex-col justify-between border-b border-nav-divider bg-gradient-to-b from-transparent to-brand-accent/5 p-10 md:col-span-2 md:border-b-0 lg:col-span-1 lg:border-r">
            <div>
              <h2 className="mb-8 font-primary text-5xl italic leading-none tracking-tightest text-text-primary md:text-6xl">
                topos.
                <br />
                <span className="font-secondary text-2xl font-bold uppercase not-italic tracking-[0.2em] text-brand-accent">engine</span>
              </h2>
            </div>
            <div className="space-y-8">
              <div className="flex h-16 w-16 animate-spin-slow items-center justify-center rounded-full bg-brand-accent text-2xl text-brand-primary">
                ✦
              </div>
              <p className="font-secondary text-sm font-bold uppercase leading-tight tracking-widest text-text-secondary">
                Mapping depth, erasing clutter, furnishing possibility.
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="border-b border-r border-nav-divider p-10 md:border-b-0">
              <div className="mb-8 flex items-center justify-between border-b border-nav-divider pb-2">
                <h4 className="font-secondary text-xs font-bold uppercase tracking-widest text-text-primary">{col.title}</h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
              </div>
              <ul className="space-y-4 font-secondary text-sm font-medium uppercase tracking-widest">
                {col.items.map((item) => (
                  <li key={item} className="cursor-pointer transition-transform hover:translate-x-2 hover:text-brand-accent">{item}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="p-10">
            <div className="mb-8 flex items-center justify-between border-b border-nav-divider pb-2">
              <h4 className="font-secondary text-xs font-bold uppercase tracking-widest text-text-primary">let&apos;s talk</h4>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
            </div>
            <div className="space-y-6">
              <a href="mailto:hello@topos.space" className="block font-secondary text-lg font-bold tracking-tight transition-colors hover:text-brand-accent">
                hello@topos.space
              </a>
              <p className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.2em] text-text-secondary">
                Spatial engineering
                <br />
                Built in 48 hours
              </p>

              <div className="flex gap-4 pt-8">
                {[
                  <path key="mail" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />,
                  <path key="chat" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
                ].map((icon, i) => (
                  <button key={i} aria-label="Contact Topos" className="flex h-12 w-12 items-center justify-center rounded-full border border-nav-divider transition-colors hover:bg-brand-accent hover:text-brand-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="border-t border-nav-divider bg-[#0C0F10]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between p-6 px-6 font-secondary text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary md:flex-row md:px-12 lg:px-20">
          <span>© 2026 Topos Engine.</span>
          <div className="mt-4 flex gap-8 md:mt-0">
            <a href="#pipeline" className="transition-colors hover:text-brand-accent">Pipeline</a>
            <a href="#stack" className="transition-colors hover:text-brand-accent">Stack</a>
          </div>
        </div>
      </div>
    </>
  );
}
