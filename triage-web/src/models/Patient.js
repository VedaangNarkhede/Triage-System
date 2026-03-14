import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  contact: { type: String },
  input_record: { type: String, required: true }, // The raw text or audio filename
  
  // Triage results structured output
  urgency: { type: String, enum: ["High", "Medium", "Low", "Unknown"], default: "Unknown" },
  clinical_note: { type: String },
  extracted_entities: { type: Object }, // To store JSON from NER module
  temporal_info: { type: Object }, // Timeline JSON
  
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
