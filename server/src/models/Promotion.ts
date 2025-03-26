import mongoose from "mongoose";

export interface IPromotion {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  applicableCategories?: mongoose.Types.ObjectId[];
  applicableBooks?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new mongoose.Schema<IPromotion>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicableBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Phương thức kiểm tra xem mã khuyến mãi có hợp lệ không
promotionSchema.methods.isValid = function (): boolean {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === undefined || this.usageCount < this.usageLimit)
  );
};

// Phương thức tính toán giá trị giảm giá
promotionSchema.methods.calculateDiscount = function (
  totalAmount: number
): number {
  if (!this.isValid() || totalAmount < this.minPurchase) {
    return 0;
  }

  let discount = 0;
  if (this.type === "percentage") {
    discount = totalAmount * (this.value / 100);
    if (this.maxDiscount !== undefined && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.value;
  }

  return discount;
};

const Promotion = mongoose.model<IPromotion>("Promotion", promotionSchema);

export default Promotion;
