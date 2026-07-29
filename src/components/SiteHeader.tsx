"use client";

import { useRef, useState } from "react";
import { RoomScene } from "./RoomScene";

type MenuKey = "pipeline" | "engine";

const content: Record<MenuKey, {
  title: string;
  desc: string;
  variant: "masked" | "furnished";
  c1t: string;
  c1l: string[];
  c2t: string;
  c2l: string[];
}> = {
  pipeline: {
    title: "The Pipeline",
    desc: "Snap, erase, furnish — one photo becomes an empty canvas you can build on.",
    variant: "masked",
    c1t: "Capture",
    c1l: ["Wide Room Snap", "Depth Assumption", "Floor Plane Lock", "Viewfinder Reticle"],
    c2t: "Erase",
    c2l: ["Tap to Segment", "Mask Preview", "Generative Inpaint", "Surface Rebuild"],
  },
  engine: {
    title: "The Engine",
    desc: "Segmentation, inpainting, and a calibrated 3D plane working as one system.",
    variant: "furnished",
    c1t: "Vision",
    c1l: ["Segment Anything", "SDXL Inpainting", "Mask Refinement", "Clutter Detection"],
    c2t: "Spatial",
    c2l: ["Three.js Canvas", "GLB Catalog", "Drag Placement", "Perspective Scaling"],
  },
};

function FlippingLink({ text }: { text: string }) {
  return (
    <li className="relative h-[42px] w-full overflow-hidden border-b border-nav-divider last:border-b-0">
      <a href="#pipeline" className="group block h-full w-full">
        <div className="relative z-10 flex h-full items-center px-10 transition-transform duration-500 group-hover:-translate-y-full">
          <span className="text-[12px] font-medium uppercase tracking-[0.02em] text-text-primary">{text}</span>
        </div>
        <div className="absolute inset-0 flex h-full translate-y-full items-center bg-brand-accent px-10 transition-transform duration-500 group-hover:translate-y-0">
          <span className="flex w-full items-center justify-between text-[12px] font-medium uppercase tracking-[0.02em] text-brand-primary">
            {text}
            <span className="text-[14px]">→</span>
          </span>
        </div>
      </a>
    </li>
  );
}

