import mongoose, { Document, Schema } from "mongoose";

export interface IOrderStatus extends Document {
  order: mongoose.Types.ObjectId;
  status: string;
  description: string;
  timestamp: Date;
  updatedBy: mongoose.Types.ObjectId;
  note?: string;
}

const OrderStatusSchema: Schema = new Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Đã đặt hàng", // Đơn hàng mới tạo
        "Đã xác nhận", // Cửa hàng đã xác nhận đơn hàng
        "Đang chuẩn bị", // Đang chuẩn bị hàng
        "Đang giao hàng", // Đã giao cho đơn vị vận chuyển
        "Đã giao hàng", // Đã giao thành công
        "Đã hoàn thành", // Đơn hàng hoàn tất (khách hàng đã nhận)
        "Đã hủy", // Đơn hàng bị hủy
        "Giao hàng thất bại", // Giao hàng không thành công
      ],
    },
    description: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrderStatus>("OrderStatus", OrderStatusSchema);
