import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, age, gender, contact } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Auto-generate Patient ID
    const count = await Patient.countDocuments();
    const newPatientId = count + 1;

    const newPatient = new Patient({
      patientId: newPatientId,
      name,
      age: age ? parseInt(age) : null,
      gender: gender || "",
      contact: contact || "",
    });

    await newPatient.save();

    return NextResponse.json({ success: true, patientId: newPatientId }, { status: 201 });

  } catch (error) {
    console.error("Registration API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
