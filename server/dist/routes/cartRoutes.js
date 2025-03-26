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
const Cart_1 = __importDefault(require("../models/Cart"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
// @desc    Đồng bộ hóa giỏ hàng (lấy hoặc cập nhật)
// @route   GET /api/cart/sync
// @access  Public
router.get("/sync", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { deviceId } = req.query;
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu deviceId",
            });
        }
        // Tìm giỏ hàng theo deviceId
        const cart = yield Cart_1.default.findOne({ deviceId });
        // Nếu có người dùng đăng nhập và có token, liên kết deviceId với userId
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (userId && cart) {
                // Cập nhật userId cho giỏ hàng
                cart.userId = userId;
                yield cart.save();
            }
        }
        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Không có giỏ hàng",
                items: [],
            });
        }
        // Chuyển đổi dữ liệu từ database thành format cho client
        const cartItems = cart.items.map((item) => ({
            _id: item.bookId.toString(),
            title: item.title,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            discount: item.discount,
        }));
        return res.status(200).json({
            success: true,
            message: "Lấy giỏ hàng thành công",
            items: cartItems,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi lấy giỏ hàng",
            error: error.message,
        });
    }
}));
// @desc    Đồng bộ hóa giỏ hàng (cập nhật)
// @route   POST /api/cart/sync
// @access  Public
router.post("/sync", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { deviceId, items } = req.body;
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu deviceId",
            });
        }
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu giỏ hàng không hợp lệ",
            });
        }
        // Chuyển đổi dữ liệu từ client thành format cho database
        const cartItems = items.map((item) => ({
            bookId: new mongoose_1.default.Types.ObjectId(item._id),
            title: item.title,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            discount: item.discount,
        }));
        // Tìm và cập nhật giỏ hàng, hoặc tạo mới nếu chưa có
        const updatedCart = yield Cart_1.default.findOneAndUpdate({ deviceId }, Object.assign({ deviceId, items: cartItems }, (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
            ? { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }
            : {})), { new: true, upsert: true });
        return res.status(200).json({
            success: true,
            message: "Đồng bộ hóa giỏ hàng thành công",
        });
    }
    catch (error) {
        console.error("Lỗi khi đồng bộ hóa giỏ hàng:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi đồng bộ hóa giỏ hàng",
            error: error.message,
        });
    }
}));
// @desc    Xóa giỏ hàng
// @route   DELETE /api/cart/sync
// @access  Public
router.delete("/sync", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceId } = req.query;
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu deviceId",
            });
        }
        // Xóa giỏ hàng theo deviceId
        yield Cart_1.default.findOneAndDelete({ deviceId });
        return res.status(200).json({
            success: true,
            message: "Xóa giỏ hàng thành công",
        });
    }
    catch (error) {
        console.error("Lỗi khi xóa giỏ hàng:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi xóa giỏ hàng",
            error: error.message,
        });
    }
}));
exports.default = router;
