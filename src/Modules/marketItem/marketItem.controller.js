import { catchError } from "../../Utils/catchError.js";
import {
  NOT_FOUND,
  UNAUTHORIZED,
  SUCCESS,
  CREATED,
} from "../../Utils/statusCodes.js";
import MarketItem from "../../../DB/Models/marketItem/marketItem.model.js";
import WishList from "../../../DB/Models/wishList/wishList.model.js";
import { v2 as cloudinary } from "cloudinary";

// add plant for sale
export const addMarketItem = catchError(async (req, res, next) => {
  if (!req.file) {
    const err = new Error("Image file is required");
    err.statusCode = NOT_FOUND;
    return next(err);
  }

  const uploadToCloudinary = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "market_items" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });
  };

  const result = await uploadToCloudinary();

  const marketItem = await MarketItem.create({
    ...req.body,
    image: result.secure_url,
    seller: req.user.id,
  });

  res.status(CREATED).json({
    message: "Plant Added for sale successfully!",
    data: {
      image: marketItem.image,
      name: marketItem.name,
      price: marketItem.price,
      quantity: marketItem.quantity,
      subtitle: marketItem.subtitle,
      description: marketItem.description,
      type: marketItem.type,
      seller: marketItem.seller,
    },
  });
});


// get all market plants

export const getAllMarketItems = catchError(async (req, res, next) => {
  // pagination
  const page = req.query.page || 1;
  const limit = 14;
  const skip = (page - 1) * limit;
  const userId = req.user.id;
  const wishList = await WishList.findOne({ user: userId }).select("items");

  const items = await MarketItem.find({
    isDeleted: false,
    quantity: { $gt: 0 },
  })
    .select("name image price quantity")
    .skip(skip)
    .limit(limit);
  if (!wishList) {
    return res.status(SUCCESS).json({
      results: items.length,
      data: items.map((item) => ({
        ...item.toObject(),
        isFavorite: false,
      })),
    });
  }
  const finalItems = items.map((item) => {
    const isFavorite =
      wishList &&
      wishList.items.some(
        (wishListItem) => wishListItem.toString() === item._id.toString(),
      );
    return {
      ...item.toObject(),
      isFavorite,
    };
  });
  res.status(SUCCESS).json({
    results: items.length,
    data: finalItems,
  });
});

// get plant by id
export const getMarketItemById = catchError(async (req, res, next) => {
  const item = await MarketItem.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).populate("seller", "name profilePic");

  if (!item) {
    const err = new Error("Plant not found");
    err.statusCode = NOT_FOUND;
    return next(err);
  }

  res.status(SUCCESS).json({
    data: item,
  });
});

// edit plant
export const updateMarketItem = catchError(async (req, res, next) => {
  const item = await MarketItem.findById(req.params.id);

  if (!item || item.isDeleted) {
    return next(new Error("Plant not found"));
  }

  if (item.seller.toString() !== req.user.id.toString()) {
    const err = new Error("You are not allowed to update this plant");
    err.statusCode = UNAUTHORIZED;
    return next(err);
  }

  Object.assign(item, req.body);
  await item.save();

  res.status(SUCCESS).json({
    message: "Plant updated successfully!",
    data: item,
  });
});

// delete plant
export const deleteMarketItem = catchError(async (req, res, next) => {
  const item = await MarketItem.findById(req.params.id);

  if (!item || item.isDeleted) {
    const err = new Error("Plant not found");
    err.statusCode = NOT_FOUND;
    return next(err);
  }

  if (item.seller.toString() !== req.user.id.toString()) {
    const err = new Error("You are not allowed to delete this plant");
    err.statusCode = UNAUTHORIZED;
    return next(err);
  }

  item.isDeleted = true;
  item.deletedAt = new Date();
  await item.save();

  return res.status(200).json({
    success: true,
    message: "Plant deleted successfully!",
  });
});

// export const deleteMarketItem = catchError(async (req, res, next) => {
//   const item = await MarketItem.findById(req.params.id);

//   if (!item || item.isDeleted) {
//     const err = new Error("Plant not found or already deleted");
//     err.statusCode = NOT_FOUND;
//     return next(err);
//   }

//   if (item.seller.toString() !== req.user._id.toString()) {
//     const err = new Error("You are not allowed to delete this plant");
//     err.statusCode = UNAUTHORIZED;
//     return next(err);
//   }

//   item.isDeleted = true;
//   await item.save();

//   return res.status(SUCCESS).json({
//     success: true,
//     message: "Plant deleted successfully",
//   });
// });
