import jwt from "jsonwebtoken";
import { catchError } from "../Utils/catchError.js";
import { User } from "../../DB/Models/User/user.model.js";
import { BAD_REQUEST, NOT_FOUND } from "../Utils/statusCodes.js";

export const isAuthenticated = catchError(async (req, res, next) => {
  let { token } = req.headers;
  if (!token) {
    return next(new Error("token is required", { cause: BAD_REQUEST }));
  }
  if (!token.startsWith(process.env.BEARERKEY)) {
    return next(new Error("invalid token", { cause: NOT_FOUND }));
  }
  token = token.split(" ")[1];
  const payload = jwt.verify(token, process.env.JWT_KEY);
  console.log("JWT Payload:", payload);
  const user = await User.findById(payload.id);
  if (!user) {
    return next(new Error("user not found !", { cause: NOT_FOUND }));
  }
  req.user = payload;
  next();
});
