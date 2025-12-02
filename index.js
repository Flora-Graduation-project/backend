import dotenv from "dotenv";
import express from "express";
import passport from './auth/passport.js'; 
import { startApp } from "./src/AppRouter.js";
import { connectDB } from "./DB/connection.js";
import { deleteSoftDeletedUsers } from "./src/Utils/cron-job.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(passport.initialize());

connectDB();
deleteSoftDeletedUsers();
startApp(app, express);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

