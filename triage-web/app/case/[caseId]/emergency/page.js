import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const URGENCY_CONFIG = {
  Critical: { color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/40", ring: "shadow-[0_0_40px_rgba(239,68,68,0.3)]", label: "CRITICAL" },
  High:     { color: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/40", ring: "shadow-[0_0_40px_rgba(249,115,22,0.3)]", label: "HIGH" },
  Medium:   { color: "text-neon-yellow", bg: "bg-neon-yellow/10", border: "border-neon-yellow/40", ring: "shadow-[0_0_40px_rgba(234,179,8,0.3)]", label: "MODERATE" },
  Low:      { color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/40", ring: "shadow-[0_0_40px_rgba(34,197,94,0.3)]", label: "LOW" },
  Unknown:  { color: "text-text-muted", bg: "bg-text-muted/10", border: "border-text-muted/40", ring: "", label: "UNKNOWN" },
};

export default async function EmergencyPage({ params }) {
  await connectToDatabase();
  const { caseId } = await params;

  let patient;
  try {
    patient = await Case.findById(caseId).lean();
  } catch (e) {
    return notFound();
  }
  if (!patient) return notFound();

  const uc = URGENCY_CONFIG[patient.urgency] || URGENCY_CONFIG.Unknown;
  const hasDiagnosis = patient.rag_diagnosis && Array.isArray(patient.rag_diagnosis) && patient.rag_diagnosis.length > 0;

  // Collect all precautions from diagnosis
  const allPrecautions = hasDiagnosis 
    ? patient.rag_diagnosis.flatMap(d => d.precautions || [])
    : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link href={`/case/${caseId}`} className="text-text-muted hover:text-neon-cyan text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Back to Summary
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Emergency Detection</h1>
        <p className="text-text-muted text-sm">Urgency classification for {patient.name}</p>
      </div>

      {/* Big Urgency Indicator */}
      <div className={`gradient-card rounded-3xl border-2 ${uc.border} p-12 text-center mb-8 ${uc.ring}`}>
        <div className={`text-6xl md:text-8xl font-black ${uc.color} mb-4`}>
          {uc.label}
        </div>
        <p className="text-text-muted text-sm">Urgency Classification</p>
      </div>

      {/* Precautions */}
      {allPrecautions.length > 0 && (
        <div className="gradient-card rounded-2xl border border-border-subtle p-6 mb-8">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-neon-yellow">⚠️</span> Recommended Actions & Precautions
          </h2>
          <div className="space-y-2">
            {[...new Set(allPrecautions)].map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-bg-primary rounded-xl p-3 border border-border-subtle">
                <span className="text-neon-yellow mt-0.5">•</span>
                <span className="text-text-secondary text-sm capitalize">{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasDiagnosis && (
        <div className="gradient-card rounded-2xl border border-border-subtle p-8 text-center mb-8">
          <p className="text-text-muted text-sm mb-2">Run AI Diagnosis to get detailed precautions and actions.</p>
          <Link href={`/case/${caseId}/diagnosis`} className="text-neon-cyan hover:underline text-sm">
            Go to Diagnosis →
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <Link href={`/case/${caseId}/diagnosis`}
          className="gradient-btn-cyan text-bg-primary font-bold py-2.5 px-5 rounded-xl text-sm transition-all">
          View Diagnosis
        </Link>
        <Link href={`/case/${caseId}`}
          className="border border-border-subtle text-text-muted font-medium py-2.5 px-5 rounded-xl text-sm transition-all">
          Back to Summary
        </Link>
        <Link href="/dashboard"
          className="border border-border-subtle text-text-muted font-medium py-2.5 px-5 rounded-xl text-sm transition-all">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
