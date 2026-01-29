import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema(
  {
    diseaseId: { type: String, required: true, unique: true },
    name: { type: String, required: true },

    symptoms: [String],       
    causes: [String],
    prevention: [String],
    how_to_cure: [String],
    severity: [String],

    images: String,   
  },
  { timestamps: true }
);


export default mongoose.model("Disease", diseaseSchema);
