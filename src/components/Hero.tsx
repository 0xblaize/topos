"use client";

import { useEffect, useState } from "react";
import { RoomScene } from "./RoomScene";

const cards = [
  {
    tag: "Step 01 — Capture",
    title: "One wide photo of the room you have",
    description: "Stand in the space and snap a single frame. No lidar rig, no depth sensor, no empty showroom required.",
    variant: "cluttered" as const,
  },
  {
    tag: "Step 02 — Erase",
    title: "Tap the clutter, watch it vanish",
    description: "Segmentation isolates the bed, desk, or boxes. Generative inpainting redraws the wall and floor behind them.",
    variant: "masked" as const,
  },
  {
    tag: "Step 03 — Furnish",
    title: "Build on an empty canvas",
    description: "A calibrated floor plane grounds real 3D models in the cleaned photo, scaled to the room automatically.",
    variant: "furnished" as const,
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % cards.length);
        setVisible(true);
      }, 700);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const card = cards[index];

  return (
    <section id="top" className="relative flex w-full flex-col items-center overflow-hidden bg-neutral-background pb-32 pt-12">
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-16 pt-16 md:px-12 lg:px-20">
        <h1
          data-animation-on-scroll=""
          data-animation-direction="left"
          className="mb-2 pl-1 font-secondary text-[42px] uppercase leading-[0.9] tracking-tightest text-text-primary md:text-[80px] lg:text-[120px]"
          style={{ letterSpacing: "-0.04em" }}
        >
          Topos
        </h1>
        <div data-animation-on-scroll="" data-animation-direction="left" className="ml-1 flex items-center gap-4 md:ml-2">
          <div className="h-px w-12 bg-brand-accent" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-primary/60 md:text-sm">
            Spatial Engineering &amp; AR Inpainting Engine
          </p>
        </div>
      </div>

      <div className="group relative mx-auto mb-32 w-full max-w-[1280px] px-6 md:px-12 lg:px-20">
        <div data-animation-on-scroll="" className="hero-cutout relative h-[400px] w-full overflow-hidden shadow-2xl md:h-[580px]">
          <div className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105">
            <RoomScene variant="masked" label="LIVE CAPTURE / MASKING" />
          </div>
        </div>

        <div
          data-animation-on-scroll=""
          className="absolute bottom-[-60px] left-1/2 z-20 flex w-[92%] -translate-x-1/2 items-center gap-4 border border-nav-divider bg-[#14181A] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] md:left-auto md:right-16 md:w-[480px] md:translate-x-0 md:gap-6 md:p-4"
        >
          <div className={`h-[140px] w-[100px] flex-shrink-0 overflow-hidden border border-nav-divider transition-opacity duration-700 md:h-[220px] md:w-[160px] ${visible ? "opacity-100" : "opacity-0"}`}>
            <RoomScene variant={card.variant} label="" />
          </div>

          <div className="flex flex-col justify-between overflow-hidden py-1 pr-2 md:py-4">
            <div className={`space-y-2 transition-all duration-700 md:space-y-3 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent md:text-[12px]">{card.tag}</p>
              <h2 className="font-secondary text-[18px] font-bold uppercase italic leading-[1.1] tracking-tighter text-text-primary md:text-[26px]">
                {card.title}
              </h2>
              <p className="hidden text-sm text-text-primary/60 md:block">{card.description}</p>
            </div>

            <a href="#demo" className="mt-4 flex w-max items-center justify-between gap-4 border-b border-brand-accent pb-1 transition-all duration-500 hover:gap-12 md:mt-6 md:gap-8 md:pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-text-primary">See the demo</span>
              <svg className="h-6 w-6 text-brand-accent" viewBox="0 0 200 200" fill="currentColor">
                <path d="M159 70.9l-2.2 2.4L183.6 99H9v3h174.6l-26.2 25.3 2.1 2.6 30.5-29.3-31-29.7z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
