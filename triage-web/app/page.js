import Link from "next/link";

const FEATURES = [
  {
    icon: "🗣",
    title: "Describe Health Concerns",
    desc: "Share symptoms in your own words or upload reports to explain the situation."
  },
  {
    icon: "🧠",
    title: "Smart Understanding",
    desc: "The system organizes symptoms and medical details into clear structured information."
  },
  {
    icon: "📊",
    title: "Clear Insights",
    desc: "Possible conditions and supporting explanations are highlighted."
  },
  {
    icon: "📚",
    title: "Medical Evidence",
    desc: "Relevant medical knowledge is retrieved to support the suggested conditions."
  },
  {
    icon: "🚑",
    title: "Urgency Awareness",
    desc: "Helps identify how urgent a situation might be so next steps are clearer."
  },
];

export default function Home() {
  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center">

      {/* Hero Section */}
      <section className="py-24 px-6 relative w-full flex flex-col justify-center items-center overflow-hidden">

        {/* Decorative Orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center w-full">

          {/* Hero Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-text-primary">
              Helping people understand
            </span>
            <br />
            <span className="text-neon-cyan glow-text-cyan">
              health concerns faster
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-text-secondary text-lg md:text-xl max-w-3xl mx-auto mb-14 leading-relaxed">
            Health concerns can feel confusing. Describe symptoms, share notes,
            or upload reports and TRIAGE organizes the information into clear
            insights to help understand what might be happening.
          </p>

          {/* Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Clinical Dashboard */}
            <div className="gradient-card p-10 rounded-3xl border border-neon-cyan/20 hover:border-neon-cyan/60 transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center">

              <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-20 h-20 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mb-6 border border-neon-cyan/30 text-4xl group-hover:scale-110 transition-transform duration-500">
                📊
              </div>

              <h2 className="text-3xl font-bold text-text-primary mb-4 group-hover:text-neon-cyan transition-colors">
                Doctor Portal
              </h2>

              <p className="text-text-secondary mb-8">
                Access clinical dashboards and review patient diagnoses.
              </p>

              <Link
                href="/doctor/dashboard"
                className="w-full gradient-btn-cyan text-bg-primary font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 text-sm uppercase tracking-wider relative z-10"
              >
                Open Dashboard
              </Link>
            </div>

            {/* Symptom Input */}
            <div className="gradient-card p-10 rounded-3xl border border-neon-purple/20 hover:border-neon-purple/60 transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center">

              <div className="absolute inset-0 bg-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-20 h-20 rounded-2xl bg-neon-purple/10 flex items-center justify-center mb-6 border border-neon-purple/30 text-4xl group-hover:scale-110 transition-transform duration-500">
                🗣
              </div>

              <h2 className="text-3xl font-bold text-text-primary mb-4 group-hover:text-neon-purple transition-colors">
                Patient Portal  
              </h2>

              <p className="text-text-secondary mb-8">
                Share symptoms or health concerns and explore possible insights.
              </p>

              <Link
                href="/patient-auth"
                className="w-full gradient-btn-purple text-white font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 text-sm uppercase tracking-wider relative z-10"
              >
                Start Exploring
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-6 bg-bg-primary">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              How TRIAGE Helps
            </h2>

            <p className="text-text-muted max-w-xl mx-auto">
              Turning health concerns into clearer insights through structured
              understanding and medical knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="gradient-card rounded-2xl border border-border-subtle p-5 hover:border-neon-cyan/30 transition-all duration-300 group text-center"
              >
                <div className="text-3xl mb-3">{f.icon}</div>

                <h3 className="text-text-primary font-semibold text-sm mb-2">
                  {f.title}
                </h3>

                <p className="text-text-muted text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}