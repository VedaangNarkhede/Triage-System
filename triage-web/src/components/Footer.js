import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-subtle py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md gradient-btn-cyan flex items-center justify-center text-bg-primary font-black text-xs">AI</div>
              <span className="font-bold text-text-primary">TRIAGE<span className="text-neon-cyan">.</span>AI</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              AI-powered clinical triage and decision support system for faster, smarter medical assessments.
            </p>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold mb-3 text-sm uppercase tracking-wider">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-text-muted text-sm hover:text-neon-cyan transition-colors">Dashboard</Link>
              <Link href="/submit-case" className="text-text-muted text-sm hover:text-neon-cyan transition-colors">Submit Case</Link>
              <Link href="/past-cases" className="text-text-muted text-sm hover:text-neon-cyan transition-colors">Past Cases</Link>
            </div>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold mb-3 text-sm uppercase tracking-wider">Info</h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-text-muted text-sm hover:text-neon-cyan transition-colors">About</Link>
              <span className="text-text-muted text-sm">Contact: support@triage.ai</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border-subtle pt-6 text-center text-text-muted text-xs">
          &copy; {new Date().getFullYear()} AI-Powered Intelligent Triage &amp; Decision Support System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
