import { Router } from "express";
import {
  signUp,
  logIn,
  googleCallback,
  facebookLogin,
  verify,
  resendCode,
  forgetPassword,
  resetPassword,
  updateProfile
} from "./auth.controller.js";
import { validate } from "../../Middlewares/validate.js";
import {
  signUpSchema,
  logInSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import passport from "../../../auth/passport.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { uploadCloud } from "../../Utils/multerCloud.js";

const router = Router();

// sign up
router.post("/signUp", validate(signUpSchema), signUp);

// verify
router.post("/verify", verify);

// resend verification code
router.post("/resend-code", resendCode);

//forget password
router.post("/forgetPassword", forgetPassword);

// reset password
router.post(
  "/resetPassword",
  isAuthenticated,
  validate(resetPasswordSchema),
  resetPassword
);

// log in
router.post("/logIn", validate(logInSchema), logIn);

// تبدأ عملية تسجيل الدخول عبر Facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// بعد الرجوع من Facebook
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  facebookLogin
);

//  المستخدم يضغط "Login with Google"
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//  Google ترجعه بعد الموافقة
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

// edit personal data
router.patch(
  "/edit",
  isAuthenticated,
  uploadCloud().single("image"),
  updateProfile
);

export default router;
