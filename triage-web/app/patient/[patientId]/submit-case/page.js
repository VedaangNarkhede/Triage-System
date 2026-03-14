"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT_TABS = [
  { key: "text", label: "Text", icon: "📝" },
  { key: "audio", label: "Audio", icon: "🎙️" },
  { key: "image", label: "Image", icon: "🖼️" },
  { key: "pdf", label: "PDF", icon: "📄" },
];

export default function SubmitCasePage() {
  const router = useRouter();
  const [inputType, setInputType] = useState("text");
  const [symptoms, setSymptoms] = useState("");
  const [file, setFile] = useState(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [knownConditions, setKnownConditions] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (inputType === "text" && !symptoms.trim()) {
      setError("Please describe the patient's symptoms.");
      setLoading(false);
      return;
    }
    if (inputType !== "text" && (!file || file.size === 0)) {
      setError("Please upload a file.");
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", `Patient-${Date.now().toString(36).toUpperCase()}`);
      fd.append("age", age);
      fd.append("gender", gender);
      fd.append("contact", "");
      fd.append("known_conditions", knownConditions);
      fd.append("additional_notes", additionalNotes);
      fd.append("input_type", inputType);
      if (symptoms) fd.append("symptoms", symptoms);
      if (file) fd.append("file", file);

      const res = await fetch("/api/triage", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      const data = await res.json();
      router.push(`/processing?caseId=${data.patientId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fileAccept = {
    audio: "audio/*",
    image: "image/*",
    pdf: "application/pdf",
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Submit Patient Case</h1>
        <p className="text-text-muted text-sm">Upload clinical data for AI-powered triage analysis</p>
      </div>

      <div className="gradient-card rounded-2xl border border-border-subtle p-8">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-neon-red/10 border border-neon-red/30 text-neon-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Type Tabs */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">Input Type</label>
            <div className="flex gap-2">
              {INPUT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => { setInputType(tab.key); setFile(null); }}
                  className={`
                    flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200
                    ${inputType === tab.key
                      ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                      : "border-border-subtle bg-bg-card text-text-muted hover:text-text-secondary hover:border-text-muted/30"}
                  `}
                >
                  <span className="mr-1">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Input */}
          {inputType === "text" ? (
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Symptoms / Clinical History</label>
              <textarea
                rows={5}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe the patient's symptoms, medical history, and presenting complaints..."
                className="w-full bg-bg-primary border border-border-subtle rounded-xl p-4 text-text-primary text-sm placeholder-text-muted/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all resize-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Upload {inputType.charAt(0).toUpperCase() + inputType.slice(1)} File</label>
              <div className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-neon-cyan/30 transition-colors">
                <input
                  type="file"
                  accept={fileAccept[inputType]}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-3xl mb-2">{INPUT_TABS.find(t => t.key === inputType)?.icon}</div>
                  <p className="text-text-secondary text-sm">{file ? file.name : "Click to select file"}</p>
                  <p className="text-text-muted text-xs mt-1">Supports {inputType} files</p>
                </label>
              </div>
            </div>
          )}

          {/* Patient Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 45"
                className="w-full bg-bg-primary border border-border-subtle rounded-xl p-3 text-text-primary text-sm placeholder-text-muted/50 focus:outline-none focus:border-neon-cyan/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-bg-primary border border-border-subtle rounded-xl p-3 text-text-primary text-sm focus:outline-none focus:border-neon-cyan/50 transition-all"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Known Conditions</label>
            <input
              type="text"
              value={knownConditions}
              onChange={(e) => setKnownConditions(e.target.value)}
              placeholder="e.g. Diabetes, Hypertension"
              className="w-full bg-bg-primary border border-border-subtle rounded-xl p-3 text-text-primary text-sm placeholder-text-muted/50 focus:outline-none focus:border-neon-cyan/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Additional Notes</label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional information..."
              className="w-full bg-bg-primary border border-border-subtle rounded-xl p-3 text-text-primary text-sm placeholder-text-muted/50 focus:outline-none focus:border-neon-cyan/50 transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-btn-cyan text-bg-primary font-bold py-3 rounded-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300 text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Start Analysis"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-border-subtle text-text-muted rounded-xl hover:border-text-muted/50 hover:text-text-secondary transition-all text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
