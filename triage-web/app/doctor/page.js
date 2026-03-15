import Link from "next/link";

export default function DoctorPortal() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Doctor <span className="text-neon-cyan">Portal</span></h1>
        <p className="text-text-muted text-sm">Central hub for clinical oversight and diagnosis management.</p>
      </div>

      <div className="bg-bg-secondary rounded-2xl border border-border-subtle p-10 hover:border-neon-cyan/50 transition-all group max-w-2xl mx-auto text-center">
        <div className="text-5xl mb-6">🩺</div>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Patient Diagnosis Dashboard</h2>
        <p className="text-text-secondary text-base mb-10 max-w-md mx-auto">
          Access the real-time queue of all patient cases, review clinical notes, and manage urgency levels across the system.
        </p>
        <Link href="/doctor/dashboard"
          className="inline-block gradient-btn-cyan text-bg-primary font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all uppercase tracking-wider text-sm shadow-md"
        >
          View Case Dashboard
        </Link>
      </div>
    </div>
  );
}
