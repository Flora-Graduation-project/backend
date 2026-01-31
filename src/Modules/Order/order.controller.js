import MarketItem from "../../../DB/Models/marketItem/marketItem.model.js";
import Order from "../../../DB/Models/Order/order.model.js";
import { catchError } from "../../Utils/catchError.js";
import { CREATED, NOT_FOUND, SUCCESS ,BAD_REQUEST } from "../../Utils/statusCodes.js";
import Cart from "../../../DB/Models/Cart/Cart.model.js";

// export const confirmOrder = catchError(async (req, res) => {
//   const { items, address, paymentMethod } = req.body;

//   const shippingRates = {
//     "Cairo": 50, "Giza": 50, "Sharkia": 80, "Alexandria": 100
//   };
//   const deliveryFee = shippingRates[address.governorate] || 100;

//   let subTotal = 0;
//   let sellerId = null;
//   const orderItems = [];

//   for (const item of items) {
//     const plant = await MarketItem.find({_id:item.plant, isDeleted:false});
//     if (!plant) {
//       return res.status(NOT_FOUND).json({ message: "Plant not found!" });
//     }

//     if (plant.quantity < item.quantity) {
//       return res.status(BAD_REQUEST).json({ 
//         message: `Sorry, only ${plant.quantity} items left of ${plant.name}` 
//       });
//     }

//     subTotal += plant.price * item.quantity;
//     sellerId = plant.seller;

//     orderItems.push({
//       plant: plant._id,
//       quantity: item.quantity,
//       price: plant.price,
//     });
//   }

//   const totalPrice = subTotal + deliveryFee;
//   const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

//   const order = await Order.create({
//     buyer: req.user.id,
//     seller: sellerId,
//     items: orderItems,
//     address,
//     paymentMethod,
//     subTotal,
//     deliveryFee,
//     totalPrice,
//     orderNumber
//   });

//   for (const item of items) {
//     await MarketItem.findByIdAndUpdate(item.plant, {
//       $inc: { quantity: -item.quantity }
//     });
//   }

//   await Cart.findOneAndDelete({ buyer: req.user.id });

//   const populatedOrder = await Order.findById(order._id)
//     .populate("seller", "name") 
//     .populate("items.plant", "name");

//   res.status(CREATED).json({
//     message: "Order confirmed successfully and cart cleared!",
//     data: populatedOrder,
//   });
// });

export const confirmOrder = catchError(async (req, res) => {
  const cart = await Cart.findOne({ buyer: req.user.id }).populate("items.plant");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty!" });
  }

  const { address, paymentMethod } = req.body;
  const shippingRates = { "Cairo": 50, "Giza": 50, "Sharkia": 80, "Alexandria": 100 };
  const deliveryFee = shippingRates[address.governorate] || 100;

  let subTotal = 0;
  let sellerId = null;
  const orderItems = [];

  for (const item of cart.items) {
    if (!item.plant) continue;

    const currentPrice = Number(item.plant.price);
    subTotal += currentPrice * item.quantity;
    
    if (!sellerId) sellerId = item.plant.seller;

    orderItems.push({
      plant: item.plant._id,
      quantity: item.quantity,
      price: currentPrice
    });
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
    orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000)
  });

  await Cart.findOneAndDelete({ buyer: req.user.id });

  res.status(201).json({ success: true, message: "Order confirmed successfully from cart!", data: order });
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