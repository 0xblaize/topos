type RoomSceneProps = {
  variant?: "cluttered" | "masked" | "clean" | "furnished";
  label?: string;
  className?: string;
};

const captions: Record<string, string> = {
  cluttered: "RAW CAPTURE",
  masked: "SEGMENTATION",
  clean: "INPAINTED",
  furnished: "PLACEMENT",
};

export function RoomScene({ variant = "cluttered", label, className = "" }: RoomSceneProps) {
  const cleared = variant === "clean" || variant === "furnished";

  return (
    <div className={`scene-shell relative h-full w-full overflow-hidden bg-[#15191B] transition-[filter] duration-700 ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(150deg,#20262a_0%,#3c4348_46%,#191e21_46.5%,#0e1113_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_16%,rgba(255,246,214,0.22),transparent_34%)]" />

      <div className="absolute left-[11%] top-[12%] h-[42%] w-[25%] border-2 border-white/25 bg-[linear-gradient(125deg,#4a5c60,#78878a)]">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/30" />
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-black/30" />
      </div>

      <div className="absolute -left-[4%] -right-[4%] bottom-[-10%] h-[42%] bg-[repeating-linear-gradient(101deg,rgba(255,255,255,0.05)_0_2px,transparent_2px_46px),linear-gradient(15deg,#14181a,#2f3639)]" />

      {!cleared && (
        <>
          <div className="absolute bottom-[19%] left-[38%] h-[24%] w-[34%] rounded-t-md bg-[#33393b] shadow-[inset_0_11px_#464d4e]">
            <div className="absolute inset-x-[5%] top-[16%] h-[40%] rounded bg-[#5b6365]" />
          </div>
          <div className="absolute bottom-[22%] right-[15%] h-[25%] w-[10%] rounded-t-[46%] bg-[#5e5346]">
            <div className="absolute inset-x-[13%] bottom-[42%] top-[14%] rounded-[45%] bg-[#7b6c58]" />
          </div>
          <div className="absolute bottom-[21%] left-[22%] flex h-[18%] w-[17%] items-end gap-[3px]">
            <div className="h-[58%] w-[40%] border border-white/15 bg-[#4b4740]" />
            <div className="h-full w-[38%] border border-white/15 bg-[#555046]" />
            <div className="h-[35%] w-[30%] border border-white/15 bg-[#413d37]" />
          </div>
        </>
      )}

      {variant === "masked" && (
        <>
          <div className="absolute bottom-[15%] left-[36%] h-[29%] w-[37%] border border-brand-accent bg-brand-accent/15">
            <span className="absolute -top-[19px] left-0 whitespace-nowrap bg-brand-accent px-[6px] py-[4px] font-mono text-[7px] font-semibold text-brand-primary">
              01 / SOFA
            </span>
          </div>
          <div className="absolute bottom-[18%] right-[13%] h-[31%] w-[13%] border border-brand-accent bg-brand-accent/15">
            <span className="absolute -top-[19px] left-0 whitespace-nowrap bg-brand-accent px-[6px] py-[4px] font-mono text-[7px] font-semibold text-brand-primary">
              02 / CHAIR
            </span>
          </div>
          <div className="absolute bottom-[17%] left-[20%] h-[23%] w-[20%] border border-brand-accent bg-brand-accent/15">
            <span className="absolute -top-[19px] left-0 whitespace-nowrap bg-brand-accent px-[6px] py-[4px] font-mono text-[7px] font-semibold text-brand-primary">
              03 / CLUTTER
            </span>
          </div>
        </>
      )}

      {variant === "furnished" && (
        <div className="absolute bottom-[20%] left-[37%] h-[25%] w-[31%]">
          <div className="h-[78%] rounded-t-md border border-brand-accent bg-[linear-gradient(#7f8d92,#4d585c)] shadow-[0_0_24px_rgba(198,255,74,0.22)]" />
          <span className="mt-2 block font-mono text-[7px] tracking-[0.1em] text-brand-accent">SOFA_01 / PLACED</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-3">
        <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-white/50" />
        <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-white/50" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-white/50" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-white/50" />
      </div>

      <div className="absolute inset-x-5 bottom-4 flex items-center justify-between font-mono text-[8px] tracking-[0.12em] text-white/70">
        <span>{label ?? captions[variant]}</span>
        <span>1.6M / 22°</span>
      </div>
    </div>
  );
}
