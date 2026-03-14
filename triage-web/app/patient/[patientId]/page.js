import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PatientPortal({ params }) {
  await connectToDatabase();
  const { patientId } = await params;

  const patient = await Patient.findOne({ patientId: parseInt(patientId) }).lean();
  
  if (!patient) return notFound();

  return (
    <div className="min-h-screen bg-bg-primary py-16 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
            <Link href="/" className="text-text-muted hover:text-neon-purple transition-colors text-sm font-medium flex items-center gap-2">
            &larr; Log Out
            </Link>
        </div>

        {/* Patient Info Header */}
        <div className="gradient-card border border-border-subtle rounded-2xl p-8 mb-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between z-10 relative gap-6">
            <div>
              <p className="text-neon-purple text-sm font-bold tracking-widest uppercase mb-1">Patient Profile</p>
              <h1 className="text-4xl font-bold text-text-primary mb-4">{patient.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded border border-border-subtle">
                  <span className="text-text-muted">ID:</span> <span className="font-mono font-bold text-white">{patient.patientId}</span>
                </span>
                <span className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded border border-border-subtle">
                  <span className="text-text-muted">Age:</span> <span className="text-white">{patient.age || "N/A"}</span>
                </span>
                <span className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded border border-border-subtle">
                  <span className="text-text-muted">Gender:</span> <span className="text-white">{patient.gender || "Not specified"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href={`/patient/${patient.patientId}/submit-case`} className="group">
            <div className="h-full bg-bg-secondary border border-border-subtle hover:border-neon-cyan/50 p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-neon-cyan transition-colors">Submit New Case</h3>
              <p className="text-text-muted text-sm">Upload symptoms, voice recordings, or medical documents for AI-powered triage.</p>
            </div>
          </Link>

          <Link href={`/patient/${patient.patientId}/past-diagnosis`} className="group">
            <div className="h-full bg-bg-secondary border border-border-subtle hover:border-neon-purple/50 p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-neon-purple/10 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                🕰️
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-neon-purple transition-colors">View Past Diagnoses</h3>
              <p className="text-text-muted text-sm">Access your secure history of previously submitted cases, doctor reviews, and urgency reports.</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
