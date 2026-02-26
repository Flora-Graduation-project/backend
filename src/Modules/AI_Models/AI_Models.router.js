import express from "express";
import { Identification_Controller } from "./AI_Models.controller.js";
const router = express.Router();

router.post("/Identification", Identification_Controller);
export default router;