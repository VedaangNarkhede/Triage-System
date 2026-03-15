import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";

/**
 * POST /api/ocr-diagnose
 *
 * Accepts either:
 *   { caseId, imageDataUrl }   — canvas path (OCR)
 *   { caseId, diagnosisText }  — typed text path (no OCR)
 */
export async function POST(req) {
  try {
    const { caseId, imageDataUrl, diagnosisText } = await req.json();

    if (!caseId || (!imageDataUrl && !diagnosisText)) {
      return NextResponse.json(
        { error: "caseId and either imageDataUrl or diagnosisText are required" },
        { status: 400 }
      );
    }

    let diagText = "";
    let inputMethod = "typed";

    // ── Path A: Direct typed text ─────────────────────────────
    if (diagnosisText) {
      diagText = diagnosisText;
      inputMethod = "typed";
    }

    // ── Path B: Canvas image → OCR ────────────────────────────
    if (imageDataUrl && !diagnosisText) {
      inputMethod = "handwritten";

      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      try {
        const blob = new Blob([imageBuffer], { type: "image/png" });
        const formData = new FormData();
        formData.append("file", blob, "diagnosis.png");

        const ocrRes = await fetch("http://127.0.0.1:8000/ocr", {
          method: "POST",
          body: formData,
        });

        if (!ocrRes.ok) {
          const errText = await ocrRes.text();
          console.error("[ocr-diagnose] OCR backend error:", errText);
          return NextResponse.json(
            { error: "OCR processing failed: " + errText },
            { status: 502 }
          );
        }

        const ocrResult = await ocrRes.json();
        diagText = ocrResult.text || "";
      } catch (e) {
        console.error("[ocr-diagnose] Failed to reach OCR backend:", e);
        return NextResponse.json(
          { error: "Failed to connect to OCR backend. Is the FastAPI server running?" },
          { status: 503 }
        );
      }

      if (!diagText.trim()) {
        return NextResponse.json(
          { error: "OCR could not extract any text from the canvas. Please write more clearly and try again." },
          { status: 422 }
        );
      }
    }

    // ── 3. Update clinical note in MongoDB ────────────────────
    await connectToDatabase();
    const patient = await Case.findById(caseId);
    if (!patient) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const label = inputMethod === "handwritten" ? "Handwritten" : "Typed";
    const diagnosisAppend = `\n\n--- Doctor's ${label} Diagnosis (${timestamp}) ---\n${diagText}`;
    patient.clinical_note = (patient.clinical_note || "") + diagnosisAppend;

    // ── 4. Re-run diagnosis via FastAPI /diagnose ─────────────
    try {
      const diagnosePayload = {
        summary: patient.clinical_note,
        structured_data: {
          symptoms: patient.extracted_entities?.["Symptom/Disease"] ||
                    patient.structured_data?.symptoms || [],
          chief_complaint: patient.clinical_note,
          ...(patient.structured_data || {}),
        },
      };

      const diagRes = await fetch("http://127.0.0.1:8000/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagnosePayload),
      });

      if (diagRes.ok) {
        const ragResult = await diagRes.json();
        patient.rag_diagnosis = ragResult.diagnosis_suggestions || [];
        patient.status = "diagnosed";
      } else {
        console.warn("[ocr-diagnose] RAG diagnosis returned non-OK, keeping current diagnosis");
      }
    } catch (e) {
      console.warn("[ocr-diagnose] Could not re-run RAG diagnosis:", e.message);
      // Not fatal — we still save the updated clinical note even if diagnosis fails
    }

    // ── 5. Save ───────────────────────────────────────────────
    await patient.save();

    return NextResponse.json({
      success: true,
      diagnosisText: diagText,
      inputMethod,
      updatedNote: patient.clinical_note,
      rag_diagnosis: patient.rag_diagnosis,
    });
  } catch (error) {
    console.error("[ocr-diagnose] Internal error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
