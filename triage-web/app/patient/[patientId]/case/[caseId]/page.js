import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Patient from "@/models/Patient";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PatientCaseDetail({ params }) {
  await connectToDatabase();
  const { patientId, caseId } = await params;
  
  let caseRecord;
  try {
    caseRecord = await Case.findById(caseId).lean();
  } catch (e) {
    return notFound();
  }

  if (!caseRecord || caseRecord.patientId !== parseInt(patientId)) return notFound();

  const isHighUrgency = caseRecord.urgency?.toLowerCase() === "high";
  const isMedUrgency = caseRecord.urgency?.toLowerCase() === "medium" || caseRecord.urgency?.toLowerCase() === "moderate";
  const badgeColor = isHighUrgency ? "from-red-600 to-red-900 border-red-500" : isMedUrgency ? "from-yellow-600 to-yellow-900 border-yellow-500" : "from-neon-purple to-[#4c1d95] border-neon-purple";

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <Link href={`/patient/${patientId}/past-diagnosis`} className="text-neon-cyan hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
            &larr; Back to History
          </Link>
        </div>

        <div className="bg-bg-secondary rounded-2xl shadow-xl overflow-hidden border border-border-subtle">
          {/* Header */}
          <div className={`p-8 text-white flex justify-between items-center bg-gradient-to-br ${badgeColor} relative overflow-hidden`}>
            {/* Soft glow in header */}
            <div className="absolute top-0 right-0 w-full h-full bg-white/5 backdrop-blur-3xl pointer-events-none mix-blend-overlay"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Diagnosis Details</h1>
              <p className="text-white/80 font-mono text-sm">Case #{caseRecord.caseId} | {new Date(caseRecord.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right relative z-10">
              <div className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-1">AI Urgency Level</div>
              <div className="text-xl font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 px-4 py-1.5 rounded-lg shadow-inner inline-block">
                {caseRecord.urgency}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            <section className="bg-bg-card p-6 rounded-xl border border-border-subtle">
              <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-neon-purple">📝</span> Structured Clinical Note
              </h2>
              <div className="bg-bg-primary p-5 rounded-lg border border-border-subtle font-mono text-sm whitespace-pre-wrap text-text-secondary leading-relaxed">
                {caseRecord.clinical_note || "No clinical note generated."}
              </div>
            </section>

             {/* RAG2 AI Diagnosis */}
             {caseRecord.rag_diagnosis && Array.isArray(caseRecord.rag_diagnosis) && caseRecord.rag_diagnosis.length > 0 && (
                <section className="bg-neon-cyan/5 p-6 rounded-xl border border-neon-cyan/20">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-neon-cyan">🤖</span> AI Diagnostic Suggestions
                    </h2>
                    <div className="space-y-4">
                    {caseRecord.rag_diagnosis.map((diag, i) => (
                        <div key={i} className="bg-bg-secondary p-5 rounded-lg border border-border-subtle">
                        <h3 className="text-lg font-bold text-text-primary mb-2">{i + 1}. {diag.disease}</h3>
                        <p className="text-text-secondary text-sm mb-4 leading-relaxed">{diag.reasoning}</p>
                        {diag.precautions && diag.precautions.length > 0 && (
                            <div className="bg-bg-primary p-4 rounded border border-border-subtle">
                            <h4 className="text-sm font-semibold text-text-primary mb-2">Recommended Precautions:</h4>
                            <ul className="list-disc list-inside text-sm text-text-muted space-y-1">
                                {diag.precautions.map((p, j) => (
                                <li key={j} className="capitalize">{p}</li>
                                ))}
                            </ul>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                </section>
             )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-bg-card p-6 rounded-xl border border-border-subtle">
                <h2 className="text-lg font-bold text-text-primary mb-3">Raw Patient Input</h2>
                <div className="bg-bg-primary p-4 rounded-lg border border-border-subtle text-text-muted italic text-sm">
                  "{caseRecord.input_record}"
                </div>
              </section>

              <section className="bg-bg-card p-6 rounded-xl border border-border-subtle">
                <h2 className="text-lg font-bold text-text-primary mb-3">Extracted Details</h2>
                {caseRecord.extracted_entities && typeof caseRecord.extracted_entities === 'object' && Object.keys(caseRecord.extracted_entities).length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {Object.entries(caseRecord.extracted_entities).map(([key, vals]) => (
                      <li key={key} className="bg-bg-primary p-3 rounded-lg border border-border-subtle flex flex-col gap-1">
                        <span className="font-semibold text-neon-purple uppercase text-xs tracking-wider">{key}</span>
                        <span className="text-text-secondary">{Array.isArray(vals) ? vals.join(", ") : vals}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-muted text-sm italic">No structured entities found.</p>
                )}
              </section>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
