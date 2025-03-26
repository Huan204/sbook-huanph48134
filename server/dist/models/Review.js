"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
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
    book: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Book",
    },
    bookTitle: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isHidden: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: false,
    collection: "reviews",
});
const Review = mongoose_1.default.model("Review", reviewSchema);
exports.default = Review;
