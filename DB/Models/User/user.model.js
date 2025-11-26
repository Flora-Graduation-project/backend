import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },

    email: {
      type: String,
      unique: true,
    },

    password: String,

    profilePic: {secure_url:String,public_id:String},
   

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
