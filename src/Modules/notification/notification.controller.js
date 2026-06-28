import { catchError } from "../../Utils/catchError.js";
import { CREATED, NOT_FOUND, SUCCESS } from "../../Utils/statusCode.js";
import { Notification } from "../../../DB/Models/notification/notification.model.js";
import { User } from "../../../DB/Models/User/user.model.js";

// get all notifications for the authenticated user

export const getNotifications = catchError(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 14;
  const skip = (page - 1) * limit;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(NOT_FOUND).json({ message: "User not found" });
  }
  const notifications = await Notification.find({ recipient: req.user.id })
    .select("-recipient -__v -updatedAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  if (notifications.length === 0) {
    return res.status(NOT_FOUND).json({ message: "No notifications found" });
  }
  res
    .status(SUCCESS)
    .json({
      message: "Notifications retrieved successfully",
      data: notifications,
    });
});

// mark a notification as read for the authenticated user

export const markNotificationAsRead = catchError(async (req, res) => {
  const notificationId = req.params.id;
  if (!notificationId) {
    return res
      .status(NOT_FOUND)
      .json({ message: "Notification ID is required" });
  }
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res.status(NOT_FOUND).json({ message: "User not found" });
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: req.user.id },
    { isRead: true },
    { new: true },
  ).lean();
  if (!notification) {
    return res.status(NOT_FOUND).json({ message: "Notification not found" });
  }
  res
    .status(SUCCESS)
    .json({ message: "Notification marked as read", data: notification });
});

// count unread notifications for the authenticated user

export const countUnreadNotifications = catchError(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res.status(NOT_FOUND).json({ message: "User not found" });
  }
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false,
  });
  res
    .status(SUCCESS)
    .json({ message: "Unread notifications count retrieved", count: unreadCount });
});