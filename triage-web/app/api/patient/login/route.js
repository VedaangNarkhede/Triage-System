import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function POST(req) {
  try {
    const body = await req.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const patient = await Patient.findOne({ patientId: parseInt(patientId) }).lean();
    if (!patient) {
        return NextResponse.json({ error: "Patient ID not found. Please register." }, { status: 404 });
    }

    return NextResponse.json({ success: true, patientId: patient.patientId }, { status: 200 });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
