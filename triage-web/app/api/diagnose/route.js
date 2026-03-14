import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function POST(req) {
  try {
    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Prepare payload for FastAPI /diagnose
    const diagnosePayload = {
      summary: patient.clinical_note || "",
      structured_data: {
        symptoms: patient.extracted_entities?.["Symptom/Disease"] || 
                  patient.structured_data?.symptoms || [],
        chief_complaint: patient.clinical_note || "",
        ...(patient.structured_data || {}),
      }
    };

    let ragResult = {};
    try {
      console.log("Calling FastAPI Backend /diagnose...");
      const fastApiRes = await fetch("http://127.0.0.1:8000/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagnosePayload),
      });

      if (fastApiRes.ok) {
        ragResult = await fastApiRes.json();
      } else {
        const errText = await fastApiRes.text();
        console.error("FastAPI /diagnose Error:", errText);
        return NextResponse.json({ error: "FastAPI Backend Error: " + errText }, { status: 502 });
      }
    } catch (e) {
      console.error("Failed to reach FastAPI backend:", e);
      return NextResponse.json({ error: "Failed to connect to Python backend." }, { status: 503 });
    }

    // Save diagnosis
    patient.rag_diagnosis = ragResult.diagnosis_suggestions || [];
    patient.status = "diagnosed";

    // Update urgency if it was Unknown and RAG result has info
    if (patient.urgency === "Unknown" && patient.rag_diagnosis.length > 0) {
      // Infer urgency from top diagnosis
      const topDisease = patient.rag_diagnosis[0]?.disease?.toLowerCase() || "";
      const highUrgency = ["heart attack", "stroke", "pneumonia", "sepsis", "meningitis", "pulmonary embolism"];
      const medUrgency = ["hypertension", "diabetes", "asthma", "bronchitis", "migraine"];
      
      if (highUrgency.some(d => topDisease.includes(d))) {
        patient.urgency = "High";
      } else if (medUrgency.some(d => topDisease.includes(d))) {
        patient.urgency = "Medium";
      } else {
        patient.urgency = "Low";
      }
    }

    await patient.save();

    return NextResponse.json({ 
      success: true, 
      rag_diagnosis: patient.rag_diagnosis,
      urgency: patient.urgency
    }, { status: 200 });

  } catch (error) {
    console.error("API Route /diagnose Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
