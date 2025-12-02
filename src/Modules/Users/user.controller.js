import { User } from "../../../DB/Models/User/user.model.js";
import { catchError } from "../../Utils/catchError.js";
import cloudinary from "../../Utils/cloud.js";

export const updateProfile = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { name } = req.body;

  let profilePic = req.user.profilePic || {};

  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `flora_app/users/profile_pictures/${userId}`,
          public_id: "profile",
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    profilePic = {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      name: name || req.user.name,
      profilePic,
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Profile Updated Successfully!",
    user: updatedUser,
  });
});

export const deleteUser = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.find({ _id: userId, isDeleted: false });
  if (!user) {
    return next(new Error("User not found or already deleted"));
  }
  await User.findByIdAndUpdate(userId, {
    isDeleted: true,
    deletedAt: new Date(),
  });
  return res.status(200).json({
    success: true,
    message: "User account deleted successfully",
  });
});

export const getUserProfile = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.find({ _id: userId, isDeleted: false });
  if (!user) {
    return next(new Error("User not found "));
  }
  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    user:{ name: user[0].name, email: user[0].email, profilePic: user[0].profilePic },
  });
});
