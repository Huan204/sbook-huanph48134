import mongoose, { Document, Schema } from "mongoose";

// Interface cho item trong giỏ hàng
interface CartItem {
  bookId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  image: string;
  quantity: number;
  discount?: number;
}

// Interface cho Cart document
export interface ICart extends Document {
  deviceId: string;
  userId?: mongoose.Types.ObjectId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho item trong giỏ hàng
const CartItemSchema = new Schema<CartItem>({
  bookId: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  discount: {
    type: Number,
  },
});

// Schema cho Cart
const CartSchema = new Schema<ICart>(
  {
    deviceId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Tạo index cho deviceId và userId
CartSchema.index({ deviceId: 1 });
CartSchema.index({ userId: 1 });

// Tạo model
const Cart = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
