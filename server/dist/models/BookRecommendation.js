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
const BookRecommendationSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique: true,
    },
    recommendedBooks: [
        {
            book: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Book",
                required: true,
            },
            score: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
            },
            recommendationReason: {
                type: String,
                required: true,
                enum: [
                    "Dựa trên sách đã mua",
                    "Sách cùng tác giả",
                    "Sách cùng thể loại",
                    "Xu hướng phổ biến",
                    "Được đánh giá cao",
                    "Người dùng khác cũng mua",
                    "Mới ra mắt",
                ],
            },
        },
    ],
    reviews: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
            book: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
                ref: "Book",
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
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Phương thức để tạo gợi ý sách cho người dùng
BookRecommendationSchema.statics.generateRecommendations = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Tìm kiếm user history
            const OrderHistory = mongoose_1.default.model("OrderHistory");
            const Book = mongoose_1.default.model("Book");
            const userHistory = yield OrderHistory.findOne({ user: userId }).populate({
                path: "frequentlyPurchasedBooks.book",
                select: "category author",
            });
            if (!userHistory || !userHistory.frequentlyPurchasedBooks.length) {
                // Nếu người dùng chưa có lịch sử, gợi ý sách phổ biến
                const popularBooks = yield Book.find({ numReviews: { $gt: 5 } })
                    .sort({ rating: -1 })
                    .limit(10);
                const recommendations = {
                    user: userId,
                    recommendedBooks: popularBooks.map((book) => ({
                        book: book._id,
                        score: Math.floor(book.rating * 20),
                        recommendationReason: "Được đánh giá cao",
                    })),
                    lastUpdated: new Date(),
                };
                return yield this.findOneAndUpdate({ user: userId }, recommendations, {
                    upsert: true,
                    new: true,
                });
            }
            // Trường hợp người dùng đã có lịch sử mua hàng
            // 1. Lấy các thể loại và tác giả phổ biến
            const purchasedBookInfo = userHistory.frequentlyPurchasedBooks.map((item) => ({
                bookId: item.book._id,
                category: item.book.category,
                author: item.book.author,
                count: item.count,
            }));
            const categories = purchasedBookInfo
                .map((info) => info.category)
                .filter((value, index, self) => self.indexOf(value) === index);
            const authors = purchasedBookInfo
                .map((info) => info.author)
                .filter((value, index, self) => self.indexOf(value) === index);
            const purchasedBooks = purchasedBookInfo.map((info) => info.bookId);
            // 2. Tìm sách cùng thể loại nhưng chưa mua
            const categoryBooks = yield Book.find({
                category: { $in: categories },
                _id: { $nin: purchasedBooks },
            }).limit(5);
            // 3. Tìm sách cùng tác giả nhưng chưa mua
            const authorBooks = yield Book.find({
                author: { $in: authors },
                _id: { $nin: purchasedBooks },
            }).limit(5);
            // 4. Tìm sách bán chạy
            const trendingBooks = yield Book.find({
                _id: { $nin: purchasedBooks },
            })
                .sort({ numReviews: -1 })
                .limit(5);
            // 5. Sách mới
            const newBooks = yield Book.find({
                _id: { $nin: purchasedBooks },
            })
                .sort({ createdAt: -1 })
                .limit(5);
            // Kết hợp các gợi ý
            const allRecommendations = [
                ...categoryBooks.map((book) => ({
                    book: book._id,
                    score: 85,
                    recommendationReason: "Sách cùng thể loại",
                })),
                ...authorBooks.map((book) => ({
                    book: book._id,
                    score: 90,
                    recommendationReason: "Sách cùng tác giả",
                })),
                ...trendingBooks.map((book) => ({
                    book: book._id,
                    score: 75,
                    recommendationReason: "Xu hướng phổ biến",
                })),
                ...newBooks.map((book) => ({
                    book: book._id,
                    score: 70,
                    recommendationReason: "Mới ra mắt",
                })),
            ];
            // Sắp xếp theo điểm số
            allRecommendations.sort((a, b) => b.score - a.score);
            // Loại bỏ trùng lặp và lấy tối đa 15 gợi ý
            const uniqueRecommendations = [];
            const bookIds = new Set();
            for (const rec of allRecommendations) {
                if (!bookIds.has(rec.book.toString())) {
                    bookIds.add(rec.book.toString());
                    uniqueRecommendations.push(rec);
                    if (uniqueRecommendations.length >= 15)
                        break;
                }
            }
            // Cập nhật hoặc tạo mới
            return yield this.findOneAndUpdate({ user: userId }, {
                user: userId,
                recommendedBooks: uniqueRecommendations,
                lastUpdated: new Date(),
            }, { upsert: true, new: true });
        }
        catch (error) {
            console.error("Error generating book recommendations:", error);
            throw error;
        }
    });
};
exports.default = mongoose_1.default.model("BookRecommendation", BookRecommendationSchema);
