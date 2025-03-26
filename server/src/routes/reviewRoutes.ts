import express from "express";
import {
  getReviews,
  getReviewById,
  createReview,
  updateReviewStatus,
  deleteReview,
  getAllReviewsFromCollection,
} from "../controllers/reviewController";

const router = express.Router();

// @route   GET /api/reviews/all
// @desc    Lấy tất cả đánh giá từ collection reviews
// @access  Public
router.get("/all", getAllReviewsFromCollection);

// @route   GET /api/reviews
// @desc    Lấy tất cả đánh giá
// @access  Public
router.get("/", getReviews);

// @route   GET /api/reviews/:id
// @desc    Lấy đánh giá theo ID
// @access  Public
router.get("/:id", getReviewById);

// @route   POST /api/reviews
// @desc    Tạo đánh giá mới
// @access  Public
router.post("/", createReview);

// @route   PATCH /api/reviews/:id
// @desc    Cập nhật trạng thái đánh giá
// @access  Public
router.patch("/:id", updateReviewStatus);

// @route   DELETE /api/reviews/:id
// @desc    Xóa đánh giá
// @access  Public
router.delete("/:id", deleteReview);

export default router;
