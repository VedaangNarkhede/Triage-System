import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ClinicalSummary({ params }) {
  await connectToDatabase();
  const { caseId } = await params;

  let patient;
  try {
    patient = await Patient.findById(caseId).lean();
  } catch (e) {
    return notFound();
  }
  if (!patient) return notFound();

  const symptoms = patient.extracted_entities?.["Symptom/Disease"] || 
                   patient.structured_data?.symptoms || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Back */}
      <Link href="/dashboard" className="text-text-muted hover:text-neon-cyan text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">{patient.name}</h1>
          <div className="flex items-center gap-4 text-text-muted text-sm">
            {patient.age && <span>Age: {patient.age}</span>}
            {patient.gender && <span>Gender: {patient.gender}</span>}
            <span>Input: {patient.input_type || "text"}</span>
          </div>
        </div>
        <StatusBadge level={patient.urgency} size="lg" />
      </div>

      {/* Clinical Note */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-6 mb-6">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-neon-cyan">📝</span> Clinical Summary
        </h2>
        <div className="bg-bg-primary rounded-xl p-5 border border-border-subtle text-text-secondary text-sm leading-relaxed whitespace-pre-wrap font-mono">
          {patient.clinical_note || "No clinical note generated."}
        </div>
      </div>

      {/* Extracted Symptoms */}
      {Array.isArray(symptoms) && symptoms.length > 0 && (
        <div className="gradient-card rounded-2xl border border-border-subtle p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-neon-purple">🏷️</span> Extracted Symptoms
          </h2>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/30 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {patient.temporal_info && Object.keys(patient.temporal_info).length > 0 && (
        <div className="gradient-card rounded-2xl border border-border-subtle p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-neon-yellow">⏱️</span> Timeline of Events
          </h2>
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle text-text-secondary text-sm font-mono">
            {JSON.stringify(patient.temporal_info, null, 2)}
          </div>
        </div>
      )}

      {/* Risk Indicators */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-6 mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-neon-red">⚠️</span> Risk Indicators
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle text-center">
            <p className="text-text-muted text-xs mb-1">Urgency</p>
            <StatusBadge level={patient.urgency} />
          </div>
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle text-center">
            <p className="text-text-muted text-xs mb-1">Status</p>
            <span className="text-neon-cyan text-sm font-medium capitalize">{patient.status || "analyzed"}</span>
          </div>
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle text-center">
            <p className="text-text-muted text-xs mb-1">Symptoms</p>
            <span className="text-text-primary text-sm font-medium">{symptoms.length}</span>
          </div>
          <div className="bg-bg-primary rounded-xl p-4 border border-border-subtle text-center">
            <p className="text-text-muted text-xs mb-1">Diagnosed</p>
            <span className="text-text-primary text-sm font-medium">{patient.rag_diagnosis?.length > 0 ? "Yes" : "Pending"}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/case/${patient._id}/diagnosis`}
          className="gradient-btn-cyan text-bg-primary font-bold py-2.5 px-5 rounded-xl text-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all">
          View Differential Diagnosis
        </Link>
        <Link href={`/case/${patient._id}/evidence`}
          className="border border-neon-purple/40 text-neon-purple font-medium py-2.5 px-5 rounded-xl text-sm hover:bg-neon-purple/10 transition-all">
          View Medical Evidence
        </Link>
        <Link href={`/case/${patient._id}/emergency`}
          className="border border-neon-red/40 text-neon-red font-medium py-2.5 px-5 rounded-xl text-sm hover:bg-neon-red/10 transition-all">
          Check Emergency Level
        </Link>
        <Link href="/dashboard"
          className="border border-border-subtle text-text-muted font-medium py-2.5 px-5 rounded-xl text-sm hover:text-text-secondary hover:border-text-muted/50 transition-all">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
