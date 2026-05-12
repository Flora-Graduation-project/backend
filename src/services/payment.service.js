import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import Order from '../../DB/Models/Order/order.model.js';

class PaymentService {
  
  // دالة رئيسية بتحدد هندفع إزاي
  static async processPayment({ amount, paymentMethod, orderGroupId }) {
    if (paymentMethod === 'visa') {
      return await this.#processStripe({ amount: amount, orderGroupId: orderGroupId });
    } 
    else if (paymentMethod === 'cash') {
      return await this.#processCash({ amount: amount, orderGroupId: orderGroupId });
    }
    else {
      throw new Error("method not supported");
    }
  }

  // دالة خاصة بـ Stripe (Private Method)
  static async #processStripe(  { amount, orderGroupId } ) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // بالقروش
      currency: 'egp',
      metadata: { orderGroupId: orderGroupId }, // بنبعت الجروب عشان نعرف نحدث كل الأوردرز اللي في نفس الجروب لما ييجي الرد من الستريب
    });

    // بنحدث الأوردر بالـ ID بتاع سترايب
    await Order.updateMany(
        { orderGroup: orderGroupId },
        { $set: { stripePaymentIntentId: paymentIntent.id } }
      );

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      message: "Payment processed successfully with Visa"
    };
  }

  // دالة خاصة بالكاش
  static async #processCash(  { amount, orderGroupId } ) {
    // في الكاش مش بنعمل حاجة معقدة، بس بنجهز الرد
    return {
      success: true,
      clientSecret: null,
      message: "Order confirmed, payment upon delivery"
    };
  }
}

export default PaymentService;