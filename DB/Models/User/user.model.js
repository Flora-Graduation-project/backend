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

     profilePic: {
  type: {
    secure_url: { 
      type: String, 
      default: "https://res.cloudinary.com/dy1tcyhjp/image/upload/v1764761436/Grey-Head-Pic_f2jggx.webp" 
    },
    public_id: { 
      type: String, 
      default: "Grey-Head-Pic_f2jggx" 
    }
  },
  default: {}
}

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
