import Link from "next/link";
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
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-text-primary mb-3">About TRIAGE.AI</h1>
        <p className="text-text-muted text-sm max-w-2xl mx-auto">
          An AI-powered clinical triage and decision support system designed to transform unstructured medical data into actionable clinical insights.
        </p>
      </div>

      {/* Problem */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-neon-red">🏥</span> The Problem
        </h2>
        <p className="text-text-secondary leading-relaxed text-sm">
          Emergency departments worldwide face overwhelming patient volumes. Manual triage relies on subjective assessment,
          leading to inconsistent prioritization and delayed care. Unstructured clinical inputs — handwritten notes, voice recordings,
          and scanned documents — create bottlenecks in the diagnostic workflow.
        </p>
      </div>

      {/* Pipeline */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <span className="text-neon-cyan">🤖</span> AI Pipeline
        </h2>
        <PipelineViz activeStep={-1} compact />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle">
            <h3 className="text-neon-cyan font-semibold mb-1">Input Processing</h3>
            <p className="text-text-muted text-xs">Multimodal ingestion — accept text, audio (ASR), images (OCR via MinerU), and PDF documents.</p>
          </div>
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle">
            <h3 className="text-neon-cyan font-semibold mb-1">Clinical NLP</h3>
            <p className="text-text-muted text-xs">Medical NER with spaCy and medspaCy to extract symptoms, conditions, medications, and temporal information.</p>
          </div>
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle">
            <h3 className="text-neon-cyan font-semibold mb-1">LLM Summarization</h3>
            <p className="text-text-muted text-xs">Qwen2.5-32B generates structured clinical notes with urgency classification and patient assessment.</p>
          </div>
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle">
            <h3 className="text-neon-cyan font-semibold mb-1">RAG Diagnosis</h3>
            <p className="text-text-muted text-xs">Retrieval-Augmented Generation using ChromaDB embeddings for evidence-based differential diagnosis.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link href="/submit-case"
          className="gradient-btn-cyan text-bg-primary font-bold py-2.5 px-6 rounded-xl text-sm transition-all">
          Submit Case
        </Link>
        <Link href="/"
          className="border border-border-subtle text-text-muted font-medium py-2.5 px-6 rounded-xl text-sm hover:text-text-secondary transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
