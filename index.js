import dotenv from "dotenv";
import express from "express";
import passport from './auth/facebookAuth.js'; 
import session from 'express-session';
import { startApp } from "./src/AppRouter.js";
import { connectDB } from "./DB/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد الجلسات لـ Passport
app.use(session({ secret: 'SECRET', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

connectDB();
startApp(app, express);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

