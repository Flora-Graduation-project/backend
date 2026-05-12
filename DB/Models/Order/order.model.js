import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        plant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MarketItem",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        plantName: String, // بنخزن اسم النبته وقت الطلب عشان لو البائع غير السعر او حذف النبته نقدر نعرض للباير المعلومات اللي كان شايفها وقت الطلب
        plantImage: String, // نفس الكلام بالنسبة للصورة
      },
      {_id: false}
    ],
    address: {
      type: {
        fullName: String,
        phone: String,
        country: String,
        governorate: String,
        fullAddress: String,
        zipCode: String,
      },
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["visa", "cash", "wallet"],
      required: true,
    },
    subTotal: Number,      
    deliveryFee: Number,   
    totalPrice: Number,    

    orderNumber: {         
      type: String,
      unique: true,
    },
    paymentStatus: { // حاله الدفع
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    orderStatus: { // علشان لو اليوزر دفع بس البائع ملقاش عنده النبته او حصلت مشكلة في الشحن فيرجعله الفلوس
      type: String,
      enum: ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PROCESSING",
    },
    stripePaymentIntentId: String, // لما ستريب تبعتلي ان الاوردر اتدفع اعرف دا انهي اوردر ,  مش يونيك لان ممكن الدفع يكون كاش
    orderGroup: { type: String }// لو اليوزر دفع اكتر من اوردر في نفس الوقت عشان يوفصلهم عن بعض في الستريب  
  },
  { 
    timestamps: true 
  }
);
export default mongoose.model("Order", orderSchema);
