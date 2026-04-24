import Stripe from 'stripe';
import Order from '../../DB/Models/Order/order.model.js';
import MarketItem from '../../DB/Models/marketItem/marketItem.model.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 

export const handleStripeWebhook = async (req, res) => {
 
  const sig = req.headers['stripe-signature'];
  let event;

  try {
   
    // الخطوة دي بتتأكد إن الريكويست ده جاي من Stripe بجد مش من هاكر
    // لاحظ إن req.body هنا لازم يكون Raw Buffer مش JSON عادي
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    // لو التوقيع غلط، بنقفل في وش الهاكر ونرد بـ 400
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  // Stripe بتبعت أحداث كتير (دفع نجح، كارت اترفض، الخ). إحنا مهتمين بالنجاح بس دلوقتي.
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
   //console.log(paymentIntent);
    // فاكر لما حطينا الـ orderId جوة الـ metadata في الكنترولر اللي فات؟ هنجيبه من هنا!

   // ---------------------------------------------------------------------------------------------------
   // const orderId = paymentIntent.metadata.orderId; 
    const orderId = "69ebfcf80ba46eda7bb37c61";
//------------------------------------------------------------------------------------------------------

    console.log(`Payment successfully processed for order: ${orderId}`);

    // 4. تحديث حالة الطلب في الداتا بيز
    try {
    const order=  await Order.findOne({_id: orderId});
      if (!order) {
        return res.status(404).json({ message: "Order not found for this payment intent." });
      }
      order.paymentStatus = "PAID";
       order.orderStatus ='PROCESSING' ;
      await order.save();
const stockUpdates = order.items.map(async (item) => {
        return await MarketItem.findByIdAndUpdate(
          item.plant, 
          { $inc: { quantity: -item.quantity } }, // $inc بـ بالسالب يعني اطرح
          { new: true }
        );
      });

      await Promise.all(stockUpdates);

      console.log(`Order ${orderId} marked as PAID and stock updated.`);
      
    } catch (dbError) {
      console.error("error in updating order status:", dbError);
    }
  }


  // لازم دايماً نرد بـ 200 بسرعة جداً عشان Stripe تعرف إننا استلمنا الإشعار ومتبعتوش تاني
  res.status(200).json({ received: true });
};
