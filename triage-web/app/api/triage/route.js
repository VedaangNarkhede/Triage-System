import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, age, contact, symptoms } = body;

    if (!name || !symptoms) {
      return NextResponse.json({ error: "Name and symptoms are required" }, { status: 400 });
    }

    // Call Python FastAPI Backend
    const formData = new URLSearchParams();
    formData.append("text", symptoms);

    let triageResult = {};
    try {
        console.log("Calling FastAPI Backend...");
        const fastApiRes = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString()
        });

        if (fastApiRes.ok) {
            triageResult = await fastApiRes.json();
        } else {
            console.error("FastAPI Error:", await fastApiRes.text());
        }
    } catch (e) {
        console.error("Failed to reach FastAPI backend:", e);
        // Fallback or error handling if python backend is down
    }


    await connectToDatabase();

    // Save to Database
    const newPatient = new Patient({
      name,
      age: age ? parseInt(age) : null,
      contact,
      input_record: symptoms,
      urgency: triageResult?.clinical_note?.match(/Urgency Level:\s*(High|Medium|Low)/i)?.[1] || "Unknown",
      clinical_note: triageResult?.clinical_note || "Processing failed or pending.",
      extracted_entities: triageResult?.extracted_entities || {},
      temporal_info: triageResult?.temporal_info || {},
    });

    const savedPatient = await newPatient.save();

    return NextResponse.json({ success: true, patientId: savedPatient._id }, { status: 201 });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
