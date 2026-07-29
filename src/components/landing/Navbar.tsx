const navItems = [
  ["Workflow", "#workflow"],
  ["Capabilities", "#capabilities"],
  ["Use cases", "#use-cases"],
] as const;

export function Navbar() {
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Primary navigation">
        <a href="#top" className="brand" aria-label="Topos home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>topos<span className="brand-dot">.</span></span>
        </a>
        <div className="nav-links">
          {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </div>
        <a className="nav-cta" href="#contact"><span>Build a room</span><b aria-hidden="true">↗</b></a>
      </nav>
    </header>
  );
}
