import mongoose from "mongoose";

const CaseSchema = new mongoose.Schema({
  caseId: { type: Number, required: true, unique: true },
  patientId: { type: Number, required: true, ref: 'Patient' }, // referencing the integer patientId
  
  // Input Data
  input_record: { type: String, required: true },
  input_type: { type: String, default: "text" },
  additional_notes: { type: String },
  duration: { type: String },
  
  status: { type: String, default: "analyzed" },
  
  // Triage output
  urgency: { type: String, enum: ["High", "Medium", "Low", "Unknown"], default: "Unknown" },
  clinical_note: { type: String },
  extracted_entities: { type: Object },
  temporal_info: { type: Object },
  structured_data: { type: Object },
  rag_diagnosis: { type: Array, default: [] },
  
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Case || mongoose.model("Case", CaseSchema);
