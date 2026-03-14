import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    const patient = await Patient.findById(id).lean();
    if (!patient) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Serialize _id to string
    patient._id = patient._id.toString();
    
    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    console.error("API /case/[id] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
