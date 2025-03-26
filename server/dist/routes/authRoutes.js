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
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const router = express_1.default.Router();
// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Kiểm tra email đã tồn tại chưa
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
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
            res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}));
// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Kiểm tra email
        const user = yield User_1.default.findOne({ email }).select("+password");
        if (!user) {
            return res
                .status(401)
                .json({ message: "Email hoặc mật khẩu không đúng" });
        }
        // Kiểm tra mật khẩu
        const isMatch = yield user.matchPassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Email hoặc mật khẩu không đúng" });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: (0, generateToken_1.default)(user._id.toString()),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}));
// @desc    Lấy thông tin người dùng đang đăng nhập
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            });
        }
        else {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}));
// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/auth/profile
// @access  Private
router.put("/profile", authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = yield user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: (0, generateToken_1.default)(updatedUser._id.toString()),
            });
        }
        else {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}));
exports.default = router;
