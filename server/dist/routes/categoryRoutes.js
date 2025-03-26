"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// @route   GET /api/categories
// @desc    Lấy tất cả danh mục
// @access  Public
router.get("/", categoryController_1.getCategories);
// @route   GET /api/categories/:id
// @desc    Lấy danh mục theo ID
// @access  Public
router.get("/:id", categoryController_1.getCategoryById);
// @route   POST /api/categories
// @desc    Tạo danh mục mới
// @access  Private/Admin
router.post("/", authMiddleware_1.protect, authMiddleware_1.admin, categoryController_1.createCategory);
// @route   PUT /api/categories/:id
// @desc    Cập nhật danh mục
// @access  Private/Admin
router.put("/:id", authMiddleware_1.protect, authMiddleware_1.admin, categoryController_1.updateCategory);
// @route   DELETE /api/categories/:id
// @desc    Xóa danh mục
// @access  Private/Admin
router.delete("/:id", authMiddleware_1.protect, authMiddleware_1.admin, categoryController_1.deleteCategory);
exports.default = router;
