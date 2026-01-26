import wishListModel from "../../../DB/Models/wishList/wishList.model.js";
import { catchError } from "../../Utils/catchError.js";
import {
  NOT_FOUND,
  BAD_REQUEST,
  CREATED,
  SUCCESS
} from "../../Utils/statusCodes.js";
import MarketItem from "../../../DB/Models/marketItem/marketItem.model.js";

export const addToWishList = catchError(async (req, res, next) => {
    const userId = req.user.id;
    const  itemId  = req.body.itemId;
    const item = await MarketItem.findById(itemId);
    if (!item || item.isDeleted) {
      const err = new Error("Item not found or has been deleted");
      err.statusCode = NOT_FOUND;
      return next(err);
    }
    let wishList = await wishListModel.findOne({user:userId});
    if(!wishList) {
       wishList = wishListModel.create({user:userId})
    }
    if(!wishList.items.includes(itemId)){
wishList.items.push(itemId);
await wishList.save();
    }
    else{
     const err = new Error("item already exist in wishlist!");
      err.statusCode = BAD_REQUEST;
      return next(err);
      }

      return res.status(CREATED).json({
      status: "SUCCESS",
      message: "product added to wishlist successfully",
      wishList
    });
});

export const getWishList = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const wishList = await wishListModel.findOne({user:userId}).populate("items",{"image":1,"price":1,"name":1,"subtitle":1});
  if(!wishList){
    const err = new Error("No wishlist found for this user");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  return res.status(SUCCESS).json({
    status: "SUCCESS",
    message: "wishlist retrieved successfully",
    wishList
  });
});

export const removeFromWishList = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const itemId = req.body.itemId;
  const wishList = await wishListModel.findOne({user:userId});
  if(!wishList ){
    const err = new Error(" Wishlist Is Empty");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  const itemIndex = wishList.items.indexOf(itemId);
  if(itemIndex == -1){
    const err = new Error("Item not found in wishlist");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  wishList.items.splice(itemIndex, 1);
  await wishList.save();
  return res.status(SUCCESS).json({
    status: "SUCCESS",
    message: "Item removed from wishlist successfully",
    wishList
  });
});

export const moveToCartFromWishList = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const itemId = req.body.itemId;
  const wishList = await wishListModel.findOne({user:userId});
  if(!wishList ){
    const err = new Error(" Wishlist Is Empty");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  const itemIndex = wishList.items.indexOf(itemId);
  if(itemIndex == -1){
    const err = new Error("Item not found in wishlist");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  wishList.items.splice(itemIndex, 1);
  await wishList.save();
  req.body.itemId = itemId; // set itemId in req.body for cart controller
  next(); // proceed to the next middleware (cart controller) 
});