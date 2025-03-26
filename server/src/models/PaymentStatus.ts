import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentStatus extends Document {
  order: mongoose.Types.ObjectId;
  status: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentProvider?: string;
  timestamp: Date;
  updatedBy: mongoose.Types.ObjectId;
  note?: string;
  paymentDetails?: Record<string, any>;
}

const PaymentStatusSchema: Schema = new Schema(
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
        "Chờ thanh toán", // Chưa thanh toán
        "Đang xử lý", // Đang xử lý thanh toán
        "Thanh toán thành công", // Đã thanh toán
        "Thanh toán thất bại", // Thanh toán thất bại
        "Hoàn tiền một phần", // Hoàn tiền một phần
        "Hoàn tiền toàn bộ", // Hoàn tiền toàn bộ
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Thanh toán khi nhận hàng",
        "Thẻ tín dụng",
        "Chuyển khoản ngân hàng",
        "Ví điện tử",
      ],
    },
    transactionId: {
      type: String,
    },
    paymentProvider: {
      type: String,
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
    paymentDetails: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPaymentStatus>(
  "PaymentStatus",
  PaymentStatusSchema
);
