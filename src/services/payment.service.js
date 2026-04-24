import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  
  // دالة رئيسية بتحدد هندفع إزاي
  static async processPayment(order, paymentMethod) {
    if (paymentMethod === 'visa') {
      return await this.#processStripe(order);
    } 
    else if (paymentMethod === 'cash') {
      return await this.#processCash(order);
    }
    else {
      throw new Error("method not supported");
    }
  }

  // دالة خاصة بـ Stripe (Private Method)
  static async #processStripe(order) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalPrice * 100, // بالقروش
      currency: 'egp',
      metadata: { orderId: order._id.toString() },
    });

    // بنحدث الأوردر بالـ ID بتاع سترايب
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      message: "Payment processed successfully with Visa"
    };
  }

  // دالة خاصة بالكاش
  static async #processCash(order) {
    // في الكاش مش بنعمل حاجة معقدة، بس بنجهز الرد
    return {
      success: true,
      clientSecret: null,
      message: "Order confirmed, payment upon delivery"
    };
  }
}

export default PaymentService;