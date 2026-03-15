import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PatientDashboard({ params }) {
  const unwrappedParams = await params;
  const { patientId } = unwrappedParams;

  await connectToDatabase();
  
  const patient = await Patient.findOne({ patientId: parseInt(patientId) }).lean();
  
  if (!patient) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Patient <span className="text-neon-cyan">Portal</span></h1>
        <p className="text-text-muted text-sm">Welcome back, {patient.name}</p>
      </div>

      <div className="gradient-card rounded-2xl border border-border-subtle p-8 mb-8 shadow-lg">
        <h2 className="text-xl font-bold text-text-primary mb-6 border-b border-border-subtle pb-4">Demographics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Patient ID</span>
            <span className="font-mono text-text-primary text-lg">{patient.patientId}</span>
          </div>
          <div>
            <span className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Name</span>
            <span className="text-text-primary font-medium text-lg">{patient.name}</span>
          </div>
          <div>
            <span className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Age</span>
            <span className="text-text-primary text-lg">{patient.age || "N/A"}</span>
          </div>
          <div>
            <span className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Gender</span>
            <span className="text-text-primary text-lg">{patient.gender || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submit Case Card */}
        <div className="bg-bg-secondary rounded-2xl border border-border-subtle p-8 hover:border-neon-cyan/50 transition-all group flex flex-col justify-between">
          <div>
            <div className="text-3xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Submit New Case</h3>
            <p className="text-text-muted text-sm mb-6">Upload clinical data, describe symptoms, or attach medical files for AI triage analysis.</p>
          </div>
          <Link href={`/patient/${patientId}/submit-case`}
            className="w-full text-center gradient-btn-cyan text-bg-primary font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all uppercase tracking-wider text-sm">
            Submit Case
          </Link>
        </div>

        {/* View Past Diagnoses Card */}
        <div className="bg-bg-secondary rounded-2xl border border-border-subtle p-8 hover:border-neon-purple/50 transition-all group flex flex-col justify-between">
          <div>
            <div className="text-3xl mb-4">🩺</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Diagnosis History</h3>
            <p className="text-text-muted text-sm mb-6">Review your past diagnoses, AI clinical summaries, and case details securely.</p>
          </div>
          <Link href={`/patient/${patientId}/past-diagnosis`}
            className="w-full text-center border-2 border-neon-purple text-neon-purple font-bold py-3 rounded-xl hover:bg-neon-purple/10 transition-all uppercase tracking-wider text-sm">
            View Past Diagnoses
          </Link>
        </div>
      </div>
    </div>
  );
}
