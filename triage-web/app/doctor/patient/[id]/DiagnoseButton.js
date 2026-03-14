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

      if (!res.ok) throw new Error("Failed to generate AI diagnosis.");

      // Refresh the page to show the new diagnosis data pulled by the server component
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <section className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
      <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
        <span className="text-blue-600">🤖</span> AI Diagnostic Suggestions
      </h2>
      <p className="text-gray-600 text-sm max-w-md">
        Run our advanced reasoning model to generate potential diagnoses based on the extracted clinical note and symptoms.
      </p>
      {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded">{error}</div>}
      <button
        onClick={handleDiagnose}
        disabled={loading}
        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Run AI Diagnosis"}
      </button>
    </section>
  );
}
