import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  credentials: { type: String },
});

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
