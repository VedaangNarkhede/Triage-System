import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Patient from "@/models/Patient";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DoctorCaseDetail({ params }) {
  await connectToDatabase();
  const { caseId } = await params;
  
  let caseRecord;
  let patientRecord;
  try {
    caseRecord = await Case.findById(caseId).lean();
    if (caseRecord) {
        patientRecord = await Patient.findOne({ patientId: caseRecord.patientId }).lean();
    }
  } catch (e) {
    return notFound();
  }

  if (!caseRecord) return notFound();

  const isHighUrgency = caseRecord.urgency?.toLowerCase() === "high";
  const isMedUrgency = caseRecord.urgency?.toLowerCase() === "medium" || caseRecord.urgency?.toLowerCase() === "moderate";
  const badgeColor = isHighUrgency ? "from-red-600 to-red-900 border-red-500" : isMedUrgency ? "from-yellow-600 to-yellow-900 border-yellow-500" : "from-green-600 to-green-900 border-green-500";

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/doctor/dashboard" className="text-neon-cyan hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="bg-bg-secondary rounded-2xl shadow-xl overflow-hidden border border-border-subtle">
          {/* Header */}
          <div className={`p-8 text-white flex justify-between items-center bg-gradient-to-br ${badgeColor} relative overflow-hidden`}>
            {/* Soft glow in header */}
            <div className="absolute top-0 right-0 w-full h-full bg-white/5 backdrop-blur-3xl pointer-events-none mix-blend-overlay"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Case #{caseRecord.caseId}</h1>
              {patientRecord ? (
                <p className="text-white/80 font-mono text-sm">
                   Patient: {patientRecord.name} | ID: {patientRecord.patientId} | Age: {patientRecord.age || "N/A"}
                </p>
              ) : (
                <p className="text-white/80 font-mono text-sm text-red-200">Patient Data Unavailable (ID: {caseRecord.patientId})</p>
              )}
            </div>
            <div className="text-right flex flex-col items-end relative z-10">
              <div className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-1">Triage Urgency</div>
              <div className="text-2xl font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 px-5 py-2 rounded-lg shadow-inner inline-block">
                {caseRecord.urgency}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            <section className="bg-bg-card p-6 rounded-xl border border-border-subtle">
              <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-neon-cyan">📝</span> Structured Clinical Note
              </h2>
              <div className="bg-bg-primary p-5 rounded-lg border border-border-subtle font-mono text-sm whitespace-pre-wrap text-text-secondary leading-relaxed">
                {caseRecord.clinical_note || "No clinical note generated. System may still be processing."}
              </div>
            </section>

             {/* RAG2 AI Diagnosis Area */}
             {caseRecord.rag_diagnosis && Array.isArray(caseRecord.rag_diagnosis) && caseRecord.rag_diagnosis.length > 0 ? (
                <section className="bg-neon-cyan/5 p-6 rounded-xl border border-neon-cyan/20">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-neon-cyan">🤖</span> AI Differential Diagnoses
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
             ) : (
                <section className="bg-bg-card p-6 rounded-xl border border-border-subtle opacity-60">
                    <p className="text-sm text-text-muted italic">No specific RAG diagnostics generated for this case.</p>
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
                <h2 className="text-lg font-bold text-text-primary mb-3">NLP Details</h2>
                {caseRecord.extracted_entities && typeof caseRecord.extracted_entities === 'object' && Object.keys(caseRecord.extracted_entities).length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {Object.entries(caseRecord.extracted_entities).map(([key, vals]) => (
                      <li key={key} className="bg-bg-primary p-3 rounded-lg border border-border-subtle flex flex-col gap-1">
                        <span className="font-semibold text-neon-cyan uppercase text-xs tracking-wider">{key}</span>
                        <span className="text-text-secondary">{Array.isArray(vals) ? vals.join(", ") : vals}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-muted text-sm italic">No structured entities found.</p>
                )}
              </section>
            </div>

            <section className="bg-bg-card p-6 rounded-xl border border-border-subtle">
                <h2 className="text-lg font-bold text-text-primary mb-3">Temporal/Duration Data</h2>
                <div className="bg-bg-primary p-4 rounded-lg border border-border-subtle text-sm text-text-secondary">
                  Patient specified Duration: <span className="font-semibold text-white">{caseRecord.duration || "N/A"}</span>
                  <br className="my-2" />
                  Algorithm Temporal Info: <span className="font-mono text-xs">{JSON.stringify(caseRecord.temporal_info || {})}</span>
                </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
