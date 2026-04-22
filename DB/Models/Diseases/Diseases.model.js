import mongoose from "mongoose";


const causeSchema = new mongoose.Schema({
  factor: { type: String, required: true },
  details: { type: String, required: true }
}, { _id: false }); 

const preventionSchema = new mongoose.Schema({
  step: { type: String, required: true },
  details: { type: String, required: true }
}, { _id: false });

const cureSchema = new mongoose.Schema({
  method: { type: String, required: true },
  details: { type: String, required: true }
}, { _id: false });

const severitySchema = new mongoose.Schema({
  level: { type: String, required: true },
  impact: [{ type: String }] 
}, { _id: false });


const diseaseSchema = new mongoose.Schema(
  {
    disease_id: { type: String, required: true, unique: true, index: true }, 
    name: { type: String, required: true },

    symptoms: [{ type: String }], 
    
    
    causes: [causeSchema],
    prevention: [preventionSchema],
    how_to_cure: [cureSchema],
    
    severity: severitySchema, 

    image_url: String , 
  },
  { timestamps: true } 
);

export default mongoose.model("Disease", diseaseSchema);