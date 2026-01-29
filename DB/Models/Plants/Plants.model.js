import mongoose from "mongoose";

const plantSchema = new mongoose.Schema({
  plant_id: {
    type: String,
    required: true,
    unique: true,
  },
  plant_name: {
    type: String,
    required: true,
  },
  sub_title: {
    type: String,
  },
  description: {
    type: String,
  },
  sun_and_light: {
    type: [String], 
  },
  humidity: {
    type: [String], 
  },
  temperature: {
    type: String,
  },
  soil: {
    type: [String], 
  },
  watering: {
    type: [String], 
  },
  fertilizing: {
    type: [String], 
  },
  toxicity: {
    type: String,
  },
  pets: {
    type: [String], 
  },
  diseases: {
    type: [String], 
  },
  care_tips: {
    type: String,
  },
  image_url: {
    type: [String], 
  }
}, { timestamps: true });

export default mongoose.model("Plant", plantSchema);
