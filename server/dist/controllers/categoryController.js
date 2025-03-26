"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Category_1 = __importDefault(require("../models/Category"));
// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
const getCategories = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield Category_1.default.find({}).sort({ name: 1 });
    res.json(categories);
}));
exports.getCategories = getCategories;
// @desc    Lấy danh mục theo ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield Category_1.default.findById(req.params.id);
    if (category) {
        res.json(category);
    }
    else {
        res.status(404);
        throw new Error("Không tìm thấy danh mục");
    }
}));
exports.getCategoryById = getCategoryById;
// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, icon } = req.body;
    // Kiểm tra xem danh mục đã tồn tại chưa
    const categoryExists = yield Category_1.default.findOne({ name });
    if (categoryExists) {
        res.status(400);
        throw new Error("Danh mục đã tồn tại");
    }
    // Tạo danh mục mới
    const category = yield Category_1.default.create({
        name,
        description,
        icon,
    });
    if (category) {
        res.status(201).json(category);
    }
    else {
        res.status(400);
        throw new Error("Dữ liệu danh mục không hợp lệ");
    }
}));
exports.createCategory = createCategory;
// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, icon } = req.body;
    const category = yield Category_1.default.findById(req.params.id);
    if (category) {
        // Nếu tên danh mục thay đổi, kiểm tra xem đã tồn tại chưa
        if (name && name !== category.name) {
            const categoryExists = yield Category_1.default.findOne({ name });
            if (categoryExists) {
                res.status(400);
                throw new Error("Tên danh mục đã tồn tại");
            }
        }
        // Cập nhật thông tin
        category.name = name || category.name;
        category.description = description || category.description;
        category.icon = icon || category.icon;
        const updatedCategory = yield category.save();
        res.json(updatedCategory);
    }
    else {
        res.status(404);
        throw new Error("Không tìm thấy danh mục");
    }
}));
exports.updateCategory = updateCategory;
// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield Category_1.default.findById(req.params.id);
    if (category) {
        yield Category_1.default.deleteOne({ _id: category._id });
        res.json({ message: "Đã xóa danh mục" });
    }
    else {
        res.status(404);
        throw new Error("Không tìm thấy danh mục");
    }
}));
exports.deleteCategory = deleteCategory;
