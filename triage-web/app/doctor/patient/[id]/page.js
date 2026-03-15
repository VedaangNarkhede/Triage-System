import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Link from "next/link";
import { notFound } from "next/navigation";
import DiagnoseButton from "./DiagnoseButton";

export default async function PatientDetail({ params }) {
  await connectToDatabase();
  const { id } = await params;
  
  let patient;
  try {
    patient = await Case.findById(id).lean();
  } catch (e) {
    return notFound();
  }

  if (!patient) return notFound();

  const isHighUrgency = patient.urgency?.toLowerCase() === "high" || patient.clinical_note?.includes("Urgency Level: High");
  const isMedUrgency = patient.urgency?.toLowerCase() === "medium" || patient.clinical_note?.includes("Urgency Level: Medium");
  const badgeColor = isHighUrgency ? "bg-red-500" : isMedUrgency ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/doctor/dashboard" className="text-brand-secondary hover:underline flex items-center gap-2">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-center ${badgeColor}`}>
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="opacity-90 mt-1">Age: {patient.age || "N/A"} | Contact: {patient.contact || "N/A"}</p>
          </div>
          <div className="text-right">
            <div className="text-sm uppercase tracking-wider font-semibold opacity-90">Urgency</div>
            <div className="text-2xl font-bold bg-white text-gray-900 px-4 py-1 rounded inline-block mt-1">
              {patient.urgency}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3 border-b pb-2">Structured Clinical Note</h2>
            <div className="bg-gray-50 p-6 rounded border font-mono text-sm whitespace-pre-wrap text-gray-800">
              {patient.clinical_note}
            </div>
          </section>

          {/* RAG2 AI Diagnosis */}
          {patient.rag_diagnosis && Array.isArray(patient.rag_diagnosis) && patient.rag_diagnosis.length > 0 ? (
            <section className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
              <h2 className="text-xl font-bold text-brand-dark mb-4 border-b border-blue-200 pb-2 flex items-center gap-2">
                <span className="text-blue-600">🤖</span> AI Diagnostic Suggestions
              </h2>
              <div className="space-y-6">
                {patient.rag_diagnosis.map((diag, i) => (
                  <div key={i} className="bg-white p-5 rounded border shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{i + 1}. {diag.disease}</h3>
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">{diag.reasoning}</p>
                    {diag.precautions && diag.precautions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Recommended Precautions:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
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
            <DiagnoseButton patientId={patient._id.toString()} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-xl font-bold text-brand-dark mb-3 border-b pb-2">Raw Patient Input</h2>
              <div className="bg-blue-50 p-4 rounded border border-blue-100 text-gray-700 italic">
                "{patient.input_record}"
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-dark mb-3 border-b pb-2">Extracted Details</h2>
              {patient.extracted_entities && typeof patient.extracted_entities === 'object' && Object.keys(patient.extracted_entities).length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {Object.entries(patient.extracted_entities).map(([key, vals]) => (
                    <li key={key} className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold capitalize text-brand-secondary">{key}: </span>
                      {Array.isArray(vals) ? vals.join(", ") : vals}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No structured entities found or pipeline failed.</p>
              )}
            </section>
          </div>

          <section>
             <h2 className="text-xl font-bold text-brand-dark mb-3 border-b pb-2">Temporal Info</h2>
             <div className="bg-gray-50 p-4 rounded text-sm text-gray-700">
                {JSON.stringify(patient.temporal_info || {})}
             </div>
          </section>

        </div>
      </div>
    </div>
  );
}