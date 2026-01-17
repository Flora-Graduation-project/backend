import { catchError } from "../../Utils/catchError";
import Cart from "../../DB/Models/User/Cart/Cart.model.js";
import {
  NOT_FOUND,
  BAD_REQUEST,
  SUCCESS,
  CREATED,
} from "../../Utils/statusCodes.js";
import Plant from "../../DB/Models/Plant/Plant.model.js";

export const addToCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { plantId, quantity = 1 } = req.body;
  const plant = await Plant.findById(plantId);
  if (!plant || plant.isDeleted) {
    const err = new Error("Plant not found or has been deleted");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  if (plant.stock < quantity) {
    const err = new Error(`Only ${plant.stock} items left in stock`);
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
    (item) => item.plant.toString() === plantId
  );
  if (itemIndex > -1) {
    if (cart.items[itemIndex].quantity + quantity > plant.stock) {
      const err = new Error(
        `Cannot add ${quantity} items. Only ${
          plant.stock - cart.items[itemIndex].quantity
        } more items can be added to the cart`
      );
      err.statusCode = BAD_REQUEST;
      return next(err);
    }
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ plant: plantId, quantity });
  }
  await cart.calculateTotalPrice();
  await cart.save();
  return res.status(SUCCESS).json({
    success: true,
    message: "Item added to cart successfully",
    cart,
  });
});

export const getCart = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ buyer: userId, deleted: false }).populate([
    { path: "items.plant", select: "name price images" },
    { path: "buyer", select: "name profilePic" },
  ]);
  if (!cart) {
    return res.status(SUCCESS).json({
      success: true,
      message: "Cart is empty",
      cart: null,
    });
  }
  await cart.calculateTotalPrice();
  await cart.save();
  return res.status(SUCCESS).json({
    success: true,
    message: "Cart retrieved successfully",
    cart,
  });
});

export const updateCartItem = catchError(async (req, res, next) => {
  const userId = req.user.id;
  const { plantId, quantity } = req.body;
  if (quantity < 1) {
    const err = new Error("Quantity must be at least 1");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  const cart = await Cart.findOne({ buyer: userId, deleted: false }).populate([
    { path: "items.plant", select: "name price images" },
    { path: "buyer", select: "name profilePic" },
  ]);
  if (!cart) {
    const err = new Error("Cart not found");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  const itemIndex = cart.items.findIndex(
    (item) => item.plant.toString() === plantId
  );
  if (itemIndex === -1) {
    const err = new Error("Item not found in cart");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  const plant = await Plant.findById(plantId);
  if (!plant || plant.isDeleted) {
    const err = new Error("Plant not found or has been deleted");
    err.statusCode = NOT_FOUND;
    return next(err);
  }
  if (quantity > cart.items[itemIndex].plant.stock) {
    const err = new Error(
      "Only " + cart.items[itemIndex].plant.stock + " items left in stock"
    );
    err.statusCode = BAD_REQUEST;
    return next(err);
  }
  cart.items[itemIndex].quantity = quantity;
  await cart.calculateTotalPrice();
  await cart.save();
  return res.status(SUCCESS).json({
    success: true,
    message: "Item updated in cart successfully",
    cart,
  });
});

export const removeCartItem = catchError(async (req, res, next) => {});

export const clearCart = catchError(async (req, res, next) => {});
