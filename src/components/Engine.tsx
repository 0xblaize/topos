"use client";

import { useEffect, useRef } from "react";

const phases = [
  {
    phase: "Phase I",
    title: ["Spatial", "Capture"],
    body: "A single wide frame from a standard eye height becomes the entire spatial input.",
    cta: "Viewfinder",
    theme: "light" as const,
    drop: "translateY(-300px) rotate(12deg)",
    rest: "translateX(-380px) translateY(-20px) rotate(-6deg)",
  },
  {
    phase: "Phase II",
    title: ["Object", "Masking"],
    body: "Segment Anything isolates the clutter you tap, and glows the mask in accent green.",
    cta: "Segment",
    theme: "dark" as const,
    drop: "translateY(-400px) rotate(-8deg)",
    rest: "translateX(-200px) translateY(10px) rotate(2deg)",
  },
  {
    phase: "Phase III",
    title: ["Generative", "Erase"],
    body: "SDXL inpainting redraws the floorboards and walls that were hidden behind the mess.",
    cta: "Inpaint",
    theme: "light" as const,
    drop: "translateY(-350px) rotate(5deg)",
    rest: "translateX(-20px) translateY(-30px) rotate(-3deg)",
  },
  {
    phase: "Phase IV",
    title: ["Plane", "Calibration"],
    body: "A hidden floor plane tilts away at a standard angle, so perspective math resolves itself.",
    cta: "Calibrate",
    theme: "accent" as const,
    drop: "translateY(-450px) rotate(-10deg)",
    rest: "translateX(160px) translateY(20px) rotate(4deg)",
  },
  {
    phase: "Phase V",
    title: ["The", "Placement"],
    body: "Drag a rendered GLB model onto the cleared canvas and it lands perfectly scaled.",
    cta: "Furnish",
    theme: "light" as const,
    drop: "translateY(-320px) rotate(15deg)",
    rest: "translateX(340px) translateY(-10px) rotate(-1deg)",
  },
];

function GrainCanvas({ opacity }: { opacity: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const renderNoise = () => {
      if (!width || !height) return;
      const idata = ctx.createImageData(width, height);
      const buffer32 = new Uint32Array(idata.data.buffer);
      for (let i = 0; i < buffer32.length; i++) {
        if (Math.random() < 0.2) buffer32[i] = 0x33ffffff;
      }
      ctx.putImageData(idata, 0, 0);
    };

    const animate = () => {
      renderNoise();
      frame = requestAnimationFrame(animate);
    };

    resize();
    renderNoise();
    window.addEventListener("resize", resize);

    const card = canvas.closest(".project-card");
    const onEnter = () => { animate(); };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
      renderNoise();
    };
    card?.addEventListener("mouseenter", onEnter);
    card?.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      card?.removeEventListener("mouseenter", onEnter);
      card?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={`absolute inset-0 h-full w-full ${opacity}`} />;
}