export function SiteHeader() {
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (key: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(key);
  };

  const data = activeMenu ? content[activeMenu] : null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex w-full flex-col items-center transition-all duration-300">
      <div className="relative mt-6 w-full max-w-[1280px] px-6 md:mt-12 md:px-12 lg:px-20" onMouseLeave={() => { closeTimer.current = setTimeout(() => setActiveMenu(null), 180); }}>
        <nav className="flex h-nav-height items-center justify-between overflow-visible border border-nav-divider bg-neutral-background transition-colors duration-300">
          <div className="flex h-full shrink-0 items-center border-r border-nav-divider px-6">
            <a href="#top" className="group flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-brand-accent transition-transform duration-300 group-hover:scale-125" />
              <span className="text-[14px] font-bold uppercase tracking-[0.2em] text-text-primary md:text-[16px]">Topos</span>
            </a>
          </div>

          <div className="hidden h-full flex-grow items-center overflow-visible lg:flex">
            {([["pipeline", "Pipeline"], ["engine", "Engine"]] as const).map(([key, label]) => (
              <div
                key={key}
                className="group flex h-full cursor-pointer items-center border-r border-nav-divider"
                onMouseEnter={() => openMenu(key)}
              >
                <a href={`#${key}`} className="relative z-10 flex h-full w-full items-center overflow-hidden px-[26.6px]">
                  <span className="text-[12.8px] font-medium uppercase tracking-wide transition-transform duration-500 ease-in-out group-hover:-translate-y-full">{label}</span>
                  <div className="absolute inset-0 flex translate-y-full items-center bg-brand-accent px-[26.6px] transition-transform duration-500 ease-in-out group-hover:translate-y-0">
                    <span className="text-[12.8px] font-medium uppercase tracking-wide text-brand-primary">{label}</span>
                  </div>
                </a>
              </div>
            ))}

            <div className="group flex h-full cursor-pointer items-center border-r border-nav-divider">
              <a href="#demo" className="relative z-10 flex h-full w-full items-center overflow-hidden px-[26.6px]">
                <span className="text-[12.8px] font-medium uppercase tracking-wide transition-transform duration-500 ease-in-out group-hover:-translate-y-full">Demo</span>
                <div className="absolute inset-0 flex translate-y-full items-center bg-brand-accent px-[26.6px] transition-transform duration-500 ease-in-out group-hover:translate-y-0">
                  <span className="text-[12.8px] font-medium uppercase tracking-wide text-brand-primary">Demo</span>
                </div>
              </a>
            </div>
          </div>

          <div className="flex h-full shrink-0 items-center">
            <a href="#stack" className="hidden h-full items-center border-l border-nav-divider px-8 text-[12.8px] font-medium uppercase tracking-wide transition-colors hover:bg-white/5 md:flex">
              Stack
            </a>

            <div className="group flex h-full min-w-[120px] cursor-pointer items-center overflow-hidden border-l border-nav-divider md:min-w-[180px]">
              <a href="#contact" className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden bg-brand-accent">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary transition-transform duration-500 ease-in-out group-hover:-translate-y-full md:text-[12.8px]">Launch Topos</span>
                <div className="absolute inset-0 flex translate-y-full items-center justify-center bg-text-primary transition-transform duration-500 ease-in-out group-hover:translate-y-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary md:text-[12.8px]">Clear a Room</span>
                </div>
              </a>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-full items-center justify-center border-l border-nav-divider bg-neutral-background px-5 transition-colors hover:bg-white/5 lg:hidden"
            >
              <div className="relative flex h-5 w-6 flex-col justify-between">
                <span className="h-[2px] w-full origin-left bg-text-primary transition-all duration-300" />
                <span className="h-[2px] w-full bg-text-primary transition-all duration-300" />
                <span className="h-[2px] w-full origin-left bg-text-primary transition-all duration-300" />
              </div>
            </button>
          </div>
        </nav>

        <div className={`fixed inset-0 z-[60] transform bg-neutral-background transition-transform duration-500 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-full flex-col">
            <div className="mt-6 flex h-nav-height items-center justify-between border-b border-nav-divider px-6">
              <span className="text-[16px] font-bold uppercase tracking-[0.2em] text-text-primary">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <nav className="flex flex-grow flex-col space-y-8 p-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Navigation</p>
                {[["#pipeline", "Pipeline"], ["#engine", "Engine"], ["#demo", "Demo"], ["#stack", "Stack"], ["#contact", "Contact"]].map(([href, label]) => (
                  <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block border-b border-nav-divider pb-2 font-primary text-4xl italic tracking-tightest">
                    {label}
                  </a>
                ))}
              </div>

              <div className="space-y-6 pt-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Built With</p>
                <div className="flex flex-col space-y-2 text-sm font-bold uppercase tracking-widest text-text-secondary">
                  <span>Next.js</span>
                  <span>Three.js</span>
                  <span>SAM + SDXL</span>
                </div>
              </div>
            </nav>

            <div className="border-t border-nav-divider p-8">
              <a href="#contact" onClick={() => setMobileOpen(false)} className="flex w-full items-center justify-center bg-brand-accent py-6 text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">
                Clear a Room
              </a>
            </div>
          </div>
        </div>

        {data && (
          <div className="absolute inset-x-6 z-40 overflow-hidden border-x border-b border-nav-divider bg-neutral-background opacity-100 transition-all duration-300">
            <div className="grid grid-cols-12 gap-0 overflow-hidden">
              <div className="col-span-4 flex flex-col justify-between border-r border-nav-divider bg-[#121618] p-12">
                <div className="space-y-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-secondary">{data.title}</h3>
                  <div className="space-y-6">
                    <div className="aspect-[16/9] overflow-hidden rounded-sm">
                      <RoomScene variant={data.variant} />
                    </div>
                    <p className="font-primary text-2xl italic leading-tight tracking-tight text-text-primary">{data.desc}</p>
                    <a href="#demo" className="inline-flex items-center border-b-2 border-brand-accent pb-1 text-[10px] font-bold uppercase tracking-widest transition-colors hover:border-text-primary">
                      See the flow
                    </a>
                  </div>
                </div>
              </div>

              <div className="col-span-8 bg-neutral-background p-0">
                <div className="grid h-full grid-cols-2">
                  <div className="border-r border-nav-divider py-10">
                    <h4 className="mb-8 px-10 text-[10px] font-bold uppercase tracking-[0.25em] text-text-secondary">{data.c1t}</h4>
                    <ul className="flex flex-col">
                      {data.c1l.map((link) => <FlippingLink key={link} text={link} />)}
                    </ul>
                  </div>
                  <div className="py-10">
                    <h4 className="mb-8 px-10 text-[10px] font-bold uppercase tracking-[0.25em] text-text-secondary">{data.c2t}</h4>
                    <ul className="flex flex-col">
                      {data.c2l.map((link) => <FlippingLink key={link} text={link} />)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
