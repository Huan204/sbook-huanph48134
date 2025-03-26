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
const ReviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const BookSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Vui lòng nhập tên sách"],
        trim: true,
        maxlength: [100, "Tên sách không được vượt quá 100 ký tự"],
    },
    author: {
        type: String,
        required: [true, "Vui lòng nhập tên tác giả"],
        trim: true,
        maxlength: [100, "Tên tác giả không được vượt quá 100 ký tự"],
    },
    description: {
        type: String,
        required: [true, "Vui lòng nhập mô tả sách"],
    },
    image: {
        type: String,
        required: [true, "Vui lòng thêm hình ảnh sách"],
    },
    price: {
        type: Number,
        required: [true, "Vui lòng nhập giá sách"],
        min: [0, "Giá sách không được âm"],
    },
    discount: {
        type: Number,
        min: [0, "Giảm giá không được âm"],
        max: [100, "Giảm giá không được vượt quá 100%"],
        default: 0,
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, "Vui lòng chọn danh mục sách"],
        ref: "Category",
    },
    stock: {
        type: Number,
        required: [true, "Vui lòng nhập số lượng sách trong kho"],
        min: [0, "Số lượng sách không được âm"],
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    reviews: [ReviewSchema],
    pages: {
        type: Number,
        required: [true, "Vui lòng nhập số trang sách"],
        min: [1, "Số trang sách phải lớn hơn 0"],
    },
    publisher: {
        type: String,
        required: [true, "Vui lòng nhập nhà xuất bản"],
        trim: true,
    },
    publishedDate: {
        type: String,
        required: [true, "Vui lòng nhập ngày xuất bản"],
    },
    language: {
        type: String,
        required: [true, "Vui lòng nhập ngôn ngữ sách"],
        trim: true,
    },
    isbn: {
        type: String,
        required: [true, "Vui lòng nhập ISBN sách"],
        trim: true,
        unique: true,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Book", BookSchema);
