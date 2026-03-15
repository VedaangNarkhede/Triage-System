import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EvidencePage({ params }) {
  const { caseId } = await params;
  let patient;
  try {
    await connectToDatabase();
    patient = await Case.findById(caseId).lean();
  } catch (e) {
    return notFound();
  }
  if (!patient) return notFound();

  const hasDiagnosis = patient.rag_diagnosis && Array.isArray(patient.rag_diagnosis) && patient.rag_diagnosis.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href={`/case/${caseId}`} className="text-text-muted hover:text-neon-cyan text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Back to Summary
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Medical Evidence</h1>
        <p className="text-text-muted text-sm">Retrieved knowledge base evidence for {patient.name}</p>
      </div>

      {hasDiagnosis ? (
        <div className="space-y-4 mb-8">
          {patient.rag_diagnosis.map((diag, i) => (
            <div key={i} className="gradient-card rounded-2xl border border-border-subtle p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <span className="text-neon-purple">📚</span> {diag.disease}
                </h3>
                {diag.confidence && (
                  <span className="px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30 text-xs font-bold">
                    {(diag.confidence * 100).toFixed(1)}% relevance
                  </span>
                )}
              </div>

              {/* Source */}
              <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle mb-3">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-semibold">Source Document</p>
                <p className="text-text-secondary text-sm">Medical Knowledge Base — Disease-Symptom-Precaution Dataset</p>
              </div>

              {/* Evidence Snippet */}
              {diag.symptoms && diag.symptoms.length > 0 && (
                <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle mb-3">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-semibold">Matching Evidence</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Associated symptoms for <span className="text-neon-cyan">{diag.disease}</span>: {diag.symptoms.join(", ")}.
                  </p>
                </div>
              )}

              {/* Relevance Explanation */}
              {diag.reasoning && (
                <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-semibold">Relevance Explanation</p>
                  <p className="text-text-secondary text-sm leading-relaxed">{diag.reasoning}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="gradient-card rounded-2xl border border-border-subtle p-10 text-center mb-8">
          <p className="text-text-muted">No evidence available. Run AI Diagnosis first.</p>
          <Link href={`/case/${caseId}/diagnosis`} className="text-neon-cyan text-sm hover:underline mt-2 inline-block">
            Go to Diagnosis →
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
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
