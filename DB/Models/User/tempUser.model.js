import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
    },

    password: String,

    // verification
    verificationCode: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["verifyAccount", "resetPassword"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TempUser = mongoose.model("TempUser", tempUserSchema);
