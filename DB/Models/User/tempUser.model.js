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

    profilePic: { secure_url: String, public_id: String },

    // verification
    verificationCode: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TempUser = mongoose.model("TempUser", tempUserSchema);

