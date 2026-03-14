import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DoctorDashboard() {
  await connectToDatabase();
  
  // Fetch all cases across all patients
  const cases = await Case.find({}).sort({ created_at: -1 }).lean();

  // Sort them loosely by urgency (High > Medium > Low > Unknown)
  const urgencyWeight = { "High": 3, "Medium": 2, "Low": 1, "Unknown": 0 };
  
  const sortedCases = [...cases].sort((a, b) => {
    const wA = urgencyWeight[a.urgency] ?? 0;
    const wB = urgencyWeight[b.urgency] ?? 0;
    return wB - wA; // descending
  });

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-end mb-10 border-b border-border-subtle pb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
              Clinical <span className="text-neon-cyan glow-text-cyan">Triage Dashboard</span>
            </h1>
            <p className="text-text-muted text-sm">Review incoming patient cases prioritized by AI-determined urgency.</p>
          </div>
          <div className="bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan py-2 px-6 rounded-lg shadow font-medium tracking-widest text-sm uppercase">
            {sortedCases.length} Active Cases
          </div>
        </div>

        <div className="gradient-card rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden border border-border-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-secondary/80 border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Priority</th>
                  <th className="p-4 font-semibold">IDs & Date</th>
                  <th className="p-4 font-semibold">Incoming Symptoms</th>
                  <th className="p-4 font-semibold">AI Extracted Diagnosis</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sortedCases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-text-muted italic bg-bg-primary">
                      No patient records found in the system.
                    </td>
                  </tr>
                ) : (
                  sortedCases.map((c) => {
                    const isHigh = c.urgency === "High";
                    const isMed = c.urgency === "Medium" || c.urgency === "Moderate";
                    const badgeColor = isHigh ? "bg-red-500/10 text-red-400 border border-red-500/30" 
                                     : isMed ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" 
                                     : "bg-green-500/10 text-green-400 border border-green-500/30";

                    // Determine short diagnosis
                    let mainDiagnosis = "Pending review";
                    if (c.rag_diagnosis && c.rag_diagnosis.length > 0) {
                        mainDiagnosis = c.rag_diagnosis[0].disease;
                    } else if (c.extracted_entities && c.extracted_entities["Symptom/Disease"]) {
                        const sd = c.extracted_entities["Symptom/Disease"];
                        mainDiagnosis = Array.isArray(sd) ? sd.slice(0, 2).join(", ") : sd;
                    }

                    const dateStr = new Date(c.created_at).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });

                    return (
                      <tr key={c._id.toString()} className="hover:bg-bg-card transition duration-150 group">
                        <td className="p-4 align-top">
                          <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest block w-max ${badgeColor}`}>
                            {c.urgency}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-text-secondary align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white"><span className="text-text-muted">PT:</span> #{c.patientId}</span>
                            <span><span className="text-text-muted">CS:</span> <span className="text-neon-cyan">#{c.caseId}</span></span>
                            <span className="text-[10px] text-text-muted mt-1">{dateStr}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-text-primary align-top max-w-[250px]">
                           <div className="line-clamp-2 leading-relaxed">
                            {c.input_record}
                           </div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary align-top max-w-[200px]">
                          <div className="truncate">
                            {mainDiagnosis}
                          </div>
                        </td>
                        <td className="p-4 text-right align-top">
                          <div className="flex flex-col items-end gap-2">
                             <Link 
                                href={`/doctor/case/${c._id.toString()}`}
                                className="text-neon-cyan hover:text-white font-medium text-sm hover:underline flex items-center gap-1"
                             >
                                 View Case
                             </Link>
                             <Link 
                                href={`/doctor/case/${c._id.toString()}`}
                                className="text-neon-purple hover:text-white font-medium text-sm hover:underline flex items-center gap-1"
                             >
                                 View Diagnosis
                             </Link>
                          </div>
                        </td>
                      </tr>
                    )
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
