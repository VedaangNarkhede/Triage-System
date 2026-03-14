import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function PastCasesPage() {
  await connectToDatabase();
  const patients = await Patient.find({}).sort({ created_at: -1 }).lean();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Past Cases</h1>
        <p className="text-text-muted text-sm">Historical patient case archive</p>
      </div>

      <div className="gradient-card rounded-2xl border border-border-subtle overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Case ID</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Patient</th>
                <th className="p-4 font-semibold">Symptoms</th>
                <th className="p-4 font-semibold">Urgency</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-text-muted">
                    No past cases found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const id = p._id.toString();
                  const symptoms = p.extracted_entities?.["Symptom/Disease"] || p.structured_data?.symptoms || [];
                  const date = p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  }) : "—";
                  
                  return (
                    <tr key={id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="p-4 text-text-muted text-xs font-mono">{id.slice(-6).toUpperCase()}</td>
                      <td className="p-4 text-text-secondary text-xs">{date}</td>
                      <td className="p-4 text-text-primary font-medium text-sm">{p.name}</td>
                      <td className="p-4 text-text-secondary text-sm max-w-[200px] truncate">
                        {Array.isArray(symptoms) ? symptoms.slice(0, 3).join(", ") : "—"}
                      </td>
                      <td className="p-4"><StatusBadge level={p.urgency} /></td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/case/${id}`} className="text-neon-cyan text-xs hover:underline">Open Case</Link>
                          <Link href={`/case/${id}/diagnosis`} className="text-neon-purple text-xs hover:underline">Diagnosis</Link>
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

      <div className="flex gap-3">
        <Link href="/dashboard" className="border border-border-subtle text-text-muted font-medium py-2.5 px-5 rounded-xl text-sm hover:text-text-secondary transition-all">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
