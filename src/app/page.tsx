"use client";

import { DemoPitch } from "@/components/DemoPitch";
import { Engine } from "@/components/Engine";
import { Hero } from "@/components/Hero";
import { Pipeline } from "@/components/Pipeline";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { FinalCta, Stack } from "@/components/Stack";
import { useScrollReveal } from "@/components/useScrollReveal";

export default function Home() {
  useScrollReveal();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-neutral-background font-secondary text-text-primary">
      <SiteHeader />
      <main className="flex-grow pt-32">
        <Hero />
        <Pipeline />
        <Engine />
        <DemoPitch />
        <Stack />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