export function Engine() {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const showcase = showcaseRef.current;
    if (!showcase) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          cardsRef.current.forEach((card, index) => {
            if (!card) return;
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.pointerEvents = "auto";
              card.style.transform = window.innerWidth > 768 ? phases[index].rest : "none";
            }, index * 150);
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(showcase);
    return () => observer.disconnect();
  }, []);

  const hoverIn = (index: number) => {
    const card = cardsRef.current[index];
    if (!card || window.innerWidth <= 768 || card.style.opacity !== "1") return;
    card.style.zIndex = "100";
    card.style.transform = `${phases[index].rest.replace(/rotate\(.*?\)/, "rotate(0deg)")} translateY(-40px) scale(1.1)`;
  };

  const hoverOut = (index: number) => {
    const card = cardsRef.current[index];
    if (!card || window.innerWidth <= 768 || card.style.opacity !== "1") return;
    card.style.transform = phases[index].rest;
    setTimeout(() => {
      if (!card.matches(":hover")) card.style.zIndex = String(index + 1);
    }, 300);
  };

  return (
    <section id="engine" className="relative overflow-visible bg-neutral-background px-6 pb-32 pt-12 md:px-12 lg:px-20">
      <div className="mx-auto mb-12 max-w-[1280px]">
        <div className="space-y-4 text-center" data-animation-on-scroll="" data-animation-direction="left">
          <span className="block text-[10px] font-bold uppercase tracking-[0.5em] text-brand-accent">The Engine</span>
          <h2 className="font-secondary text-4xl uppercase leading-[0.9] tracking-tightest text-text-primary md:text-6xl">
            Five Moves, One Canvas
          </h2>
          <p className="mx-auto max-w-2xl font-secondary text-lg italic text-text-primary/60">
            &ldquo;You can&apos;t put a new digital couch where your old physical couch is sitting. So first, we clear the space.&rdquo;
          </p>
        </div>
      </div>

      <div id="project-showcase" ref={showcaseRef} className="relative flex min-h-[600px] w-full items-center justify-center overflow-visible py-10 md:min-h-[800px]">
        <div className="relative flex w-full max-w-5xl flex-wrap justify-center gap-4 px-10">
          {phases.map((item, index) => {
            const shell =
              item.theme === "dark"
                ? "bg-[#15191B] border border-white/10"
                : item.theme === "accent"
                  ? "bg-brand-accent"
                  : "bg-[#171C1E] border border-white/10";
            const titleColor = item.theme === "accent" ? "text-brand-primary" : "text-text-primary";
            const bodyColor = item.theme === "accent" ? "text-brand-primary/70" : "text-text-primary/60";
            const kickerColor = item.theme === "accent" ? "text-brand-primary/60" : "text-brand-accent";
            const button =
              item.theme === "accent"
                ? "bg-brand-primary text-brand-accent hover:bg-[#1a1f21]"
                : "border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary";

            return (
              <div
                key={item.phase}
                ref={(el) => { cardsRef.current[index] = el; }}
                onMouseEnter={() => hoverIn(index)}
                onMouseLeave={() => hoverOut(index)}
                className="project-card pointer-events-none absolute h-[340px] w-[240px] cursor-pointer select-none opacity-0 transition-all duration-700 ease-out md:h-[360px] md:w-[260px]"
                style={{ transform: item.drop, zIndex: index + 1 }}
              >
                <div className={`group relative flex h-full w-full flex-col overflow-hidden rounded-project p-6 shadow-lg ${shell}`}>
                  <div className={`relative mb-6 flex h-32 w-full items-center justify-center overflow-hidden border ${item.theme === "accent" ? "border-brand-primary/30 bg-white/10" : "border-white/15 bg-white/5"}`}>
                    <GrainCanvas opacity={item.theme === "accent" ? "opacity-30" : "opacity-20"} />
                    <span className={`relative font-primary text-4xl italic ${item.theme === "accent" ? "text-brand-primary" : "text-brand-accent"} ${index === 0 ? "animate-spin-slow" : ""}`}>
                      {["✦", "⊘", "◍", "⌖", "◆"][index]}
                    </span>
                  </div>

                  <div className="relative z-10 flex-grow">
                    <span className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] ${kickerColor}`}>{item.phase}</span>
                    <h3 className={`card-title font-secondary text-xl font-bold uppercase leading-tight tracking-tighter transition-all duration-500 ${titleColor}`}>
                      {item.title[0]}<br />{item.title[1]}
                    </h3>
                    <p className={`card-description mt-4 translate-y-4 text-[13px] italic leading-relaxed opacity-0 transition-all duration-500 ${bodyColor}`}>
                      {item.body}
                    </p>
                  </div>

                  <div className="project-cta invisible mt-auto translate-y-8 pt-4 opacity-0 transition-all duration-500">
                    <button className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${button}`}>
                      {item.cta}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
