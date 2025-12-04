import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    // إذا الاتصال موجود مسبقًا، استخدمه مباشرة
    return cached.conn;
  }

  if (!cached.promise) {
    // لو مفيش اتصال جاري، نعمل اتصال جديد
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("Connected to DB ...");
  return cached.conn;
};
