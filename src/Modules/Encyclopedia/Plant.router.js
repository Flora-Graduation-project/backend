import { Router } from "express";
import {getAllPlants , getPlantById} from "./Plants.controller.js";
import { validate } from "../../Middlewares/validate.js";
import { checkId } from "./validation.js";
const router = Router();

// get All plants

router.get("/", getAllPlants);

// get plant by id
router.get("/:id",validate(checkId), getPlantById);

export default router;