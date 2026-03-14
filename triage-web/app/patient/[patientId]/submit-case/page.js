"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function SubmitCase() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId;

  const [formData, setFormData] = useState({ symptoms: "", duration: "", additional_notes: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.symptoms && !file) {
      setError("Please provide either symptom description or upload a clinical file.");
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("patientId", patientId);
      submitData.append("symptoms", formData.symptoms);
      submitData.append("duration", formData.duration);
      submitData.append("additional_notes", formData.additional_notes);
      
      if (file) {
        submitData.append("file", file);
      }

      const res = await fetch("/api/case", {
        method: "POST",
        body: submitData,
      });

      if (!res.ok) throw new Error("Failed to submit and process case");

      // Redirect to past diagnosis page to view history
      router.push(`/patient/${patientId}/past-diagnosis`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-6">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
           <Link href={`/patient/${patientId}`} className="text-neon-cyan hover:underline text-sm font-medium flex items-center gap-2">
            &larr; Back to Portal
           </Link>
        </div>

        <div className="gradient-card p-8 rounded-2xl shadow-xl border border-border-subtle relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
               <div className="w-16 h-16 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin mb-4"></div>
               <p className="text-neon-cyan font-bold animate-pulse">Analyzing Case via AI Pipeline...</p>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6 text-text-primary border-b border-border-subtle pb-4">Submit New Medical Case</h2>
          
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-6 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Symptoms Description</label>
              <textarea
                required={!file}
                rows={4}
                className="w-full p-4 bg-bg-secondary border border-border-subtle rounded-xl text-text-primary focus:ring-1 focus:ring-neon-cyan outline-none transition-all placeholder:text-text-muted"
                placeholder="E.g., I have been having severe chest pain since yesterday..."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Duration of symptoms</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-xl text-text-primary focus:ring-1 focus:ring-neon-cyan outline-none transition-all placeholder:text-text-muted text-sm"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="E.g. 3 days, 2 weeks..."
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Upload Clinical File (Audio/Image/PDF)</label>
                  <input
                    type="file"
                    accept="image/*,audio/*,application/pdf"
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-neon-cyan/10 file:text-neon-cyan hover:file:bg-neon-cyan/20 transition-all bg-bg-secondary border border-border-subtle rounded-xl cursor-pointer py-1 px-1"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Additional Notes (Optional)</label>
              <textarea
                rows={2}
                className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-xl text-text-primary focus:ring-1 focus:ring-neon-cyan outline-none transition-all placeholder:text-text-muted text-sm"
                placeholder="Any known conditions or allergies?"
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn-cyan text-bg-primary font-bold py-3 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all uppercase tracking-wide text-sm mt-4 disabled:opacity-50"
            >
              Submit Case for AI Extraction
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
