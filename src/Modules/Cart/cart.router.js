import  { Router } from "express";
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.controller.js";
import {
  AddToCartSchema,
  updateCartItemSchema,
  removeItemSchema,
} from "./cart.validation.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { validate } from "../../Middlewares/validate.js";

const router = Router();

// Add item to cart
router.post("/add", isAuthenticated, validate(AddToCartSchema), addToCart);

// Get user's cart
router.get("/", isAuthenticated, getCart);

// Update cart item
router.patch(
  "/update",
  isAuthenticated,
  validate(updateCartItemSchema),
  updateCartItem,
);

// Remove item from cart
router.delete(
  "/remove",
  isAuthenticated,
  validate(removeItemSchema),
  removeCartItem,
);

export default router;
