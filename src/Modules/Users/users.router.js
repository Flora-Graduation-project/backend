import { Router } from "express";
import { updateProfile , deleteUser} from "./user.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { uploadCloud } from "../../Utils/multerCloud.js";

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

export default router;