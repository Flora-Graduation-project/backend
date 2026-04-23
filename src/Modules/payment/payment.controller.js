import Stripe from "stripe";
import dotenv from "dotenv";
import { catchError } from "../../Utils/catchError.js";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createPaymentIntent = catchError(async (req, res, next) => {
  const { amount } = req.body;

  // بنعمل "نية دفع" بمبلغ معين وعملة معينة
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // سترايب بيحسب بالقرش
    currency: "egp", 
    automatic_payment_methods: { enabled: true },
    metadata: { 
        userId: req.user.id.toString() 
    }, 
  });

  // الرد اللي فلاتر مستنياه
  res.status(200).json({
    message: "Success",
    clientSecret: paymentIntent.client_secret,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});