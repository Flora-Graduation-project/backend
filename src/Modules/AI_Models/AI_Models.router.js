import express from "express";
import { chatSchema } from "./AI_Models.validation.js";
import { validate } from "../../Middlewares/validate.js";
import {
  Identification_Controller,
  Diagnostic_Controller,
  handleChat,
} from "./AI_Models.controller.js";
const router = express.Router();

router.post("/Identification", Identification_Controller);
router.post("/Diagnostic", Diagnostic_Controller);
router.post("/Chat", validate(chatSchema), handleChat);
export default router;
