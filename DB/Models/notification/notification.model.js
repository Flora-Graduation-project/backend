
import mongoose from 'mongoose';

export const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    },
    message: {
    type: String,
    required: true, 
    },
    isRead: {
    type: Boolean,
    default: false,
    },
    isPlant : {
    type: Boolean,
    default: false,
    },
    plantId: {
        type:mongoose.Schema.Types.ObjectId,
        ref :"MarketItem",
    },
    orderId: {
        type:mongoose.Schema.Types.ObjectId,
        ref :"Order",
    },
},{ timestamps: true });


export const Notification = mongoose.model('Notification', notificationSchema);