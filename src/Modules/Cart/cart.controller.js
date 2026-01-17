import { catchError } from "../../Utils/catchError.js";
import Cart from "../../../DB/Models/Cart/Cart.model.js";
import {
  NOT_FOUND,
  BAD_REQUEST,
  SUCCESS,
} from "../../Utils/statusCodes.js";
import MarketItem from "../../../DB/Models/marketItem/marketItem.model.js";

export const addToCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { itemId, quantity = 1 } = req.body;
  const item = await MarketItem.findById(itemId);
  if (!item || item.isDeleted) {
    const err = new Error("Item not found or has been deleted");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  if (item.quantity < quantity) {
    const err = new Error(`Only ${item.quantity} items left in stock`);
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  let cart = await Cart.findOne({ buyer: userId, deleted: false });
  if (!cart) {
    cart = await Cart.create({ buyer: userId, items: [] });
  }
  /* t searches through the array and returns the index of the first element that matches the condition.
If no element matches, it returns -1 */

  const itemIndex = cart.items.findIndex(
    (item) => item.plant.toString() === itemId,
  );
  if (itemIndex > -1) {
    if (cart.items[itemIndex].quantity + quantity > item.quantity) {
      const err = new Error(`You can add up to ${item.quantity} items only.`);
      err.statusCode = BAD_REQUEST;
      return next(err);
    }
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ plant: itemId, quantity });
  }
  await cart.calculateTotalPrice();
  await cart.save();
  await cart.populate({
    path: "items.plant",
    select: "name price image subtitle",
  });
  return res.status(SUCCESS).json({
    success: true,
    message: "Item added to cart successfully",
    cart,
  });
});

export const getCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ buyer: userId, deleted: false });
  if (!cart) {
    return res.status(SUCCESS).json({
      success: true,
      message: "Cart is empty",
      cart: null,
    });
  }
  await cart.calculateTotalPrice();
  await cart.save();
  await cart.populate({
    path: "items.plant",
    select: "name price image subtitle",
  });
  return res.status(SUCCESS).json({
    success: true,
    message: "Cart retrieved successfully",
    cart,
  });
});

export const updateCartItem = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { itemId, quantity } = req.body;
  if (quantity < 1) {
    const err = new Error("Quantity must be at least 1");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  const cart = await Cart.findOne({ buyer: userId, deleted: false });
  if (!cart) {
    const err = new Error("Cart not found");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  const itemIndex = cart.items.findIndex(
    (item) => item.plant.toString() === itemId,
  );
  if (itemIndex === -1) {
    const err = new Error("Item not found in cart");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  const plant = await MarketItem.findById(itemId);
  if (!plant || plant.isDeleted) {
    const err = new Error("Plant not found or has been deleted");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  if (quantity > plant.quantity) {
    const err = new Error(`Only ${plant.quantity} items left in stock`);
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  cart.items[itemIndex].quantity = quantity;
  await cart.calculateTotalPrice();
  await cart.save();
  await cart.populate({
    path: "items.plant",
    select: "name price image subtitle",
  });
  return res.status(SUCCESS).json({
    success: true,
    message: "Item updated in cart successfully",
    cart,
  });
});

export const removeCartItem = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { itemId } = req.body;
  const cart = await Cart.findOne({ buyer: userId, deleted: false });
  if (!cart) {
    const err = new Error("Cart not found");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  const itemIndex = cart.items.findIndex(
    (item) => item.plant.toString() === itemId,
  );
  if (itemIndex === -1) {
    const err = new Error("Item not found in cart");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  cart.items.splice(itemIndex, 1);
  await cart.calculateTotalPrice();
  await cart.save();
  await cart.populate({
    path: "items.plant",
    select: "name price image subtitle",
  });
  return res.status(SUCCESS).json({
    success: true,
    message: "Item removed from cart successfully",
    cart,
  });
});
