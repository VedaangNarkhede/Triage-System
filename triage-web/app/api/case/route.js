import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Case from "@/models/Case";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const patientId = formData.get("patientId");
    
    if (!patientId) {
        return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const additionalNotes = formData.get("additional_notes") || "";
    const duration = formData.get("duration") || "";
    const symptoms = formData.get("symptoms");
    const file = formData.get("file");

    if (!symptoms && (!file || file.size === 0)) {
      return NextResponse.json({ error: "Either symptoms text or a file is required" }, { status: 400 });
    }

    // Call Python FastAPI Backend
    const fastApiFormData = new FormData();
    if (symptoms) fastApiFormData.append("text", symptoms);
    if (file && file.size > 0) fastApiFormData.append("file", file);

    let triageResult = {};
    try {
      console.log("Calling FastAPI Backend /analyze...");
      const fastApiRes = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: fastApiFormData,
      });

      if (fastApiRes.ok) {
        triageResult = await fastApiRes.json();
      } else {
        const errText = await fastApiRes.text();
        return NextResponse.json({ error: "FastAPI Backend Error: " + errText }, { status: 502 });
      }
    } catch (e) {
      console.error("Failed to reach FastAPI backend:", e);
      return NextResponse.json({ error: "Failed to connect to Python backend." }, { status: 503 });
    }

    // Extract urgency with fallback strategies
    let urgency = "Unknown";
    const clinicalNote = triageResult?.clinical_note || "";
    
    if (triageResult?.structured_data?.urgency_level) {
      const raw = triageResult.structured_data.urgency_level.toLowerCase();
      if (raw.includes("high") || raw.includes("critical")) urgency = "High";
      else if (raw.includes("medium") || raw.includes("moderate")) urgency = "Medium";
      else if (raw.includes("low")) urgency = "Low";
    }
    
    if (urgency === "Unknown") {
      const match = clinicalNote.match(/urgency\s*(?:level)?[:\s]*(\w+)/i);
      if (match) {
        const val = match[1].toLowerCase();
        if (val.includes("high") || val.includes("critical")) urgency = "High";
        else if (val.includes("medium") || val.includes("moderate")) urgency = "Medium";
        else if (val.includes("low")) urgency = "Low";
      }
    }

    await connectToDatabase();
    
    // Auto-generate Case ID
    const count = await Case.countDocuments();
    const newCaseId = count + 1;

    const newCase = new Case({
      caseId: newCaseId,
      patientId: parseInt(patientId),
      additional_notes: additionalNotes,
      duration: duration,
      input_type: file ? "file upload" : "text",
      input_record: symptoms || (file ? file.name : "file upload"),
      status: "analyzed",
      urgency,
      clinical_note: clinicalNote,
      extracted_entities: triageResult?.extracted_entities || {},
      temporal_info: triageResult?.temporal_info || {},
      structured_data: triageResult?.structured_data || {},
      rag_diagnosis: [],
    });

    const savedCase = await newCase.save();

    return NextResponse.json({ success: true, caseId: savedCase.caseId, patientId }, { status: 201 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
