"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderHistorySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique: true,
    },
    orders: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Category",
        },
    ],
    frequentlyPurchasedBooks: [
        {
            book: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Book",
            },
            count: {
                type: Number,
                default: 1,
            },
        },
    ],
}, {
    timestamps: true,
});
// Phương thức để cập nhật lịch sử khi có đơn hàng mới
OrderHistorySchema.statics.updateHistoryWithNewOrder = function (userId, orderId, orderAmount, orderItems) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Tìm lịch sử đơn hàng của người dùng
            let history = yield this.findOne({ user: userId });
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
                const existingBookIndex = history.frequentlyPurchasedBooks.findIndex((b) => b.book.toString() === item.book.toString());
                if (existingBookIndex > -1) {
                    // Nếu sách đã có trong danh sách, tăng số lượng
                    history.frequentlyPurchasedBooks[existingBookIndex].count +=
                        item.quantity;
                }
                else {
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
                history.frequentlyPurchasedBooks = history.frequentlyPurchasedBooks.slice(0, 10);
            }
            // Lưu lại
            yield history.save();
            return history;
        }
        catch (error) {
            console.error("Error updating order history:", error);
            throw error;
        }
    });
};
exports.default = mongoose_1.default.model("OrderHistory", OrderHistorySchema);
