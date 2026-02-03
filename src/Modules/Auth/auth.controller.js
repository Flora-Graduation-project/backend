import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../../DB/Models/User/user.model.js";
import { catchError } from "../../Utils/catchError.js";
import { TempUser } from "../../../DB/Models/User/tempUser.model.js";
import { sendCodeEmail } from "../../Utils/sendCode.js";
import { BAD_REQUEST, UNAUTHORIZED } from "../../Utils/statusCodes.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../Middlewares/token.js";


export const signUp = catchError(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  const isUser = await User.findOne({ email });
  if (isUser && !isUser.isDeleted) {
    const err = new Error("Email must be unique!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  } else if (isUser && isUser.isDeleted) {
    await User.findByIdAndUpdate(isUser._id, {
      isDeleted: false,
      deletedAt: null,
    });
    return res.status(200).json({
      success: true,
      message: "Your account has been restored. You can now log in.", /////////////////////// عرفي سلمي انه يروح يعمل لوج
    });
  }
  if (password !== confirmPassword) {
    const err = new Error("Passwords do not match!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALTROUNDS),
  );

  await TempUser.deleteOne({ email });

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  const hashedCode = await bcryptjs.hash(
    verificationCode,
    Number(process.env.SALTROUNDS),
  );

  await TempUser.create({
    name,
    email,
    password: hashPassword,
    verificationCode: hashedCode,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    purpose: "verifyAccount",
  });

  await sendCodeEmail({
    toEmail: email,
    code: verificationCode,
    subject: "Verify your Flora account",
    messageBody:
      "Thank you for signing up on Flora App! Enter this code to verify your account",
  });

  return res.status(200).json({
    success: true,
    message:
      "A verification code has been sent to your email, Please verify to complete registration!",
  });
});

export const logIn = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Email not found!!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  // Compare password
  const isMatch = bcryptjs.compareSync(password, user.password);
  if (!isMatch) {
    const err = new Error("Incorrect password!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  // Generate token
  const token = generateAccessToken({ id: user._id, email: user.email });
  const refreshToken = generateRefreshToken({
    id: user._id,
    email: user.email,
  });
  user.refreshToken = refreshToken;
  await user.save();

  if (user.isDeleted) {
    await User.findByIdAndUpdate(user._id, {
      isDeleted: false,
      deletedAt: null,
    });
    return res.status(200).json({
      success: true,
      message:
        "Your account was scheduled for deletion but has now been restored.",
      user: { id: user._id, name: user.name, email: user.email },
      token,
      refreshToken,
    });
  }
  // Response
  return res.status(200).json({
    success: true,
    message: "Logged in successfully!",
    user: { id: user._id, name: user.name, email: user.email },
    token,
    refreshToken,
  });
});

export const facebookLogin = catchError(async (req, res, next) => {
  if (!req.user) {
    return next(
      new Error("Facebook login failed : no user data returned from Facebook"),
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
  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
    expiresIn: "7d",
  });

  if (user.isDeleted) {
    await User.findByIdAndUpdate(user._id, {
      isDeleted: false,
      deletedAt: null,
    });
    return res.status(200).json({
      success: true,
      message:
        "Your account was scheduled for deletion but has now been restored.",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  }
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
  if (user.isDeleted) {
    await User.findByIdAndUpdate(user._id, {
      isDeleted: false,
      deletedAt: null,
    });
    return res.status(200).json({
      success: true,
      message:
        "Your account was scheduled for deletion but has now been restored.",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  }
  // Return token and user info
  res.json({
    message: " Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

export const verify = catchError(async (req, res, next) => {
  const { email, code } = req.body;

  const tempUser = await TempUser.findOne({ email });
  if (!tempUser) {
    const err = new Error("User not found or code expired!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }

  const isCode = await bcryptjs.compare(
    code.toString(),
    tempUser.verificationCode,
  );
  if (!isCode) {
    const err = new Error("Invalid verification code!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }

  if (tempUser.expiresAt < new Date()) {
    await TempUser.deleteOne({ email });
    const err = new Error("Verification code has expired!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }

  if (tempUser.purpose === "verifyAccount") {
    const user = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
    });
    await TempUser.deleteOne({ email });
    const token = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({
      id: user._id,
      email: user.email,
    });
    user.refreshToken = refreshToken;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Account created successfully!",
      user: { id: user._id, name: user.name, email: user.email },
      token,
      refreshToken,
    });
  } else if (tempUser.purpose === "resetPassword") {
    const user = await User.findOne({ email });
    const token = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({
      id: user._id,
      email: user.email,
    });
    user.refreshToken = refreshToken;
    await user.save();
    await TempUser.deleteOne({ email });
    return res.status(200).json({
      success: true,
      message: "Verification successful, now you can reset your password",
      user: { id: user._id, name: user.name, email: user.email },
      token,
      refreshToken,
    });
  }
});

export const resendCode = catchError(async (req, res, next) => {
  const { email } = req.body;

  const tempUser = await TempUser.findOne({ email });
  if (!tempUser)
    return res
      .status(400)
      .json({ success: false, message: "Please sign up first!" });

  // new code
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  tempUser.verificationCode = await bcryptjs.hash(
    newCode,
    Number(process.env.SALTROUNDS),
  );
  tempUser.expiresAt = Date.now() + 5 * 60 * 1000;
  await tempUser.save();

  await sendCodeEmail({
    toEmail: email,
    code: newCode,
    subject: "Your verification code",
    messageBody: "Here is your new verification code :",
  });

  res.status(200).json({ success: true, message: "Verification code resent!" });
});

export const forgetPassword = catchError(async (req, res, next) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Email not found!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }

  // send code

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  const hashedCode = await bcryptjs.hash(
    verificationCode,
    Number(process.env.SALTROUNDS),
  );
  await TempUser.deleteMany({ email });
  await TempUser.create({
    name: user.name,
    email,
    password: user.password,
    verificationCode: hashedCode,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    purpose: "resetPassword",
  });

  await sendCodeEmail({
    toEmail: email,
    code: verificationCode,
    subject: "Password Reset Code",
    messageBody: "Use this code to reset your password:",
  });

  // Response
  return res.status(200).json({
    success: true,
    message:
      " A verification code has been sent to your email, Please verify to reset your password!",
  });
});

export const resetPassword = catchError(async (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;
  const id = req.user.id;
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  } else if (newPassword !== confirmPassword) {
    const err = new Error("Passwords do not match!");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  // Compare new password with old one (hashed)
  const isSamePassword = await bcryptjs.compare(newPassword, user.password);

  if (isSamePassword) {
    return res.status(400).json({
      success: false,
      message: "New password cannot be the same as the old password",
    });
  }

  const hashPassword = await bcryptjs.hash(
    newPassword,
    Number(process.env.SALTROUNDS),
  );
  user.password = hashPassword;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Password reset successfully!",
  });
});

export const refreshToken = catchError(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    const err = new Error("No refresh token provided!");
    err.statusCode = UNAUTHORIZED;
    return next(err);
  }
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        const err = new Error("Invalid refresh token!");
        err.statusCode = UNAUTHORIZED;
        return next(err);
      }
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        const err = new Error("Invalid refresh token!");
        err.statusCode = UNAUTHORIZED;
        return next(err);
      }
      const newAccessToken = generateAccessToken(
        { id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        "15m",
      );
      res.status(200).json({
        success: true,
        message: "Access token refreshed successfully!",
        token: newAccessToken,
      });
    },
  );
});
