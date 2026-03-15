import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EvidencePage({ params, searchParams }) {
  const { caseId } = await params;
  const sp = await searchParams;
  const isPatient = sp?.source === "patient";

  let patient;
  try {
    await connectToDatabase();
    patient = await Case.findById(caseId).lean();
  } catch (e) {
    return notFound();
  }

  if (!patient) return notFound();

  const hasDiagnosis =
    patient.rag_diagnosis &&
    Array.isArray(patient.rag_diagnosis) &&
    patient.rag_diagnosis.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* Back */}
      {isPatient ? (
        <Link
          href={`/patient/${patient.patientId}/past-diagnosis`}
          className="text-text-muted hover:text-neon-cyan text-sm mb-8 inline-flex items-center gap-2 transition-colors"
        >
          ← Back to Past Diagnosis
        </Link>
      ) : (
        <Link
          href={`/case/${caseId}`}
          className="text-text-muted hover:text-neon-cyan text-sm mb-8 inline-flex items-center gap-2 transition-colors"
        >
          ← Back to Summary
        </Link>
      )}

      {/* Header */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-6 mb-10">
        <h1 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <span className="text-neon-purple">📚</span> Medical Evidence
        </h1>

        <p className="text-text-muted text-sm">
          Retrieved clinical evidence for <span className="text-text-primary font-semibold">{patient.name}</span>
        </p>
      </div>


      {/* Evidence Results */}
      {hasDiagnosis ? (
        <div className="space-y-6 mb-10">

          {patient.rag_diagnosis.map((diag, i) => (
            <div
              key={i}
              className="gradient-card rounded-2xl border border-border-subtle p-6 hover:border-neon-purple/30 transition-all"
            >

              {/* Title */}
              <div className="flex items-start justify-between mb-4">

                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <span className="text-neon-purple">#{i + 1}</span>
                  {diag.disease}
                </h3>

                {diag.confidence && (
                  <span className="px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30 text-xs font-bold">
                    {(diag.confidence * 100).toFixed(1)}% relevance
                  </span>
                )}

              </div>


              {/* Source */}
              <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle mb-4">

                <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-semibold">
                  Source
                </p>

                <p className="text-text-secondary text-sm">
                  Medical Knowledge Base — Disease–Symptom–Precaution Dataset
                </p>

              </div>


              {/* Evidence */}
              {diag.symptoms && diag.symptoms.length > 0 && (
                <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle mb-4">

                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-semibold">
                    Matching Evidence
                  </p>

                  <p className="text-text-secondary text-sm leading-relaxed">
                    Associated symptoms for{" "}
                    <span className="text-neon-cyan font-semibold">
                      {diag.disease}
                    </span>
                    : {diag.symptoms.join(", ")}.
                  </p>

                </div>
              )}


              {/* Reasoning */}
              {diag.reasoning && (
                <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle">

                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1 font-semibold">
                    Relevance Explanation
                  </p>

                  <p className="text-text-secondary text-sm leading-relaxed">
                    {diag.reasoning}
                  </p>

                </div>
              )}

            </div>
          ))}

        </div>
      ) : (

        <div className="gradient-card rounded-2xl border border-border-subtle p-10 text-center mb-10">

          <div className="text-4xl mb-4">⚠️</div>

          <p className="text-text-muted mb-4">
            No evidence available. Run AI diagnosis to retrieve medical knowledge.
          </p>

          <Link
            href={`/case/${caseId}/diagnosis${isPatient ? "?source=patient" : ""}`}
            className="text-neon-cyan text-sm hover:underline"
          >
            Go to Diagnosis →
          </Link>

        </div>
      )}


      {/* Navigation */}
      <div className="flex justify-between items-center flex-wrap gap-3">

        <Link
          href={`/case/${caseId}/diagnosis${isPatient ? "?source=patient" : ""}`}
          className="gradient-btn-cyan text-bg-primary font-bold py-2.5 px-5 rounded-xl text-sm transition-all"
        >
          View Diagnosis
        </Link>

        {!isPatient && (
          <Link
            href="/doctor/dashboard"
            className="border border-border-subtle text-text-muted font-medium py-2.5 px-5 rounded-xl text-sm hover:text-text-secondary transition-all"
          >
            Dashboard
          </Link>
        )}

      </div>

    </div>
  );
}