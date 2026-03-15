"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HandwritingCanvas from "./HandwritingCanvas";

/**
 * UpdateDiagnosisButton — Appears in each dashboard row.
 * Offers two input methods: handwriting canvas (OCR) or text typing.
 *
 * Props:
 *   caseId      — MongoDB _id string of the Case document
 *   patientName — Patient name for display
 */
export default function UpdateDiagnosisButton({ caseId, patientName }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [closing, setClosing] = useState(false);

  // ── Submit canvas (OCR path) ─────────────────────────────
  const handleCanvasSubmit = async (dataUrl) => {
    setCanvasOpen(false);
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/ocr-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, imageDataUrl: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update diagnosis");

      setStatus({ type: "success", message: "Diagnosis updated!" });
      router.refresh();
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ── Submit typed text (direct path) ──────────────────────
  const handleTextSubmit = async () => {
    if (!typedText.trim()) return;
    setLoading(true);
    setStatus(null);
    closeTextModal();

    try {
      const res = await fetch("/api/ocr-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, diagnosisText: typedText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update diagnosis");

      setStatus({ type: "success", message: "Diagnosis updated!" });
      setTypedText("");
      router.refresh();
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const closeTextModal = () => {
    setClosing(true);
    setTimeout(() => {
      setTextModalOpen(false);
      setClosing(false);
    }, 250);
  };

  return (
    <>
      {/* ── Update Button + Dropdown ──────────────────────── */}
      <div className="relative flex items-center gap-2">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          disabled={loading}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-neon-yellow/30 text-neon-yellow hover:bg-neon-yellow/10 hover:border-neon-yellow/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-neon-yellow/30 border-t-neon-yellow rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>✏️ Update</>
          )}
        </button>

        {status && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-md ${
              status.type === "success"
                ? "text-neon-green bg-neon-green/10"
                : "text-neon-red bg-neon-red/10"
            }`}
          >
            {status.message}
          </span>
        )}

        {/* Dropdown menu */}
        {menuOpen && !loading && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute left-0 top-full mt-1 z-50 w-52 rounded-xl border border-border-subtle overflow-hidden animate-slide-up"
              style={{
                background: "linear-gradient(145deg, #1a2332 0%, #111827 100%)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,240,255,0.05)",
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setCanvasOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-neon-cyan/10 transition-colors text-left"
              >
                <span className="text-lg">🖊️</span>
                <div>
                  <p className="font-medium text-text-primary">Handwrite</p>
                  <p className="text-text-muted text-xs">Draw on canvas + OCR</p>
                </div>
              </button>
              <div className="border-t border-border-subtle" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setTextModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-neon-purple/10 transition-colors text-left"
              >
                <span className="text-lg">⌨️</span>
                <div>
                  <p className="font-medium text-text-primary">Type</p>
                  <p className="text-text-muted text-xs">Type diagnosis directly</p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Handwriting Canvas Modal ──────────────────────── */}
      <HandwritingCanvas
        open={canvasOpen}
        onClose={() => setCanvasOpen(false)}
        onSubmit={handleCanvasSubmit}
        patientName={patientName}
      />

      {/* ── Text Typing Modal ────────────────────────────── */}
      {textModalOpen && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
            closing ? "opacity-0" : "opacity-100"
          }`}
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={closeTextModal} />

          <div
            className={`relative z-10 w-[90vw] max-w-[700px] rounded-2xl border border-border-subtle overflow-hidden flex flex-col transition-all duration-300 ${
              closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
            style={{
              background: "linear-gradient(145deg, #1a2332 0%, #111827 100%)",
              boxShadow: "0 0 60px rgba(168, 85, 247, 0.1), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⌨️</span>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Type Diagnosis</h2>
                  {patientName && (
                    <p className="text-text-muted text-xs">
                      Patient: <span className="text-neon-purple">{patientName}</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeTextModal}
                className="w-9 h-9 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center text-text-muted hover:text-neon-red hover:border-neon-red/40 transition-all text-lg"
              >
                ✕
              </button>
            </div>

            {/* Text Area */}
            <div className="p-6">
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Enter your diagnosis notes here... &#10;&#10;e.g. Patient presents with acute bronchitis. Prescribed antibiotics and rest for 5 days. Follow-up in one week."
                autoFocus
                className="w-full h-56 rounded-xl bg-bg-primary border border-border-subtle p-4 text-text-primary text-sm leading-relaxed font-mono resize-none focus:outline-none focus:border-neon-purple/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all placeholder:text-text-muted/50"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-text-muted text-xs">
                  💡 Type your diagnosis clearly. This will be appended to the clinical record.
                </p>
                <p className="text-text-muted text-xs">
                  {typedText.length} characters
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle">
              <button
                onClick={closeTextModal}
                className="px-5 py-2 rounded-xl text-sm font-medium text-text-muted border border-border-subtle hover:text-text-secondary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSubmit}
                disabled={!typedText.trim()}
                className="gradient-btn-purple text-white font-bold py-2 px-6 rounded-xl text-sm hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Diagnosis
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
