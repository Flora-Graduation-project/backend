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
      },
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
  },
  { timestamps: true }
);
export default mongoose.model("Order", orderSchema);
