"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const STEPS = [
  { label: "Input Processing", icon: "📋" },
  { label: "ASR / OCR", icon: "🔍" },
  { label: "Clinical NLP", icon: "🧠" },
  { label: "Clinical Summary", icon: "📝" },
  { label: "Complete", icon: "✅" },
];

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseId = searchParams.get("caseId");
  const [activeStep, setActiveStep] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    // Simulate pipeline step progress
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    // Also poll for actual completion
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/case/${caseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "analyzed" || data.status === "diagnosed") {
            setComplete(true);
            setActiveStep(STEPS.length - 1);
            clearInterval(poll);
            clearInterval(interval);
          }
        }
      } catch (e) { /* ignore polling errors */ }
    }, 3000);

    return () => { clearInterval(interval); clearInterval(poll); };
  }, [caseId]);

  if (!caseId) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-text-muted">No case ID provided.</p>
        <Link href="/submit-case" className="text-neon-cyan hover:underline text-sm mt-2 inline-block">Submit a new case</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Processing Case</h1>
        <p className="text-text-muted text-sm">AI pipeline is analyzing the patient data</p>
      </div>

      {/* Pipeline Steps */}
      <div className="gradient-card rounded-2xl border border-border-subtle p-8 mb-8">
        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const isActive = i === activeStep && !complete;
            const isDone = i < activeStep || complete;
            
            return (
              <div key={i} className={`
                flex items-center gap-4 p-4 rounded-xl border transition-all duration-500
                ${isActive 
                  ? "border-neon-cyan/40 bg-neon-cyan/5" 
                  : isDone 
                    ? "border-neon-green/20 bg-neon-green/5" 
                    : "border-border-subtle bg-bg-primary/50"}
              `}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg border
                  ${isActive 
                    ? "border-neon-cyan/50 animate-pulse" 
                    : isDone 
                      ? "border-neon-green/50 bg-neon-green/10" 
                      : "border-border-subtle"}
                `}>
                  {isDone ? "✓" : step.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isActive ? "text-neon-cyan" : isDone ? "text-neon-green" : "text-text-muted"}`}>
                    {step.label}
                  </p>
                </div>
                {isActive && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push(`/case/${caseId}`)}
          disabled={!complete}
          className={`
            py-3 px-8 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300
            ${complete 
              ? "gradient-btn-cyan text-bg-primary hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] cursor-pointer" 
              : "bg-bg-card border border-border-subtle text-text-muted cursor-not-allowed"}
          `}
        >
          {complete ? "View Results" : "Waiting..."}
        </button>
        <Link href="/submit-case" className="py-3 px-8 border border-border-subtle text-text-muted rounded-xl hover:border-text-muted/50 hover:text-text-secondary transition-all text-sm font-medium text-center">
          Cancel Analysis
        </Link>
        <Link href="/dashboard" className="py-3 px-8 border border-border-subtle text-text-muted rounded-xl hover:border-text-muted/50 hover:text-text-secondary transition-all text-sm font-medium text-center">
          Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-muted">Loading...</div>}>
      <ProcessingContent />
    </Suspense>
  );
}
