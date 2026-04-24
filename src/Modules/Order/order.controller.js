import MarketItem from "../../../DB/Models/marketItem/marketItem.model.js";
import Order from "../../../DB/Models/Order/order.model.js";
import { catchError } from "../../Utils/catchError.js";
import { CREATED, NOT_FOUND, SUCCESS ,BAD_REQUEST } from "../../Utils/statusCodes.js";
import Cart from "../../../DB/Models/Cart/Cart.model.js";
import PaymentService from "../../services/payment.service.js";

export const createOrder = catchError(async (req, res) => {
  const cart = await Cart.findOne({ buyer: req.user.id }).populate("items.plant");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty!" });
  }

  const { address, paymentMethod } = req.body;
  const shippingRates = { "Cairo": 50, "Giza": 50, "Sharkia": 80, "Alexandria": 100 };
  const deliveryFee = shippingRates[address.governorate] || 100;

  let subTotal = 0;
  const itemsToPull = [];
  let sellerId = null;
  const orderItems = [];

  for (const item of cart.items) {
    if (!item.plant) continue;
const plantSellerString = item.plant.seller.toString();
if (!sellerId) {
      sellerId = plantSellerString;
    }
   else if (sellerId !== plantSellerString) {
      return res.status(BAD_REQUEST).json({ message: "All items you selected must be from the same seller!" });
    }
    const currentPrice = Number(item.plant.price);
    subTotal += currentPrice * item.quantity;

    orderItems.push({
      plant: item.plant._id,
      quantity: item.quantity,
      price: currentPrice
    });
    itemsToPull.push(item.plant._id);
  }

  const order = await Order.create({
    buyer: req.user.id,
    seller: sellerId,
    items: orderItems,
    address,
    paymentMethod,
    subTotal,
    deliveryFee,
    totalPrice: subTotal + deliveryFee,
    paymentStatus: 'PENDING',
    orderStatus: 'PROCESSING',
    orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000)
  });


  await Cart.findOneAndUpdate({ buyer: req.user.id }, { $pull: { items: { plant: { $in: itemsToPull } } } });

  const paymentResult = await PaymentService.processPayment(order, paymentMethod);

  res.status(CREATED).json({ success: true, message: paymentResult.message, orderId: order._id, clientSecret: paymentResult.clientSecret });
});

export const restoreCart = catchError(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(NOT_FOUND).json({ message: "Order not found!" });
  } 
   if (order.buyer.toString() !== req.user.id) {
    return res.status(NOT_FOUND).json({ message: "Order not found!" });
  } 
   if (order.paymentStatus !== "PENDING") {
    return res.status(BAD_REQUEST).json({ message: `canot restore cart for status ${order.paymentStatus}` });
  } 
 const itemsToRestore = order.items.map(item => ({
    plant: item.plant,
    quantity: item.quantity
  }));
  const cart = await Cart.findOne({ buyer: req.user.id });
  if (!cart) {
    await Cart.create({ buyer: req.user.id, items: itemsToRestore });
  } else {
    cart.items.push(...itemsToRestore);
    await cart.save();
  }
    
    res.status(SUCCESS).json({ success: true, message: "Items restored to cart successfully!" });
  
});
export const getMyOrders = catchError(async (req, res) => {
  const orders = await Order.find({ buyer: req.user.id })
    .select("orderNumber totalPrice createdAt items") 
    .populate({
      path: "items.plant",
      select: "name image -_id" 
    });

  res.status(SUCCESS).json({
    results: orders.length,
    data: orders
  });
});
 
export const getOrderDetails = catchError(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(id)
    .select("orderNumber createdAt paymentMethod subTotal deliveryFee totalPrice address items")
    .populate("buyer", "name phone");

  if (!order) return res.status(NOT_FOUND).json({ message: "Order not found!" });

  if(order.buyer._id.toString() !== userId){
    return res.status(NOT_FOUND).json({ message: "Order not found!" });
  }

  const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

  res.status(SUCCESS).json({
    data: { ...order._doc,   
      totalItemsCount}
  });
});

export const getMyRequests = catchError(async (req, res) => {
  const orders = await Order.find({ seller: req.user.id })
    .select("orderNumber totalPrice createdAt items buyer") 
    .populate({
      path: "items.plant",
      select: "name image -_id" 
    })
    .populate({
      path: "buyer",
      select: "name -_id" 
    });
  res.status(SUCCESS).json({
    results: orders.length,
    data: orders
  });
});

export const getRequestDetails = catchError(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({ _id: id, seller: req.user.id })
    .select("orderNumber createdAt paymentMethod subTotal deliveryFee totalPrice address items")

  if (!order) return res.status(NOT_FOUND).json({ message: "Request not found!" });

  const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

  res.status(SUCCESS).json({
    data: { 
      ...order._doc,   
      totalItemsCount
    }
  });
});