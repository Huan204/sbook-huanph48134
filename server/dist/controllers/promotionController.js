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
exports.getActivePromotions = exports.applyPromotion = exports.validatePromotion = exports.deletePromotion = exports.updatePromotion = exports.createPromotion = exports.getPromotionById = exports.getAllPromotions = void 0;
const Promotion_1 = __importDefault(require("../models/Promotion"));
// Lấy tất cả mã khuyến mãi
const getAllPromotions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotions = yield Promotion_1.default.find()
            .populate("applicableCategories", "name")
            .populate("applicableBooks", "title");
        res.status(200).json({
            success: true,
            count: promotions.length,
            data: promotions,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách mã khuyến mãi",
            error: error.message,
        });
    }
});
exports.getAllPromotions = getAllPromotions;
// Lấy mã khuyến mãi theo ID
const getPromotionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotion = yield Promotion_1.default.findById(req.params.id)
            .populate("applicableCategories", "name")
            .populate("applicableBooks", "title");
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy mã khuyến mãi",
            });
        }
        res.status(200).json({
            success: true,
            data: promotion,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thông tin mã khuyến mãi",
            error: error.message,
        });
    }
});
exports.getPromotionById = getPromotionById;
// Tạo mã khuyến mãi mới
const createPromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra xem mã đã tồn tại chưa
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi không được để trống",
            });
        }
        // Chuyển mã thành chữ hoa và xóa khoảng trắng
        const normalizedCode = code.trim().toUpperCase();
        // Kiểm tra xem mã đã tồn tại trong database chưa
        const existingPromotion = yield Promotion_1.default.findOne({ code: normalizedCode });
        if (existingPromotion) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi này đã tồn tại, vui lòng chọn mã khác",
            });
        }
        // Kiểm tra dữ liệu đầu vào
        if (!req.body.startDate || !req.body.endDate) {
            return res.status(400).json({
                success: false,
                message: "Ngày bắt đầu và ngày kết thúc không được để trống",
            });
        }
        // Kiểm tra loại và giá trị
        if (!req.body.type || !["percentage", "fixed"].includes(req.body.type)) {
            return res.status(400).json({
                success: false,
                message: "Loại khuyến mãi không hợp lệ",
            });
        }
        if (req.body.value === undefined || req.body.value < 0) {
            return res.status(400).json({
                success: false,
                message: "Giá trị khuyến mãi không hợp lệ",
            });
        }
        // Cập nhật mã đã được chuẩn hóa
        req.body.code = normalizedCode;
        // Tạo bản ghi mới
        const newPromotion = yield Promotion_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: newPromotion,
        });
    }
    catch (error) {
        console.error("Lỗi khi tạo mã khuyến mãi:", error);
        if (error instanceof Error) {
            // Kiểm tra lỗi trùng key (MongoDB E11000)
            if (error.message.includes("E11000") ||
                error.message.includes("duplicate key")) {
                return res.status(400).json({
                    success: false,
                    message: "Mã khuyến mãi này đã tồn tại, vui lòng chọn mã khác",
                });
            }
            // Kiểm tra lỗi validation từ Mongoose
            if (error.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.",
                    error: error.message,
                });
            }
        }
        // Lỗi khác
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi tạo mã khuyến mãi",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
});
exports.createPromotion = createPromotion;
// Cập nhật mã khuyến mãi
const updatePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotion = yield Promotion_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy mã khuyến mãi",
            });
        }
        res.status(200).json({
            success: true,
            data: promotion,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Lỗi khi cập nhật mã khuyến mãi",
            error: error.message,
        });
    }
});
exports.updatePromotion = updatePromotion;
// Xóa mã khuyến mãi
const deletePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotion = yield Promotion_1.default.findByIdAndDelete(req.params.id);
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy mã khuyến mãi",
            });
        }
        res.status(200).json({
            success: true,
            message: "Mã khuyến mãi đã được xóa",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa mã khuyến mãi",
            error: error.message,
        });
    }
});
exports.deletePromotion = deletePromotion;
// Kiểm tra mã khuyến mãi có hợp lệ hay không
const validatePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, totalAmount } = req.body;
        if (!code || totalAmount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp mã khuyến mãi và tổng giá trị đơn hàng",
            });
        }
        const promotion = yield Promotion_1.default.findOne({ code: code.toUpperCase() });
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Mã khuyến mãi không tồn tại",
            });
        }
        const isValid = promotion.isValid();
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi đã hết hạn hoặc không còn khả dụng",
            });
        }
        if (totalAmount < promotion.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Giá trị đơn hàng phải tối thiểu ${promotion.minPurchase}đ để sử dụng mã này`,
            });
        }
        const discountAmount = promotion.calculateDiscount(totalAmount);
        res.status(200).json({
            success: true,
            data: {
                promotion,
                discountAmount,
                finalAmount: totalAmount - discountAmount,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi kiểm tra mã khuyến mãi",
            error: error.message,
        });
    }
});
exports.validatePromotion = validatePromotion;
// Áp dụng mã khuyến mãi cho đơn hàng
const applyPromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, orderId } = req.body;
        if (!code || !orderId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp mã khuyến mãi và ID đơn hàng",
            });
        }
        const promotion = yield Promotion_1.default.findOne({ code: code.toUpperCase() });
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Mã khuyến mãi không tồn tại",
            });
        }
        if (!promotion.isValid()) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi đã hết hạn hoặc không còn khả dụng",
            });
        }
        // Tăng số lần sử dụng
        promotion.usageCount += 1;
        yield promotion.save();
        res.status(200).json({
            success: true,
            message: "Đã áp dụng mã khuyến mãi thành công",
            data: promotion,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi áp dụng mã khuyến mãi",
            error: error.message,
        });
    }
});
exports.applyPromotion = applyPromotion;
// Lấy danh sách mã khuyến mãi đang hoạt động
const getActivePromotions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        console.log("Đang tìm khuyến mãi active tại thời điểm:", now);
        // Sửa điều kiện truy vấn với $lte và $gte để đảm bảo tất cả mã trong khoảng thời gian hợp lệ được trả về
        const promotions = yield Promotion_1.default.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        }).sort({ endDate: 1 }); // Sắp xếp theo thời gian kết thúc tăng dần
        console.log(`Tìm thấy ${promotions.length} khuyến mãi active:`, promotions.map((p) => ({
            code: p.code,
            isActive: p.isActive,
            startDate: p.startDate,
            endDate: p.endDate,
        })));
        res.status(200).json({
            success: true,
            count: promotions.length,
            data: promotions,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy khuyến mãi active:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách mã khuyến mãi đang hoạt động",
            error: error.message,
        });
    }
});
exports.getActivePromotions = getActivePromotions;
