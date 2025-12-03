import { Router } from "express";
import { updateProfile , deleteUser , getUserProfile} from "./user.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { uploadCloud } from "../../Utils/multerCloud.js";
import { editUserSchema } from "./user.validation.js";
import { validate } from "../../Middlewares/validate.js";

const router = Router();

// edit personal data
router.patch(
  "/edit",
  isAuthenticated,
  validate(editUserSchema),
  uploadCloud().single("image"),
  updateProfile
);
// delete user account
router.delete("/delete", isAuthenticated, deleteUser);
router.get("/myprofile", isAuthenticated, getUserProfile);

export default router;