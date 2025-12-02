import { Router } from "express";
import { updateProfile , deleteUser , getUserProfile} from "./user.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { uploadCloud } from "../../Utils/multerCloud.js";
import { get } from "mongoose";

const router = Router();

// edit personal data
router.patch(
  "/edit",
  isAuthenticated,
  uploadCloud().single("image"),
  updateProfile
);
// delete user account
router.delete("/delete", isAuthenticated, deleteUser);
router.get("/myprofile", isAuthenticated, getUserProfile);

export default router;