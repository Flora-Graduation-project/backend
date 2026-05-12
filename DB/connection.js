import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// التحقق من وجود الرابط قبل البدء (Fail Early)
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // خيارات الاتصال الحديثة مش محتاجة useNewUrlParser
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("connected to db ....");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // نمسح الـ promise عشان يحاول تاني المرة الجاية
    console.error("MongoDB connection error:", e.message);
    throw e;
  }

  return cached.conn;
};