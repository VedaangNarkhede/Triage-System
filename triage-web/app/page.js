import Link from "next/link";
import PipelineViz from "@/components/PipelineViz";

const FEATURES = [
  { icon: "📡", title: "Multimodal Input", desc: "Accept text, audio, images, and PDF documents as clinical input." },
  { icon: "🧠", title: "Clinical NLP", desc: "Extract medical entities, symptoms, and temporal information automatically." },
  { icon: "📝", title: "AI Clinical Summary", desc: "Generate structured clinical notes via LLM-powered summarization." },
  { icon: "🔬", title: "Evidence Based Diagnosis", desc: "RAG-powered differential diagnosis with medical knowledge retrieval." },
  { icon: "🚨", title: "Emergency Detection", desc: "Instant urgency classification to prioritize critical patients." },
];

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="gradient-hero py-28 px-6 relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            AI-Powered Clinical Triage
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-text-primary">AI Clinical</span><br />
            <span className="text-neon-cyan glow-text-cyan">Triage Assistant</span>
          </h1>
          
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform unstructured patient data into structured clinical insights. 
            Multimodal input processing, evidence-based diagnosis, and emergency detection — all powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit-case"
              className="gradient-btn-cyan text-bg-primary font-bold py-3 px-8 rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Upload Patient Case
            </Link>
            <Link href="/dashboard"
              className="border border-neon-purple/40 text-neon-purple font-bold py-3 px-8 rounded-xl hover:bg-neon-purple/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-6 bg-bg-primary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Intelligent Pipeline</h2>
            <p className="text-text-muted max-w-xl mx-auto">End-to-end AI processing from raw patient input to actionable clinical decisions.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="gradient-card rounded-2xl border border-border-subtle p-5 hover:border-neon-cyan/30 transition-all duration-300 group text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-text-primary font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Visualization */}
      <section className="py-16 px-6 bg-bg-secondary border-t border-border-subtle">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">System Pipeline</h2>
          <p className="text-text-muted mb-10 text-sm">How patient data flows through the AI engine</p>
          <PipelineViz activeStep={-1} />
        </div>
      </section>
    </div>
  );
}
