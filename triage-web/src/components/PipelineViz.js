"use client";

const STEPS = [
  { label: "Patient Input", icon: "📋" },
  { label: "OCR / ASR", icon: "🔍" },
  { label: "Clinical NLP", icon: "🧠" },
  { label: "LLM Summary", icon: "📝" },
  { label: "RAG Retrieval", icon: "📚" },
  { label: "Evidence Builder", icon: "🔬" },
  { label: "Diagnosis Agent", icon: "🤖" },
  { label: "Emergency Detection", icon: "🚨" },
];

export default function PipelineViz({ activeStep = -1, compact = false }) {
  return (
    <div className={`flex ${compact ? "flex-wrap gap-2 justify-center" : "flex-col md:flex-row items-center justify-center gap-1"}`}>
      {STEPS.map((step, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        const isPending = i > activeStep;
        
        return (
          <div key={i} className="flex items-center">
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-500
              ${isActive 
                ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan glow-cyan animate-pulse-glow" 
                : isDone 
                  ? "border-neon-green/40 bg-neon-green/10 text-neon-green" 
                  : "border-border-subtle bg-bg-card text-text-muted"}
            `}>
              <span className="text-sm">{step.icon}</span>
              {!compact && <span>{step.label}</span>}
              {compact && <span className="hidden sm:inline">{step.label}</span>}
            </div>
            {i < STEPS.length - 1 && !compact && (
              <div className={`hidden md:block w-4 h-px mx-0.5 ${isDone ? "bg-neon-green/50" : "bg-border-subtle"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
