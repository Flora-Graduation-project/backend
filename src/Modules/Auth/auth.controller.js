import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../../DB/Models/User/user.model.js";
import { catchError } from "../../Utils/catchError.js";

export const signUp = catchError(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check password match
  if (password !== confirmPassword) {
    return next(new Error("Passwords do not match!"));
  }

  // Check if user exists
  const isUser = await User.findOne({ email });
  if (isUser) {
    return next(new Error("Email must be unique!"));
  }

  // Hash password
  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALTROUNDS)
  );

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashPassword,
    isConfirmed: true,
  });

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
    expiresIn: "7m",
  });

  // Response
  return res.status(201).json({
    success: true,
    message: "User registered successfully!",
    user: { id: user._id, name: user.name, email: user.email },
    token,
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
