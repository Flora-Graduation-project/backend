import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import Order from "../../DB/Models/Order/order.model.js";
import MarketItem from "../../DB/Models/marketItem/marketItem.model.js";
import Cart from "../../DB/Models/Cart/Cart.model.js";
import { User } from "../../DB/Models/User/user.model.js";
import { Notification } from "../../DB/Models/notification/notification.model.js";

class PaymentService {
  // دالة رئيسية بتحدد هندفع إزاي
  static async processPayment({ amount, paymentMethod, orderGroupId }) {
    if (paymentMethod === "visa") {
      return await this.#processStripe({
        amount: amount,
        orderGroupId: orderGroupId,
      });
    } else if (paymentMethod === "cash") {
      return await this.#processCash({
        amount: amount,
        orderGroupId: orderGroupId,
      });
    } else {
      throw new Error("method not supported");
    }
  }

  // دالة خاصة بـ Stripe (Private Method)
  static async #processStripe({ amount, orderGroupId }) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // بالقروش
      currency: "egp",
      metadata: { orderGroupId: orderGroupId }, // بنبعت الجروب عشان نعرف نحدث كل الأوردرز اللي في نفس الجروب لما ييجي الرد من الستريب
    });

    // بنحدث الأوردر بالـ ID بتاع سترايب
    await Order.updateMany(
      { orderGroup: orderGroupId },
      { $set: { stripePaymentIntentId: paymentIntent.id } },
    );

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      message: "Payment processed successfully with Visa",
    };
  }

  // دالة خاصة بالكاش
  static async #processCash({ amount, orderGroupId }) {
    // في الكاش مش بنعمل حاجة معقدة، بس بنجهز الرد
    const ordersToUpdate = await Order.find({ orderGroup: orderGroupId });
    if (ordersToUpdate.length === 0) {
      throw new Error("No orders found for the given order group ID");
    }
    await Order.updateMany(
      { orderGroup: orderGroupId },
      { $set: { paymentStatus: "PAID", stripePaymentIntentId: null } },
    );
    const stockUpdated = [];
    let buyerId = null;

    ordersToUpdate.forEach((order) => {
      buyerId = order.buyer; // كل الأوامر في نفس الجروب ليها نفس البايير
      order.items.forEach((item) => {
        stockUpdated.push(
          MarketItem.findByIdAndUpdate(
            item.plant,
            { $inc: { quantity: -item.quantity } },
            { new: true },
          ),
        );
      });
    });
    const NotificationsToCreate = [];
    const buyerUser = buyerId
      ? await User.findById(buyerId).select("name").lean()
      : null;
    const buyerName = buyerUser ? buyerUser.name : "Unknown Buyer";
    ordersToUpdate.forEach((order) => {
      const sellerId = order.seller;
      NotificationsToCreate.push({
        recipient: sellerId,
        title: "New Order Received",
        message: `You have received a new order from '${buyerName}'. The order is now in PROCESSING status.`,
        orderId: order._id, // إذا كنتِ تريدين ربطه بالأوردر
      });
    });

    await Promise.all([
      ...stockUpdated,
      Notification.insertMany(NotificationsToCreate),
    ]);
    if (buyerId) {
      await Cart.findOneAndUpdate(
        { buyer: buyerId },
        { $set: { items: [], totalPrice: 0 } },
      );
    }

    return {
      success: true,
      clientSecret: null,
      message: "Order confirmed, payment upon delivery",
    };
  }
}

export default PaymentService;
