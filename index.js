import express from "express";
import dotenv from "dotenv";
import { startApp } from "./src/AppRouter.js";
import { connectDB } from "./DB/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
startApp(app, express);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
