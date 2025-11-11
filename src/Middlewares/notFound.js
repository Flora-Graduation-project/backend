import { NOT_FOUND } from "../Utils/statusCodes.js";

export const notFound = (req, res) => {
    res.status(NOT_FOUND).json({ success: false, message: "page not found" });
  }