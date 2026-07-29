import { Capabilities } from "@/components/landing/Capabilities";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { RoomComparison } from "@/components/landing/RoomComparison";
import { Workflow } from "@/components/landing/Workflow";

const useCases = [
  ["01", "Home stagers", "Show the potential of a room before a single piece is moved."],
  ["02", "Furniture teams", "Let customers test the feeling of a collection in the context they own."],
  ["03", "Renters & designers", "Take a room from existing reality to its next configuration in one flow."],
];

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Workflow />
      <RoomComparison />
      <Capabilities />
      <section id="use-cases" className="use-cases section">
        <div className="use-case-heading"><div className="eyebrow-row"><span className="pulse-dot" /> DESIGNED FOR TRANSITION</div><h2>The room is already<br />full of <i>possibility.</i></h2></div>
        <div className="use-case-grid">{useCases.map(([number, title, copy]) => <article key={number}><span>{number}</span><div className="use-case-icon" aria-hidden="true"><i /><i /></div><h3>{title}</h3><p>{copy}</p><a href="#contact" aria-label={`Learn about Topos for ${title}`}>Explore <b>↗</b></a></article>)}</div>
      </section>
      <FinalCta />
      <Footer />
    </main>
  );
}
