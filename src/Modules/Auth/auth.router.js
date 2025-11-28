import { Router } from "express";
import { signUp , logIn , googleCallback ,facebookLogin} from "./auth.controller.js";
import { validate } from "../../Middlewares/validate.js";
import { signUpSchema ,logInSchema} from "./auth.validation.js";
import passport from '../../../auth/facebookAuth.js';
import passportGoogle from '../../../auth/passport.js';

const router = Router();

// sign up
router.post("/signUp", validate(signUpSchema), signUp);

// log in
router.post("/logIn", validate(logInSchema), logIn);

// تبدأ عملية تسجيل الدخول عبر Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ["email"] }));

// بعد الرجوع من Facebook
router.get('/facebook/callback',
  passport.authenticate('facebook', { session:false }),
  facebookLogin
);

//  المستخدم يضغط "Login with Google"
router.get(
  "/google",
  passportGoogle.authenticate("google", { scope: ["profile", "email"] })
);

//  Google ترجعه بعد الموافقة

router.get(
  "/google/callback",
  passportGoogle.authenticate("google", { session: false }),
  googleCallback
);


export default router;
