import express from "express";
import { createPaymentIntent } from "./payment.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js"; 
import { validate } from "../../Middlewares/validate.js"; 
import { createPaymentSchema} from "./payment.validation.js";

const router = express.Router();

router.post(
  "/checkout",
  isAuthenticated,
  validate(createPaymentSchema),
  createPaymentIntent
);
export default router;