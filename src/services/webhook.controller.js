import Stripe from 'stripe';
import Order from '../../DB/Models/Order/order.model.js';
import MarketItem from '../../DB/Models/marketItem/marketItem.model.js';
import Cart from '../../DB/Models/Cart/Cart.model.js';
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
    const orderGroupId = paymentIntent.metadata.orderGroupId; // جاي من الكنترولر اللي عمل الطلب
  


    // 4. تحديث حالة الطلب في الداتا بيز
    try {
      const result = await Order.updateMany(
            { orderGroup: orderGroupId, paymentStatus: 'PENDING' },
            { 
                $set: { 
                    paymentStatus: 'PAID', 
                    orderStatus: 'PROCESSING' 
                } 
            }
        );
        if(result.matchedCount>0) {
          const orders = await Order.find({ orderGroup: orderGroupId });
          const stockUpdated = [];
          let buyerId = null;

         orders.forEach(order => {
            buyerId = order.buyer; // كل الأوامر في نفس الجروب ليها نفس البايير
            order.items.forEach(item => {
                stockUpdated.push(
                    MarketItem.findByIdAndUpdate(
                        item.plant, 
                        { $inc: { quantity: -item.quantity } }, 
                        { new: true }
                    )
                );
            });
          });

          await Promise.all(stockUpdated);
          if(buyerId) {
            await Cart.findOneAndUpdate(
              { buyer: buyerId },
              { $set: { items: [] ,totalPrice: 0} },
            );
          }
          console.log(`Order group ${orderGroupId} marked as PAID and stock updated.`);
        }
    } catch (err) {
      console.error(`Database update error for order group ${orderGroupId}: ${err.message}`);
      // لو حصلت مشكلة في تحديث الداتا بيز، ممكن نحتاج نعمل ريفاند أو نبلغ الدعم الفني
    }
    

  }
  // لازم دايماً نرد بـ 200 بسرعة جداً عشان Stripe تعرف إننا استلمنا الإشعار ومتبعتوش تاني
  res.status(200).json({ received: true });
};