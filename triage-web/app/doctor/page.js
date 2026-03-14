import Link from "next/link";

export default function DoctorPortal() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl w-full text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan text-xs font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                Doctor Authentication Active
            </div>
            
            <h1 className="text-5xl font-bold text-text-primary mb-6 tracking-tight">
                Welcome to the <br /> <span className="text-neon-cyan glow-text-cyan">Doctor Portal</span>
            </h1>
            
            <p className="text-text-muted text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                Access the centralized clinical dashboard to review AI-triaged patient cases. Cases are automatically prioritized by urgency to optimize attention.
            </p>
            
            <Link href="/doctor/dashboard"
                className="inline-flex items-center justify-center gap-3 gradient-btn-cyan text-bg-primary font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all uppercase tracking-widest text-sm"
            >
                View Patient Diagnosis Dashboard
                <span className="text-lg">→</span>
            </Link>

            <div className="mt-12 text-sm text-text-secondary">
               <Link href="/" className="hover:text-neon-cyan transition-colors underline underline-offset-4">Return to Portal Selection</Link>
            </div>
        </div>
    </div>
  );
}
