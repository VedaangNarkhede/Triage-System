import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") || `Patient-${Date.now().toString(36)}`;
    const age = formData.get("age");
    const gender = formData.get("gender") || "";
    const contact = formData.get("contact") || "";
    const knownConditions = formData.get("known_conditions") || "";
    const additionalNotes = formData.get("additional_notes") || "";
    const inputType = formData.get("input_type") || "text";
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
        console.log("FastAPI Response received:", JSON.stringify(triageResult).substring(0, 200));
      } else {
        const errText = await fastApiRes.text();
        console.error("FastAPI Error:", errText);
        return NextResponse.json({ error: "FastAPI Backend Error: " + errText }, { status: 502 });
      }
    } catch (e) {
      console.error("Failed to reach FastAPI backend:", e);
      return NextResponse.json({ error: "Failed to connect to Python backend." }, { status: 503 });
    }

    // Extract urgency with multiple fallback strategies
    let urgency = "Unknown";
    const clinicalNote = triageResult?.clinical_note || "";
    
    // Strategy 1: structured data urgency_level
    if (triageResult?.structured_data?.urgency_level) {
      const raw = triageResult.structured_data.urgency_level.toLowerCase();
      if (raw.includes("high") || raw.includes("critical")) urgency = "High";
      else if (raw.includes("medium") || raw.includes("moderate")) urgency = "Medium";
      else if (raw.includes("low")) urgency = "Low";
    }
    
    // Strategy 2: regex on clinical note
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

    const newPatient = new Patient({
      name,
      age: age ? parseInt(age) : null,
      gender,
      contact,
      known_conditions: knownConditions,
      additional_notes: additionalNotes,
      input_type: inputType,
      input_record: symptoms || (file ? file.name : "file upload"),
      status: "analyzed",
      urgency,
      clinical_note: clinicalNote,
      extracted_entities: triageResult?.extracted_entities || {},
      temporal_info: triageResult?.temporal_info || {},
      structured_data: triageResult?.structured_data || {},
      rag_diagnosis: [],
    });

    const savedPatient = await newPatient.save();

    return NextResponse.json({ success: true, patientId: savedPatient._id }, { status: 201 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
