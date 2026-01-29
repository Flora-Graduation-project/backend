import { catchError } from "../../Utils/catchError.js";
import {
  NOT_FOUND,
  SUCCESS,
} from "../../Utils/statusCodes.js";
import Plant from "../../../DB/Models/Plants/Plants.model.js";

export const getAllPlants = catchError(async (req, res, next) => {
  const {name} = req.query;
  if(name){
    const plants = await Plant.find({plant_name:{$regex:name,$options:"i"}}).select("plant_name sub_title image_url");
    if(plants.length===0){
      return res.status(NOT_FOUND).json({message:"No plants found with this name"})
    }
    return res.status(SUCCESS).json({ message: "Success", plants });
  }
     const page = req.query.page || 1;
  const limit = 14;
  const skip = (page - 1) * limit;
    const plants = await Plant.find().skip(skip).limit(limit).select("plant_name sub_title image_url");
    return res.status(SUCCESS).json({ message: "Success", page,plants });
});

export const getPlantById = catchError(async (req, res, next) => {
  const { id } = req.params;
  const plant = await Plant.findById(id,{plant_id:0});
  if (!plant) {
    return res
      .status(NOT_FOUND)
      .json({ message: "Plant with this id not found" });
  }
  return res.status(SUCCESS).json({ message: "Success", plant });
});