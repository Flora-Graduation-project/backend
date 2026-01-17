import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        plant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MarketItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Only add the items.plant index since buyer already has unique constraint
cartSchema.index({ "items.plant": 1 }); // 1 means ascending order

// Method to calculate total price of the cart

cartSchema.methods.calculateTotalPrice = async function () {
  await this.populate("items.plant", "price");
  let total = 0;
  for (const item of this.items) {
    if (item.plant && item.plant.price) {
      total += item.plant.price * item.quantity;
    }
  }
  this.totalPrice = total;
  return total;
};

export default mongoose.model("carts", cartSchema);
