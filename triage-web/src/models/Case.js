import mongoose from "mongoose";

const CaseSchema = new mongoose.Schema({
  // Demographic identifiers denormalized
  patientId: { type: Number, index: true },
  name: { type: String },
  age: { type: Number },
  gender: { type: String },
  
  // Input Data
  known_conditions: { type: String, default: "" },
  additional_notes: { type: String, default: "" },
  input_type: { type: String, enum: ["text", "audio", "image", "pdf"], default: "text" },
  input_record: { type: String, required: true },
  
  // Pipeline status
  status: { type: String, enum: ["processing", "analyzed", "diagnosed"], default: "processing" },
  
  // Triage results
  urgency: { type: String, enum: ["High", "Medium", "Low", "Critical", "Unknown"], default: "Unknown" },
  clinical_note: { type: String },
  extracted_entities: { type: Object },
  temporal_info: { type: Object },
  structured_data: { type: Object },
  
  // RAG2 Output
  rag_diagnosis: { type: Object },
  
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Case || mongoose.model("Case", CaseSchema);
