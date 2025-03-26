import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { protect, admin } from "../middlewares/authMiddleware";

const router = express.Router();

// @route   GET /api/categories
// @desc    Lấy tất cả danh mục
// @access  Public
router.get("/", getCategories);

// @route   GET /api/categories/:id
// @desc    Lấy danh mục theo ID
// @access  Public
router.get("/:id", getCategoryById);

// @route   POST /api/categories
// @desc    Tạo danh mục mới
// @access  Private/Admin
router.post("/", protect, admin, createCategory);

// @route   PUT /api/categories/:id
// @desc    Cập nhật danh mục
// @access  Private/Admin
router.put("/:id", protect, admin, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Xóa danh mục
// @access  Private/Admin
router.delete("/:id", protect, admin, deleteCategory);

export default router;
