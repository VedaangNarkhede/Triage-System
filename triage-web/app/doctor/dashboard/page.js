import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await connectToDatabase();
  const patients = await Patient.find({}).sort({ created_at: -1 }).lean();

  const urgencyWeight = { Critical: 4, High: 3, Medium: 2, Low: 1, Unknown: 0 };
  const sorted = [...patients].sort((a, b) => (urgencyWeight[b.urgency] ?? 0) - (urgencyWeight[a.urgency] ?? 0));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Doctor Dashboard</h1>
          <p className="text-text-muted text-sm">Manage and review patient cases</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-sm">{sorted.length} cases</span>
          <Link href="/submit-case"
            className="gradient-btn-cyan text-bg-primary font-bold py-2 px-5 rounded-xl text-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all">
            + Analyze New Case
          </Link>
        </div>
      </div>

      <div className="gradient-card rounded-2xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Case ID</th>
                <th className="p-4 font-semibold">Patient</th>
                <th className="p-4 font-semibold">Age</th>
                <th className="p-4 font-semibold">Symptoms</th>
                <th className="p-4 font-semibold">Urgency</th>
                <th className="p-4 font-semibold">Diagnosis</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-text-muted">
                    No cases found. <Link href="/submit-case" className="text-neon-cyan hover:underline">Submit a new case</Link>
                  </td>
                </tr>
              ) : (
                sorted.map((p) => {
                  const id = p._id.toString();
                  const symptoms = p.extracted_entities?.["Symptom/Disease"] || p.structured_data?.symptoms || [];
                  const topDiag = p.rag_diagnosis?.[0]?.disease || "—";
                  
                  return (
                    <tr key={id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="p-4 text-text-muted text-xs font-mono">{id.slice(-6).toUpperCase()}</td>
                      <td className="p-4 text-text-primary font-medium text-sm">{p.name}</td>
                      <td className="p-4 text-text-secondary text-sm">{p.age || "—"}</td>
                      <td className="p-4 text-text-secondary text-sm max-w-[200px] truncate">
                        {Array.isArray(symptoms) ? symptoms.slice(0, 3).join(", ") : "—"}
                      </td>
                      <td className="p-4"><StatusBadge level={p.urgency} /></td>
                      <td className="p-4 text-text-secondary text-sm max-w-[150px] truncate">{topDiag}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium capitalize ${
                          p.status === "diagnosed" ? "text-neon-green" 
                          : p.status === "analyzed" ? "text-neon-cyan" 
                          : "text-neon-yellow"
                        }`}>{p.status || "analyzed"}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/case/${id}`} className="text-neon-cyan text-xs hover:underline">Summary</Link>
                          <Link href={`/case/${id}/diagnosis`} className="text-neon-purple text-xs hover:underline">Diagnosis</Link>
                          <Link href={`/case/${id}/evidence`} className="text-text-muted text-xs hover:underline">Evidence</Link>
                          <Link href={`/case/${id}/emergency`} className="text-neon-red text-xs hover:underline">Emergency</Link>
                        </div>
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
  );
}
