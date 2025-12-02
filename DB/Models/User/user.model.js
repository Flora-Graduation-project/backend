import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
    },

    password: String,
    googleId: String,
    facebookId: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,

    profilePic: { secure_url: String, public_id: String },

    // isComfirmed: {
    //   type: Boolean,
    //   default: false,
    // },

    // isLoggedIn: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
