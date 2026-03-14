import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl w-full z-10 flex flex-col items-center">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="text-text-primary">Clinical Triage</span>{" "}
            <span className="text-neon-cyan glow-text-cyan">System</span>
          </h1>
          <p className="text-text-secondary text-lg">Select your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Doctor Card */}
          <div className="gradient-card rounded-2xl border border-border-subtle p-8 flex flex-col items-center text-center hover:border-neon-cyan/50 hover:glow-cyan-hover transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="w-20 h-20 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-4xl">👨‍⚕️</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Doctor Portal</h2>
            <p className="text-text-muted mb-8 flex-1">
              Access clinical dashboards and review patient diagnoses prioritized by urgency.
            </p>
            <Link 
              href="/doctor"
              className="w-full gradient-btn-cyan text-bg-primary font-bold py-3 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all uppercase tracking-wider text-sm"
            >
              Proceed as Doctor
            </Link>
          </div>

          {/* Patient Card */}
          <div className="gradient-card rounded-2xl border border-border-subtle p-8 flex flex-col items-center text-center hover:border-neon-purple/50 hover:glow-purple transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="w-20 h-20 rounded-full bg-neon-purple/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-4xl">🤒</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Patient Portal</h2>
            <p className="text-text-muted mb-8 flex-1">
              Submit your symptoms and view your diagnosis history in a secure environment.
            </p>
            <Link 
              href="/patient-auth"
              className="w-full gradient-btn-purple text-white font-bold py-3 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all uppercase tracking-wider text-sm"
            >
              Proceed as Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
