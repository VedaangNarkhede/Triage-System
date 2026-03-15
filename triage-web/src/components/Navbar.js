"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-bg-secondary/80 backdrop-blur-xl border-b border-border-subtle sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-btn-cyan flex items-center justify-center text-bg-primary font-black text-sm">
            AI
          </div>
          <span className="text-lg font-bold text-text-primary tracking-wide group-hover:text-neon-cyan transition-colors">
            TRIAGE<span className="text-neon-cyan">.</span>AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" 
                    : "text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/5 border border-transparent"}
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger - simplified */}
        <button className="md:hidden text-text-secondary hover:text-neon-cyan p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
