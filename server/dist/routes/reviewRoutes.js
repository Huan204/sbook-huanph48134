"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const router = express_1.default.Router();
// @route   GET /api/reviews/all
// @desc    Lấy tất cả đánh giá từ collection reviews
// @access  Public
router.get("/all", reviewController_1.getAllReviewsFromCollection);
// @route   GET /api/reviews
// @desc    Lấy tất cả đánh giá
// @access  Public
router.get("/", reviewController_1.getReviews);
// @route   GET /api/reviews/:id
// @desc    Lấy đánh giá theo ID
// @access  Public
router.get("/:id", reviewController_1.getReviewById);
// @route   POST /api/reviews
// @desc    Tạo đánh giá mới
// @access  Public
router.post("/", reviewController_1.createReview);
// @route   PATCH /api/reviews/:id
// @desc    Cập nhật trạng thái đánh giá
// @access  Public
router.patch("/:id", reviewController_1.updateReviewStatus);
// @route   DELETE /api/reviews/:id
// @desc    Xóa đánh giá
// @access  Public
router.delete("/:id", reviewController_1.deleteReview);
exports.default = router;
