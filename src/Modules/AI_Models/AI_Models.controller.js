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
import { askFloraBot } from "../../services/callChatbot.js";

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
        .json({
          success: false,
          message: "File size exceeds the limit of 5MB.",
        });
    }
    return res
      .status(BAD_REQUEST)
      .json({ success: false, message: uploadError.message });
  } else if (uploadError && uploadError.message === "INVALID_FILE_TYPE") {
    return res.status(BAD_REQUEST).json({
      success: false,
      message: "Invalid file type. Only JPEG, PNG, and WEBP are allowed.",
    });
  } else if (uploadError) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: "An error occurred while uploading the image.",
        error: uploadError.message,
      });
  }

  if (!req.file) {
    return res
      .status(BAD_REQUEST)
      .json({ success: false, message: "No image file provided." });
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
      .json({
        success: false,
        message: "Failed to get prediction from the model.",
      });
  } else if (response.data.prediction.is_ood) {
    return res.status(SUCCESS).json({
      success: false,
      message: "The uploaded image is out of distribution for the model.",
    });
  }
  const { label, probability } = response.data.prediction;
  return res.status(SUCCESS).json({ success: true, label, probability });
});

export const Diagnostic_Controller = catchError(async (req, res) => {
  const uploadError = await new Promise((resolve) => {
    uploadImage(req, res, (err) => {
      resolve(err);
    });
  });
  if (uploadError instanceof multer.MulterError) {
    if (uploadError.code === "LIMIT_FILE_SIZE") {
      return res
        .status(BAD_REQUEST)
        .json({
          success: false,
          message: "File size exceeds the limit of 5MB.",
        });
    }
    return res
      .status(BAD_REQUEST)
      .json({ success: false, message: uploadError.message });
  } else if (uploadError && uploadError.message === "INVALID_FILE_TYPE") {
    return res.status(BAD_REQUEST).json({
      success: false,
      message: "Invalid file type. Only JPEG, PNG, and WEBP are allowed.",
    });
  } else if (uploadError) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: "An error occurred while uploading the image.",
        error: uploadError.message,
      });
  }

  if (!req.file) {
    return res
      .status(BAD_REQUEST)
      .json({ success: false, message: "No image file provided." });
  }
  const formData = new FormData();
  formData.append("image", req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });
  const flaskApiUrl = " https://abdullah10-plantsapp.hf.space/api/classify";
  const response = await axios.post(flaskApiUrl, formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });
  if (!response.data.success) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: "Failed to get prediction from the model.",
      });
  } else if (response.data.prediction.is_ood) {
    return res.status(SUCCESS).json({
      success: true,
      message: "The uploaded image is out of distribution for the model.",
    });
  }
  const { label, probability } = response.data.prediction;
  return res.status(SUCCESS).json({ success: true, label, probability });
});

export const handleChat = catchError(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const botData = await askFloraBot(message);
  // console.log(botData);
  if (!botData || !botData.bot_response) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get a valid response from the chatbot.",
    });
  }
  res.status(SUCCESS).json({
    success: true,
    data: botData.bot_response,
  });
});
