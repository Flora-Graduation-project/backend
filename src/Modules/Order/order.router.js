import express from "express";
import { confirmOrder, getMyOrders, getMyRequests, getOrderDetails,getRequestDetails } from "../Order/order.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { validate } from "../../Middlewares/validate.js";
import {confirmOrderSchema} from "../../Modules/Order/order.validation.js"

const router = express.Router();

// Confirm Order
router.post(
  "/confirm",
  isAuthenticated,
  validate(confirmOrderSchema),
  confirmOrder
);

// Get My Orders
router.get("/my-orders", isAuthenticated, getMyOrders);

// Get My Requests
router.get("/my-requests", isAuthenticated, getMyRequests);

// Get Order Details
router.get("/:id", isAuthenticated, getOrderDetails);

// Get Request Details
router.get("/request/:id", isAuthenticated, getRequestDetails);

export default router;
