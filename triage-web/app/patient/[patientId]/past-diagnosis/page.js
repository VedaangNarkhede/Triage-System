import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PastDiagnosis({ params }) {
  await connectToDatabase();
  const { patientId } = await params;
  
  // Need parseInt since we used Number for patientId
  const intPatientId = parseInt(patientId);
  const cases = await Case.find({ patientId: intPatientId }).sort({ created_at: -1 }).lean();

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
           <Link href={`/patient/${patientId}`} className="text-neon-purple hover:underline text-sm font-medium flex items-center gap-2">
            &larr; Back to Portal
           </Link>
        </div>

        <div className="flex justify-between items-end mb-8 border-b border-border-subtle pb-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Medical History</h1>
            <p className="text-text-muted mt-2 text-sm">Review your historically submitted cases and automated clinical insights.</p>
          </div>
          <div className="text-neon-purple font-bold tracking-widest text-sm bg-neon-purple/10 px-4 py-2 rounded-lg border border-neon-purple/20">
             {cases.length} CASES
          </div>
        </div>

        <div className="gradient-card rounded-xl border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-secondary/50 border-b border-border-subtle text-text-secondary text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Case ID & Date</th>
                  <th className="p-4 font-semibold">Symptoms/Input</th>
                  <th className="p-4 font-semibold">Extracted Diagnosis</th>
                  <th className="p-4 font-semibold">AI Urgency</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-text-muted italic bg-bg-secondary/20">
                      No case history found. Submit a new case to view diagnoses.
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => {
                    const dateStr = new Date(c.created_at).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
                    
                    const isHigh = c.urgency === "High";
                    const isMed = c.urgency === "Medium";
                    const badgeClass = isHigh ? "bg-red-500/10 text-red-400 border border-red-500/30" 
                                    : isMed ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" 
                                    : "bg-green-500/10 text-green-400 border border-green-500/30";

                    // Try to grasp diagnosis disease specifically if available
                    let mainDiagnosis = "Pending review";
                    if (c.rag_diagnosis && c.rag_diagnosis.length > 0) {
                        mainDiagnosis = c.rag_diagnosis[0].disease;
                    } else if (c.extracted_entities && c.extracted_entities["Symptom/Disease"]) {
                        const sd = c.extracted_entities["Symptom/Disease"];
                        mainDiagnosis = Array.isArray(sd) ? sd.slice(0, 2).join(", ") : sd;
                    }

                    return (
                      <tr key={c._id.toString()} className="hover:bg-bg-card-hover transition-colors">
                        <td className="p-4">
                           <div className="font-mono text-neon-purple font-bold text-sm">#{c.caseId}</div>
                           <div className="text-xs text-text-muted mt-1">{dateStr}</div>
                        </td>
                        <td className="p-4 text-sm text-text-primary max-w-[200px] truncate">
                           {c.input_record}
                        </td>
                        <td className="p-4 text-sm text-text-secondary max-w-[200px] truncate">
                           {mainDiagnosis}
                        </td>
                        <td className="p-4">
                           <span className={`px-3 py-1 rounded text-xs font-semibold tracking-wide uppercase ${badgeClass}`}>
                             {c.urgency}
                           </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link 
                            href={`/patient/${patientId}/case/${c._id.toString()}`}
                            className="text-neon-cyan hover:text-white transition-colors text-sm font-medium underline underline-offset-4"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
