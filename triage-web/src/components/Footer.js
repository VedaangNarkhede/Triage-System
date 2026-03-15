import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-subtle py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-3 text-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md gradient-btn-cyan flex items-center justify-center text-bg-primary font-black text-xs">
            AI
          </div>
          <span className="font-bold text-text-primary">
            TRIAGE<span className="text-neon-cyan">.</span>AI
          </span>
        </div>

        {/* Small description */}
        <p className="text-text-muted text-sm max-w-md">
          AI-powered clinical triage and decision support system.
        </p>

        {/* Copyright */}
        <p className="text-text-muted text-xs">
          &copy; {new Date().getFullYear()} TRIAGE.AI
        </p>

      </div>
    </footer>
  );
}