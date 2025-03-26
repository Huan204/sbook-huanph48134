"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// TODO: Thêm controllers cho đơn hàng
const orderController_1 = require("../controllers/orderController");
// @route   POST /api/orders
// @desc    Tạo đơn hàng mới
// @access  Private
router.route("/").post(authMiddleware_1.protect, orderController_1.addOrderItems).get(authMiddleware_1.protect, authMiddleware_1.admin, orderController_1.getOrders);
// @route   GET /api/orders/myorders
// @desc    Lấy đơn hàng của người dùng hiện tại
// @access  Private
router.route("/myorders").get(authMiddleware_1.protect, orderController_1.getMyOrders);
// @route   GET /api/orders/history
// @desc    Lấy lịch sử và thống kê đơn hàng
// @access  Private
router.route("/history").get(authMiddleware_1.protect, orderController_1.getUserOrderHistory);
// @route   GET /api/orders/:id
// @desc    Lấy thông tin đơn hàng theo ID
// @access  Private
router.route("/:id").get(authMiddleware_1.protect, orderController_1.getOrderById);
// @route   PUT /api/orders/:id/pay
// @desc    Cập nhật trạng thái thanh toán
// @access  Private
router.route("/:id/pay").put(authMiddleware_1.protect, orderController_1.updateOrderToPaid);
// @route   PUT /api/orders/:id/deliver
// @desc    Cập nhật trạng thái giao hàng
// @access  Private/Admin
router.route("/:id/deliver").put(authMiddleware_1.protect, authMiddleware_1.admin, orderController_1.updateOrderToDelivered);
// @route   PUT /api/orders/:id/status
// @desc    Cập nhật trạng thái đơn hàng
// @access  Private/Admin
router.route("/:id/status").put(authMiddleware_1.protect, authMiddleware_1.admin, orderController_1.updateOrderStatus);
// @route   GET /api/orders/:id/statuses
// @desc    Lấy lịch sử trạng thái đơn hàng
// @access  Private
router.route("/:id/statuses").get(authMiddleware_1.protect, orderController_1.getOrderStatuses);
// @route   GET /api/orders/:id/payments
// @desc    Lấy lịch sử thanh toán đơn hàng
// @access  Private
router.route("/:id/payments").get(authMiddleware_1.protect, orderController_1.getPaymentStatuses);
exports.default = router;
