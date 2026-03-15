import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  patientId: { type: Number, index: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, default: "" },
  contact: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
