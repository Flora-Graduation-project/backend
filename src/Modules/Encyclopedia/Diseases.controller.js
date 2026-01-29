import { catchError } from "../../Utils/catchError.js";
import {
  NOT_FOUND,
  SUCCESS,
} from "../../Utils/statusCodes.js";
import Disease from "../../../DB/Models/Diseases/Diseases.model.js";

export const getAllDiseases = catchError(async (req, res, next) => {
  const {name} = req.query;
  if(name){
    const diseases = await Disease.find({name:{$regex:name,$options:"i"}}).select("name images_url");
    if(diseases.length===0){
      return res.status(NOT_FOUND).json({message:"No diseases found with this name"})
    }
    return res.status(SUCCESS).json({ message: "Success", diseases });
  }
     const page = req.query.page || 1;
  const limit = 14;
  const skip = (page - 1) * limit;
    const diseases = await Disease.find().skip(skip).limit(limit).select("name images_url");
    return res.status(SUCCESS).json({ message: "Success", page,diseases });
});

export const getDiseaseById = catchError(async (req, res, next) => {
  const { id } = req.params;
  const disease = await Disease.findById(id,{disease_id:0,ID:0});
  if (!disease) {
    return res
      .status(NOT_FOUND)
      .json({ message: "Disease with this id not found" });
  }
  return res.status(SUCCESS).json({ message: "Success", disease });
});