import MarketItem from "../../../DB/Models/marketItem/marketItem.model.js";
import Order from "../../../DB/Models/Order/order.model.js";
import { catchError } from "../../Utils/catchError.js";
import {
  CREATED,
  NOT_FOUND,
  SUCCESS,
  BAD_REQUEST,
} from "../../Utils/statusCodes.js";
import Cart from "../../../DB/Models/Cart/Cart.model.js";
import PaymentService from "../../services/payment.service.js";
import mongoose from "mongoose";

export const createOrder = catchError(async (req, res) => {
  const cart = await Cart.findOne({ buyer: req.user.id }).populate(
    "items.plant",
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty!" });
  }

  const { address, paymentMethod } = req.body;
  const shippingRates = { Cairo: 50, Giza: 50, Sharkia: 80, Alexandria: 100 };
  const deliveryFee = shippingRates[address.governorate] || 100;

    await Order.deleteMany({ buyer: req.user.id, paymentStatus: "PENDING" });
  
  const sellerGroup = {};
  for (const item of cart.items) {
    if (!item.plant) {
      continue; // Skip if the plant is not found (might have been removed from the market)
    }
    const sellerId = item.plant.seller.toString();
    const currentPrice = Number(item.plant.price);
    if (!sellerGroup[sellerId]) {
      sellerGroup[sellerId] = { items: [], subtotal: 0 };
    }
    sellerGroup[sellerId].items.push({
      plant: item.plant._id,
      plantName: item.plant.name,
      plantImage: item.plant.image,
      quantity: item.quantity,
      price: currentPrice,
    });
    sellerGroup[sellerId].subtotal += currentPrice * item.quantity;
  }
  if (Object.keys(sellerGroup).length === 0) {
    await Cart.findOneAndUpdate(
      { buyer: req.user.id },
      { $set: { items: [] } },
    );
    return res
      .status(BAD_REQUEST)
      .json({ message: "plant you want to order is not available!" });
  }
  const createdOrdersIds = [];
  let grandTotal = 0;
  const orderGroupId = "GRP-" + Date.now();
  const orderPromises = [];
  for (const sellerId in sellerGroup) {
    const group = sellerGroup[sellerId];
    const ordertotal = group.subtotal + deliveryFee;
    grandTotal += ordertotal;
    const newOrder = new Order({
      buyer: req.user.id,
      seller: sellerId,
      items: group.items,
      address,
      paymentMethod,
      subTotal: group.subtotal,
      deliveryFee,
      totalPrice: ordertotal,
      orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      orderGroup: orderGroupId,
    });
    createdOrdersIds.push(newOrder._id);
   orderPromises.push(newOrder.save());

  }
  await Promise.all(orderPromises);
  const paymentResult = await PaymentService.processPayment({
    amount: grandTotal,
    paymentMethod,
    orderGroupId,
  });
  res.status(CREATED).json({
    success: true,
    message: "Order created successfully!",
    data: { orderGroupId, clientSecret: paymentResult.clientSecret },
  });
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
    return res.status(BAD_REQUEST).json({
      message: `canot restore cart for status ${order.paymentStatus}`,
    });
  }
  const itemsToRestore = order.items.map((item) => ({
    plant: item.plant,
    quantity: item.quantity,
  }));
  const cart = await Cart.findOne({ buyer: req.user.id });
  if (!cart) {
    await Cart.create({ buyer: req.user.id, items: itemsToRestore });
  } else {
    cart.items.push(...itemsToRestore);
    await cart.save();
  }

  res
    .status(SUCCESS)
    .json({ success: true, message: "Items restored to cart successfully!" });
});
export const getMyOrders = catchError(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  if (!userId) {
    return res.status(NOT_FOUND).json({ message: "User not found!" });
  }
  
  const orders = await Order.aggregate([
    { $match: { buyer: userId , paymentStatus: "PAID" } },
    { $group: {
        _id: "$orderGroup",
        totalPrice: { $sum: "$totalPrice" },
        createdAt: { $first: "$createdAt" },
      },
    },
      { $sort: { createdAt: 1 } },
      { $project: {
       _id: 0,
        orderGroup: "$_id",
        totalPrice: 1,
        createdAt: 1}}
  ])
   
  res.status(SUCCESS).json({
    results: orders.length,
    data: orders,
  });
});

export const getOrderDetails = catchError(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const orders = await Order.find({orderGroup: id,paymentStatus: "PAID"})
    .select(
      "orderGroup createdAt paymentMethod subTotal deliveryFee totalPrice address items",
    )
     .populate("buyer", " _id");
  if(orders.length === 0) {
    return res.status(NOT_FOUND).json({ message: "Order not found!" });
  }
    let itemsCount = 0;
    let price = 0;
    let deliveryFee = 0;
  for(let order of orders) {
    if (order.buyer._id.toString() !== userId) {
      return res.status(NOT_FOUND).json({ message: "Order not found!" });
    }
  
    itemsCount += order.items.reduce((acc, item) => acc + item.quantity, 0);
    price += order.totalPrice - order.deliveryFee; // بنجمع سعر المنتجات بس مش سعر التوصيل عشان ممكن البائعين يكونوا حاطين توصيل مجاني في بعض الأوامر 
    deliveryFee += order.deliveryFee; // بنجمع سعر التوصيل عشان نعرضه في التفاصيل
   
  }
const totalPrice = price + deliveryFee;
  res.status(SUCCESS).json({
    data: {
      address: orders[0].address,
     orderNumber: orders[0].orderGroup,
      createdAt: orders[0].createdAt,
      paymentMethod: orders[0].paymentMethod,
     price,
     itemsCount,
     deliveryFee,
     totalPrice,
    },
  });
});

export const getMyRequests = catchError(async (req, res) => {
  const orders = await Order.find({ seller: req.user.id })
    .select("orderNumber totalPrice createdAt items buyer")
    .populate({
      path: "items.plant",
      select: "name image -_id",
    })
    .populate({
      path: "buyer",
      select: "name -_id",
    });
  res.status(SUCCESS).json({
    results: orders.length,
    data: orders,
  });
});

export const getRequestDetails = catchError(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({ _id: id, seller: req.user.id }).select(
    "orderNumber createdAt paymentMethod subTotal deliveryFee totalPrice address items",
  );

  if (!order)
    return res.status(NOT_FOUND).json({ message: "Request not found!" });

  const totalItemsCount = order.items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  res.status(SUCCESS).json({
    data: {
      ...order._doc,
      totalItemsCount,
    },
  });
});
