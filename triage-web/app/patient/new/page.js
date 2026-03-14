"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", age: "", contact: "", symptoms: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to process triage submission");

      const data = await res.json();
      router.push(`/doctor/patient/${data.patientId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-brand-primary">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">Patient Intake Form</h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded focus:ring-brand-primary focus:border-brand-primary outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-300 rounded focus:ring-brand-primary focus:border-brand-primary outline-none"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded focus:ring-brand-primary focus:border-brand-primary outline-none"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Describe Symptoms / History</label>
            <textarea
              required
              rows={6}
              className="w-full p-3 border border-gray-300 rounded focus:ring-brand-primary focus:border-brand-primary outline-none"
              placeholder="E.g., I have been having severe chest pain since yesterday..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded hover:bg-brand-secondary transition disabled:opacity-50"
          >
            {loading ? "Processing via AI Triage..." : "Submit Patient Case"}
          </button>
        </form>
      </div>
    </div>
  );
}
