import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Link from "next/link";
import { notFound } from "next/navigation";
import DiagnoseButton from "./DiagnoseButton";

export const dynamic = "force-dynamic";

export default async function DiagnosisPage({ params }) {
  await connectToDatabase();
  const { caseId } = await params;

  let patient;
  try {
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
        <h1 className="text-2xl font-bold text-text-primary mb-2">Differential Diagnosis</h1>
        <p className="text-text-muted text-sm">AI-powered diagnostic reasoning for {patient.name}</p>
      </div>

      {hasDiagnosis ? (
        <div className="space-y-4 mb-8">
          {patient.rag_diagnosis.map((diag, i) => (
            <div key={i} className="gradient-card rounded-2xl border border-border-subtle p-6 hover:border-neon-cyan/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-text-primary">{i + 1}. {diag.disease}</h3>
                {diag.confidence && (
                  <span className="px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 text-xs font-bold">
                    {Math.round(diag.confidence * 100)}% match
                  </span>
                )}
              </div>

              {/* Supporting Symptoms */}
              {diag.symptoms && diag.symptoms.length > 0 && (
                <div className="mb-3">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1.5 font-semibold">Supporting Symptoms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {diag.symptoms.map((s, j) => (
                      <span key={j} className="px-2 py-1 rounded-md bg-neon-green/10 text-neon-green border border-neon-green/20 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {diag.reasoning && (
                <div className="mb-3">
                  <details className="group">
                    <summary className="text-text-muted text-xs uppercase tracking-wider mb-1.5 font-semibold cursor-pointer hover:text-text-secondary transition-colors">
                      Clinical Reasoning ▸
                    </summary>
                    <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle text-text-secondary text-sm leading-relaxed mt-2">
                      {diag.reasoning}
                    </div>
                  </details>
                </div>
              )}

              {/* Precautions */}
              {diag.precautions && diag.precautions.length > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1.5 font-semibold">Precautions</p>
                  <ul className="space-y-1">
                    {diag.precautions.map((p, j) => (
                      <li key={j} className="text-text-secondary text-sm flex items-start gap-2">
                        <span className="text-neon-yellow mt-0.5">•</span>
                        <span className="capitalize">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <DiagnoseButton patientId={patient._id.toString()} />
      )}

      {/* Navigation */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Link href={`/case/${caseId}/evidence`}
          className="border border-neon-purple/40 text-neon-purple font-medium py-2.5 px-5 rounded-xl text-sm hover:bg-neon-purple/10 transition-all">
          View Medical Evidence
        </Link>
        <Link href={`/case/${caseId}/emergency`}
          className="border border-neon-red/40 text-neon-red font-medium py-2.5 px-5 rounded-xl text-sm hover:bg-neon-red/10 transition-all">
          View Emergency Risk
        </Link>
        <Link href={`/case/${caseId}`}
          className="border border-border-subtle text-text-muted font-medium py-2.5 px-5 rounded-xl text-sm hover:text-text-secondary transition-all">
          Back to Summary
        </Link>
        <Link href="/dashboard"
          className="border border-border-subtle text-text-muted font-medium py-2.5 px-5 rounded-xl text-sm hover:text-text-secondary transition-all">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
