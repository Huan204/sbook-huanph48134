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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PaymentStatusSchema = new mongoose_1.Schema({
    order: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    note: {
        type: String,
    },
    paymentDetails: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("PaymentStatus", PaymentStatusSchema);
