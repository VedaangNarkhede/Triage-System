import PipelineViz from "@/components/PipelineViz";

const TECH_STACK = [
  { name: "Next.js", desc: "Frontend framework with App Router" },
  { name: "FastAPI", desc: "Python backend for AI pipeline" },
  { name: "Tailwind CSS", desc: "Utility-first CSS framework" },
  { name: "MongoDB", desc: "NoSQL database for patient records" },
  { name: "HuggingFace", desc: "LLM inference (Qwen2.5-32B)" },
  { name: "ChromaDB", desc: "Vector database for RAG embeddings" },
  { name: "MinerU OCR", desc: "Vision-language model for document OCR" },
  { name: "spaCy / medspaCy", desc: "NLP for medical entity extraction" },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          About TRIAGE.AI
        </h1>
        <p className="text-text-muted text-sm max-w-2xl mx-auto">
          An AI-powered clinical triage and decision support system designed to transform
          unstructured medical data into actionable clinical insights.
        </p>
      </div>

      {/* Problem */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-neon-red">🏥</span> The Problem
        </h2>

        <p className="text-text-secondary leading-relaxed text-sm mb-4">
          Emergency departments and outpatient clinics worldwide face an ever-increasing
          volume of patients. Medical staff must quickly interpret diverse and
          fragmented patient information while making critical decisions under time
          pressure. Traditional triage systems rely heavily on manual assessment,
          which can lead to inconsistent prioritization, documentation delays,
          and missed clinical signals.
        </p>

        <p className="text-text-secondary leading-relaxed text-sm mb-4">
          Much of the clinical data received during triage is unstructured.
          Patients describe symptoms in natural language, doctors dictate voice
          notes, and medical reports often arrive as scanned images or PDFs.
          Extracting meaningful insights from this heterogeneous data requires
          significant manual effort, increasing cognitive load on healthcare
          professionals.
        </p>

        <p className="text-text-secondary leading-relaxed text-sm">
          As a result, healthcare systems struggle with delayed diagnosis,
          inefficient patient prioritization, and administrative overhead.
          There is a clear need for intelligent systems that can automatically
          process multimodal medical data, assist clinicians in understanding
          patient conditions, and provide evidence-based decision support in
          real time.
        </p>
      </div>

      {/* Pipeline */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-2 justify-center">
          <span className="text-neon-cyan">🤖</span> AI Pipeline
        </h2>

        <PipelineViz activeStep={-1} compact />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Step 1 */}
          <div className="bg-bg-primary rounded-xl p-5 border border-border-subtle hover:border-neon-cyan/40 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-md bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center text-xs font-bold text-neon-cyan">
                1
              </div>
              <h3 className="text-neon-cyan font-semibold text-sm">Multimodal Input Processing</h3>
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Patient information can arrive in multiple formats including text,
              voice recordings, medical images, and PDF reports. MinerU OCR
              and ASR systems convert these inputs into machine-readable data.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-bg-primary rounded-xl p-5 border border-border-subtle hover:border-neon-cyan/40 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-md bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center text-xs font-bold text-neon-cyan">
                2
              </div>
              <h3 className="text-neon-cyan font-semibold text-sm">Clinical NLP Extraction</h3>
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              spaCy and medspaCy identify clinical entities such as symptoms,
              diagnoses, medications, and time references from unstructured
              text to build structured patient information.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-bg-primary rounded-xl p-5 border border-border-subtle hover:border-neon-cyan/40 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-md bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center text-xs font-bold text-neon-cyan">
                3
              </div>
              <h3 className="text-neon-cyan font-semibold text-sm">AI Clinical Summarization</h3>
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              The Qwen2.5-32B large language model generates structured
              clinical summaries, highlights critical symptoms, and
              determines urgency levels for triage.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-bg-primary rounded-xl p-5 border border-border-subtle hover:border-neon-cyan/40 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-md bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center text-xs font-bold text-neon-cyan">
                4
              </div>
              <h3 className="text-neon-cyan font-semibold text-sm">RAG-Based Diagnosis</h3>
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              ChromaDB retrieves relevant medical knowledge from
              clinical literature and knowledge bases to generate
              evidence-based differential diagnoses.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}