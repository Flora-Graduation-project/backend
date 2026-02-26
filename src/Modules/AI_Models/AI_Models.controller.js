import { catchError } from "../../Utils/catchError.js";
import {
  SUCCESS,
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
} from "../../Utils/statusCodes.js";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import { uploadImage } from "../../Utils/multerCloud.js";


export const Identification_Controller = catchError(async (req, res) => {
  const uploadError = await new Promise((resolve) => {
    uploadImage(req, res, (err) => {
      resolve(err);
    });
  });
    if (uploadError instanceof multer.MulterError) {
      if (uploadError.code === "LIMIT_FILE_SIZE") {
        return res
          .status(BAD_REQUEST)
          .json({ message: "File size exceeds the limit of 5MB." });
      }
      return res.status(BAD_REQUEST).json({ message: uploadError.message });
    } else if (uploadError && uploadError.message === "INVALID_FILE_TYPE") {
      return res
        .status(BAD_REQUEST)
        .json({
          message: "Invalid file type. Only JPEG, PNG, and WEBP are allowed.",
        });
    } else if (uploadError) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "An error occurred while uploading the image." ,error: uploadError.message});
    }
  
  if (!req.file) {
    return res.status(BAD_REQUEST).json({ message: "No image file provided." });
  }
  //console.log(req.file);
  const formData = new FormData();
  formData.append("image", req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });
  const flaskApiUrl = " https://abdullah10-plantsapp.hf.space/api/classify2";
  const response = await axios.post(flaskApiUrl, formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });
  //console.log(response);
  if (!response.data.success) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to get prediction from the model." });
  } else if (response.data.prediction.is_ood) {
    return res
      .status(SUCCESS)
      .json({
        message: "The uploaded image is out of distribution for the model.",
      });
  }
  const { label, probability } = response.data.prediction;
  return res.status(SUCCESS).json({ label, probability });
});
