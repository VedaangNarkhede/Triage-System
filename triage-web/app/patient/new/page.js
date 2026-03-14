"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", age: "", contact: "", symptoms: "" });
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
      submitData.append("name", formData.name);
      submitData.append("age", formData.age);
      submitData.append("contact", formData.contact);
      submitData.append("symptoms", formData.symptoms);
      if (file) {
        submitData.append("file", file);
      }

      const res = await fetch("/api/triage", {
        method: "POST",
        body: submitData,
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
              required={!file}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded focus:ring-brand-primary focus:border-brand-primary outline-none"
              placeholder="E.g., I have been having severe chest pain since yesterday..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Or Upload Clinical File (Image, PDF, Audio)</label>
            <input
              type="file"
              accept="image/*,audio/*,application/pdf"
              className="w-full p-2 border border-dashed border-gray-400 rounded bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setFile(e.target.files[0])}
            />
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
