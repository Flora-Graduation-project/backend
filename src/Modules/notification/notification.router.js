import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  countUnreadNotifications
} from "./notification.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";

const router = express.Router();

// get all notifications for the authenticated user
router.get("/", isAuthenticated, getNotifications);

// mark a notification as read for the authenticated user
router.patch("/:id", isAuthenticated, markNotificationAsRead);

// count unread notifications for the authenticated user
router.get("/count", isAuthenticated, countUnreadNotifications);

export default router;
