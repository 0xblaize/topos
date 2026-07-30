"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f0f0] p-6">
      <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/70 p-8 text-center shadow-sm backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[rgba(30,50,90,0.55)]">Topos workspace</p>
        <h1 className="mt-3 text-3xl font-normal tracking-tight text-[#5E6470]">This workspace could not load.</h1>
        <p className="mt-3 text-sm leading-relaxed text-[rgba(30,50,90,0.65)]">Try again. Your saved room data has not been changed.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-[rgba(30,50,90,0.9)] px-6 py-3 text-sm text-white">Try again</button>
      </section>
    </main>
  );
}
