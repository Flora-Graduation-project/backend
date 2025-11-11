import mongoose from "mongoose";

export const connectDB = async () => {
  return await mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("connected to db .....");
    })
    .catch((err) => {
      console.log("Error in connecting to db", err.message);
    });
};
