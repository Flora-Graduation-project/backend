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
  const token = jwt.sign({ id: user._id }, process.env.TOKENKEY, {
    expiresIn: "7d",
  });

  // Response
  return res.status(201).json({
    success: true,
    message: "User registered successfully!",
    user,
    token,
  });
});
