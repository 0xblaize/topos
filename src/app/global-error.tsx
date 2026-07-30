"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-[#f0f0f0]">
        <main className="flex min-h-screen items-center justify-center p-6">
          <section className="w-full max-w-md rounded-[2rem] bg-white/80 p-8 text-center">
            <h1 className="text-3xl font-normal text-[#5E6470]">Topos needs a restart.</h1>
            <p className="mt-3 text-sm text-[rgba(30,50,90,0.65)]">Refresh this workspace and try again.</p>
            <button onClick={reset} className="mt-6 rounded-full bg-[rgba(30,50,90,0.9)] px-6 py-3 text-sm text-white">Reload</button>
          </section>
        </main>
      </body>
    </html>
  );
}
