import express from "express";
import { chatSchema } from "./AI_Models.validation.js";
import { validate } from "../../Middlewares/validate.js";
import {
  Identification_Controller,
  Diagnostic_Controller,
  handleChat,
} from "./AI_Models.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
const router = express.Router();

router.post("/Identification",isAuthenticated, Identification_Controller);
router.post("/Diagnostic", isAuthenticated, Diagnostic_Controller);
router.post("/Chat", validate(chatSchema), isAuthenticated, handleChat);
export default router;
