import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Category from "../models/Category";

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
});

// @desc    Lấy danh mục theo ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error("Không tìm thấy danh mục");
  }
});

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, icon } = req.body;

  // Kiểm tra xem danh mục đã tồn tại chưa
  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error("Danh mục đã tồn tại");
  }

  // Tạo danh mục mới
  const category = await Category.create({
    name,
    description,
    icon,
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error("Dữ liệu danh mục không hợp lệ");
  }
});

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, icon } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    // Nếu tên danh mục thay đổi, kiểm tra xem đã tồn tại chưa
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        res.status(400);
        throw new Error("Tên danh mục đã tồn tại");
      }
    }

    // Cập nhật thông tin
    category.name = name || category.name;
    category.description = description || category.description;
    category.icon = icon || category.icon;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Không tìm thấy danh mục");
  }
});

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await Category.deleteOne({ _id: category._id });
    res.json({ message: "Đã xóa danh mục" });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy danh mục");
  }
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
