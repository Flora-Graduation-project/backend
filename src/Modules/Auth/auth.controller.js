import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../../DB/Models/User/user.model.js";
import { catchError } from "../../Utils/catchError.js";
import { TempUser } from "../../../DB/Models/User/tempUser.model.js";
import { sendCodeEmail } from "../../Utils/sendCode.js";


export const signUp = catchError(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return next(new Error("Passwords do not match!"));

  const isUser = await User.findOne({ email });
  if (isUser) return next(new Error("Email must be unique!"));

  const hashPassword = bcryptjs.hashSync(password, Number(process.env.SALTROUNDS));

  await TempUser.deleteOne({ email });

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  await TempUser.create({
    name,
    email,
    password: hashPassword,
    verificationCode,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendCodeEmail({
    toEmail: email,
    code: verificationCode,
    subject: "Verify your Flora account",
    messageBody: "Thank you for signing up on Flora App! Enter this code to verify your account",
  });

  return res.status(200).json({
    success: true,
    message: "A verification code has been sent to your email, Please verify to complete registration!",
  });
});

export const logIn = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("Email not found!"));
  }
  // Compare password
  const isMatch = bcryptjs.compareSync(password, user.password);
  if (!isMatch) {
    return next(new Error("Incorrect password!"));
  }
  // Generate token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_KEY,
    {
      expiresIn: "20m",
    }
  );
  // Response
  return res.status(200).json({
    success: true,
    message: "Logged in successfully!",
    user: { id: user._id, name: user.name, email: user.email },
    token,
  });
});

export const facebookLogin = catchError(async (req, res, next) => {
  if (!req.user) {
    return next(
      new Error("Facebook login failed : no user data returned from Facebook")
    );
  }

  const { id: facebookId, displayName, emails } = req.user;
  const email = emails ? emails[0].value : null;

  let user = await User.findOne({ facebookId });
  if (!user) {
    user = await User.create({
      facebookId,
      name: displayName,
      email,
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    success: true,
    message: "Successfully logged in via Facebook!",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  });
});

export const googleCallback = catchError(async (req, res, next) => {
  const user = req.user;

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
    expiresIn: "7d",
  });

  // Return token and user info
  res.json({
    message: " Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

export const verify = catchError(async (req, res, next) => {
  const { email, code } = req.body;

  const tempUser = await TempUser.findOne({ email });
  if (!tempUser) return next(new Error("User not found or code expired!"));

  if (tempUser.verificationCode !== code)
    return next(new Error("Incorrect verification code!"));

  if (tempUser.expiresAt < new Date()) {
    await TempUser.deleteOne({ email });
    return next(new Error("Verification code has expired!"));
  }

  const user = await User.create({
    name: tempUser.name,
    email: tempUser.email,
    password: tempUser.password,
  });

  await TempUser.deleteOne({ email });

  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "7d" });

  return res.status(200).json({
    success: true,
    message: "Account created successfully!",
    user: { id: user._id, name: user.name, email: user.email },
    token,
  });
});

export const resendCode = async (req, res, next) => {
  const { email } = req.body;

  const tempUser = await TempUser.findOne({ email });
  if (!tempUser) return res.status(400).json({ success: false, message: "Please sign up first!" });

  // new code 
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  tempUser.code = newCode;
  tempUser.expireAt = Date.now() + 5 * 60 * 1000; 
  await tempUser.save();

 
  await sendCodeEmail({
    toEmail: email,
    code: newCode,
    subject: "Your verification code",
    messageBody: "Here is your new verification code :",
  });

  res.status(200).json({ success: true, message: "Verification code resent!" });
};

