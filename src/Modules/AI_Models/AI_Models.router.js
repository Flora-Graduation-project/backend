import express from "express";
import { Identification_Controller , Diagnostic_Controller} from "./AI_Models.controller.js";
const router = express.Router();

router.post("/Identification", Identification_Controller);
router.post("/Diagnostic", Diagnostic_Controller);
export default router;