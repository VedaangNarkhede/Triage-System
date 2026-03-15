"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiagnoseButton({ patientId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDiagnose = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Diagnosis failed");
      }

      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="gradient-card rounded-2xl border border-neon-cyan/20 p-10 text-center mb-8">
      <div className="text-4xl mb-4">🤖</div>
      <h2 className="text-xl font-bold text-text-primary mb-2">AI Diagnostic Suggestions</h2>
      <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
        Run the advanced RAG reasoning model to generate potential diagnoses based on the extracted clinical data.
      </p>
      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-neon-red/10 border border-neon-red/30 text-neon-red text-sm inline-block">
          {error}
        </div>
      )}
      <div>
        <button
          onClick={handleDiagnose}
          disabled={loading}
          className="gradient-btn-cyan text-bg-primary font-bold py-3 px-8 rounded-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300 text-sm uppercase tracking-wider disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Run AI Diagnosis"}
        </button>
      </div>
    </div>
  );
}
