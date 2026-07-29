import { RoomScene } from "./RoomScene";

export function DemoPitch() {
  return (
    <section id="demo" className="relative overflow-hidden bg-[#C6FF4A] px-6 py-32 text-brand-primary md:px-12 lg:px-20">
      <div className="absolute right-0 top-0 h-full w-1/3 -skew-x-12 bg-brand-primary/5" />
      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 items-center gap-20 md:grid-cols-2">
          <div data-animation-on-scroll="" data-animation-direction="left">
            <svg className="mb-8 h-16 w-16 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L22.017 3V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM2.01697 21L2.01697 18C2.01697 16.8954 2.9124 16 4.01697 16H7.01697C7.56925 16 8.01697 15.5523 8.01697 15V9C8.01697 8.44772 7.56925 8 7.01697 8H4.01697C2.9124 8 2.01697 7.10457 2.01697 6V3L10.017 3V15C10.017 18.3137 7.33068 21 4.01697 21H2.01697Z" />
            </svg>
            <p className="mb-12 pl-2 font-secondary text-3xl italic leading-tight md:text-5xl">
              &ldquo;Everyone has tried an AR furniture app. They all fail for the same reason — you can&apos;t put a new digital couch where your old physical couch is sitting.&rdquo;
            </p>
            <div>
              <h4 className="text-xl font-bold uppercase tracking-widest">The Topos Premise</h4>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] opacity-60">Clear the space, then build</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4" data-animation-on-scroll="" data-animation-direction="right">
            <div className="mt-12 h-64 overflow-hidden rounded-sm shadow-xl md:h-80">
              <RoomScene variant="masked" label="BEFORE" />
            </div>
            <div className="h-64 overflow-hidden rounded-sm shadow-xl md:h-80">
              <RoomScene variant="furnished" label="AFTER" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
