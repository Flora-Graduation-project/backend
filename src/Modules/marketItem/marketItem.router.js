import express from "express";
import {
  addMarketItem,
  getAllMarketItems,
  getMarketItemById,
  updateMarketItem,
  deleteMarketItem,
} from "./marketItem.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { validate } from "../../Middlewares/validate.js";
import { MarketItemSchema } from "./marketItem.validation.js";

const router = express.Router();

// get all plants
router.get("/", getAllMarketItems);

// get plant by id
router.get("/:id", getMarketItemById);

// add plant for sale
router.post(
  "/",
  isAuthenticated,
  validate(MarketItemSchema),
  addMarketItem
);

// edit plant
router.patch(
  "/:id",
  isAuthenticated,
  updateMarketItem
);

// delete plant
router.delete(
  "/:id",
  isAuthenticated,
  deleteMarketItem
);

export default router;
