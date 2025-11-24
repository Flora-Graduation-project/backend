import { Router } from "express";
import { signUp } from "./auth.controller.js";
import { validate } from "../../Middlewares/validate.js";
import { signUpSchema } from "./auth.validation.js";

const router = Router();

// sign up
router.post("/signUp", validate(signUpSchema), signUp);

export default router;
