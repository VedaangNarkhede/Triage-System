import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Link from "next/link";

// Force dynamic rendering since we are fetching live db
export const dynamic = "force-dynamic";

export default async function DoctorDashboard() {
  await connectToDatabase();
  
  // Fetch all patients and sort by creation date (newest first)
  const patients = await Patient.find({}).sort({ created_at: -1 }).lean();

  // Sort them loosely by urgency (High > Medium > Low > Unknown)
  const urgencyWeight = { "High": 3, "Medium": 2, "Low": 1, "Unknown": 0 };
  
  const sortedPatients = [...patients].sort((a, b) => {
    const wA = urgencyWeight[a.urgency] ?? 0;
    const wB = urgencyWeight[b.urgency] ?? 0;
    return wB - wA; // descending
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-brand-dark">Clinical Triage Dashboard</h1>
        <div className="bg-brand-primary text-white py-2 px-6 rounded shadow font-medium">
          {sortedPatients.length} Active Cases
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-dark text-white text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold">Patient Name</th>
                <th className="p-4 font-semibold">Age/Contact</th>
                <th className="p-4 font-semibold">Key Symptoms / Presenting Issue</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 italic">
                    No patient records found. Patients added via the intake form will appear here.
                  </td>
                </tr>
              ) : (
                sortedPatients.map((p) => {
                  const isHigh = p.urgency === "High";
                  const isMed = p.urgency === "Medium";
                  const badgeColor = isHigh ? "bg-red-100 text-red-800 border-red-300" 
                                   : isMed ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                                   : "bg-green-100 text-green-800 border-green-300";

                  // Extract just symptoms if possible
                  const symptomList = p.extracted_entities?.["Symptom/Disease"] || [];
                  const displaySymptoms = Array.isArray(symptomList) ? symptomList.slice(0, 3).join(", ") : "View details";

                  return (
                    <tr key={p._id.toString()} className="hover:bg-brand-light transition duration-150">
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${badgeColor}`}>
                          {p.urgency}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-900">{p.name}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {p.age ? `${p.age} yrs` : "N/A"} <br/>
                        <span className="text-xs text-gray-400">{p.contact}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-700 truncate max-w-xs">
                        {displaySymptoms || p.input_record.substring(0, 60) + "..."}
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/doctor/patient/${p._id.toString()}`}
                          className="text-brand-primary hover:text-brand-secondary font-medium hover:underline flex items-center justify-end gap-1"
                        >
                          Review Case &rarr;
                        </Link>
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
  );
}
