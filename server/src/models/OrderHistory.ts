import mongoose, { Document, Schema } from "mongoose";

export interface IOrderHistory extends Document {
  user: mongoose.Types.ObjectId;
  orders: mongoose.Types.ObjectId[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  favoriteCategories: mongoose.Types.ObjectId[];
  frequentlyPurchasedBooks: {
    book: mongoose.Types.ObjectId;
    count: number;
  }[];
}

const OrderHistorySchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    favoriteCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    frequentlyPurchasedBooks: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Phương thức để cập nhật lịch sử khi có đơn hàng mới
OrderHistorySchema.statics.updateHistoryWithNewOrder = async function (
  userId: mongoose.Types.ObjectId,
  orderId: mongoose.Types.ObjectId,
  orderAmount: number,
  orderItems: any[]
) {
  try {
    // Tìm lịch sử đơn hàng của người dùng
    let history = await this.findOne({ user: userId });

    // Nếu chưa có, tạo mới
    if (!history) {
      history = new this({
        user: userId,
        orders: [],
        totalOrders: 0,
        totalSpent: 0,
      });
    }

    // Cập nhật thông tin
    history.orders.push(orderId);
    history.totalOrders += 1;
    history.totalSpent += orderAmount;
    history.lastOrderDate = new Date();

    // Cập nhật sách mua thường xuyên
    for (const item of orderItems) {
      const existingBookIndex = history.frequentlyPurchasedBooks.findIndex(
        (b) => b.book.toString() === item.book.toString()
      );

      if (existingBookIndex > -1) {
        // Nếu sách đã có trong danh sách, tăng số lượng
        history.frequentlyPurchasedBooks[existingBookIndex].count +=
          item.quantity;
      } else {
        // Nếu sách chưa có, thêm vào danh sách
        history.frequentlyPurchasedBooks.push({
          book: item.book,
          count: item.quantity,
        });
      }
    }

    // Sắp xếp theo số lượng mua
    history.frequentlyPurchasedBooks.sort((a, b) => b.count - a.count);

    // Giới hạn số lượng sách hay mua nhất
    if (history.frequentlyPurchasedBooks.length > 10) {
      history.frequentlyPurchasedBooks = history.frequentlyPurchasedBooks.slice(
        0,
        10
      );
    }

    // Lưu lại
    await history.save();
    return history;
  } catch (error) {
    console.error("Error updating order history:", error);
    throw error;
  }
};

export default mongoose.model<IOrderHistory>(
  "OrderHistory",
  OrderHistorySchema
);
