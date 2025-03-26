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
exports.updateUser = exports.getUserById = exports.deleteUser = exports.getUsers = exports.updateUserProfile = exports.getUserProfile = exports.registerUser = exports.authUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Đăng nhập người dùng & lấy token
// @route   POST /api/users/login
// @access  Public
const authUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Tìm user theo email
    const user = yield User_1.default.findOne({ email });
    // Kiểm tra user tồn tại và mật khẩu đúng
    if (user && (yield user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            isAdmin: user.isAdmin,
            token: (0, generateToken_1.default)(user._id.toString()),
        });
    }
    else {
        res.status(401);
        throw new Error("Email hoặc mật khẩu không đúng");
    }
}));
exports.authUser = authUser;
// @desc    Đăng ký người dùng mới
// @route   POST /api/users
// @access  Public
const registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    // Kiểm tra xem email đã tồn tại chưa
    const userExists = yield User_1.default.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("Email đã được sử dụng");
    }
    // Tạo người dùng mới
    const user = yield User_1.default.create({
        name,
        email,
        password,
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: (0, generateToken_1.default)(user._id.toString()),
        });
    }
    else {
        res.status(400);
        throw new Error("Dữ liệu người dùng không hợp lệ");
    }
}));
exports.registerUser = registerUser;
// @desc    Lấy thông tin người dùng
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401);
        throw new Error("Không tìm thấy thông tin người dùng");
    }
    const user = yield User_1.default.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            isAdmin: user.isAdmin,
        });
    }
    else {
        res.status(404);
        throw new Error("Không tìm thấy người dùng");
    }
}));
exports.getUserProfile = getUserProfile;
// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401);
        throw new Error("Không tìm thấy thông tin người dùng");
    }
    const user = yield User_1.default.findById(req.user._id);
    if (user) {
        // Cập nhật thông tin
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        // Cập nhật mật khẩu nếu có
        if (req.body.password) {
            user.password = req.body.password;
        }
        // Lưu thông tin đã cập nhật
        const updatedUser = yield user.save();
        // Trả về thông tin đã cập nhật
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            isAdmin: updatedUser.isAdmin,
            token: (0, generateToken_1.default)(updatedUser._id.toString()),
        });
    }
    else {
        res.status(404);
        throw new Error("Không tìm thấy người dùng");
    }
}));
exports.updateUserProfile = updateUserProfile;
// @desc    Lấy tất cả người dùng
// @route   GET /api/users
// @access  Private/Admin
const getUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.find({}).select("-password");
    res.json(users);
}));
exports.getUsers = getUsers;
// @desc    Xóa người dùng
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.params.id);
    if (user) {
        // Không cho phép xóa tài khoản admin
        if (user.isAdmin) {
            res.status(400);
            throw new Error("Không thể xóa tài khoản admin");
        }
        // Xóa người dùng
        yield user.deleteOne();
        res.json({ message: "Đã xóa người dùng" });
    }
    else {
        res.status(404);
        throw new Error("Không tìm thấy người dùng");
    }
}));
exports.deleteUser = deleteUser;
// @desc    Lấy thông tin người dùng theo ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.params.id).select("-password");
    if (user) {
        res.json(user);
    }
    else {
        res.status(404);
        throw new Error("Không tìm thấy người dùng");
    }
}));
exports.getUserById = getUserById;
// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.params.id);
    if (user) {
        // Cập nhật thông tin
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.isAdmin =
            req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
        // Lưu thông tin đã cập nhật
        const updatedUser = yield user.save();
        // Trả về thông tin đã cập nhật
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            isAdmin: updatedUser.isAdmin,
        });
    }
    else {
        res.status(404);
        throw new Error("Không tìm thấy người dùng");
    }
}));
exports.updateUser = updateUser;
