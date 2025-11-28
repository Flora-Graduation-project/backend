import { Router } from "express";
import { signUp , logIn} from "./auth.controller.js";
import { validate } from "../../Middlewares/validate.js";
import { signUpSchema ,logInSchema} from "./auth.validation.js";
import { facebookLogin } from "./auth.controller.js";
import passport from '../../../auth/facebookAuth.js';

const router = Router();

// sign up
router.post("/signUp", validate(signUpSchema), signUp);

// log in
router.post("/logIn", validate(logInSchema), logIn);

// تبدأ عملية تسجيل الدخول عبر Facebook
router.get('/facebook', passport.authenticate('facebook', { session:false }));

// بعد الرجوع من Facebook
router.get('/facebook/callback',
  passport.authenticate('facebook', { session:false }),
  facebookLogin
);

export default router;
