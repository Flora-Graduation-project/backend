import { Router } from "express";
import { getAllDiseases,getDiseaseById } from "./Diseases.controller.js";
import { validate } from "../../Middlewares/validate.js";
import { checkId } from "./validation.js";
const router = Router();

// get All diseases

router.get("/", getAllDiseases);

// get disease by id
router.get("/:id",validate(checkId), getDiseaseById);

export default router;