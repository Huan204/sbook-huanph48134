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
// @desc    Đăng nhập admin
// @route   POST /api/admin/login
// @access  Public
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Kiểm tra email
        const user = yield User_1.default.findOne({ email, isAdmin: true }).select("+password");
        if (!user) {
            return res.status(401).json({
                message: "Email không tồn tại hoặc không có quyền admin",
            });
        }
        // Kiểm tra mật khẩu
        const isMatch = yield user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Mật khẩu không đúng",
            });
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
        console.error("Lỗi đăng nhập admin:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}));
// @desc    Lấy thông tin admin
// @route   GET /api/admin/profile
// @access  Private/Admin
router.get("/profile", authMiddleware_1.protect, authMiddleware_1.admin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            res.status(404).json({ message: "Không tìm thấy thông tin admin" });
        }
    }
    catch (error) {
        console.error("Lỗi lấy thông tin admin:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}));
// @desc    Cập nhật thông tin admin
// @route   PUT /api/admin/profile
// @access  Private/Admin
router.put("/profile", authMiddleware_1.protect, authMiddleware_1.admin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            res.status(404).json({ message: "Không tìm thấy thông tin admin" });
        }
    }
    catch (error) {
        console.error("Lỗi cập nhật thông tin admin:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}));
exports.default = router;
