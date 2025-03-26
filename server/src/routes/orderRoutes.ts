import express from "express";
import { Request, Response } from "express";
import Order from "../models/Order";
import { protect, admin } from "../middlewares/authMiddleware";

const router = express.Router();

// TODO: Thêm controllers cho đơn hàng
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderStatuses,
  getPaymentStatuses,
  getUserOrderHistory,
} from "../controllers/orderController";

// @route   POST /api/orders
// @desc    Tạo đơn hàng mới
// @access  Private
router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);

// @route   GET /api/orders/myorders
// @desc    Lấy đơn hàng của người dùng hiện tại
// @access  Private
router.route("/myorders").get(protect, getMyOrders);

// @route   GET /api/orders/history
// @desc    Lấy lịch sử và thống kê đơn hàng
// @access  Private
router.route("/history").get(protect, getUserOrderHistory);

// @route   GET /api/orders/:id
// @desc    Lấy thông tin đơn hàng theo ID
// @access  Private
router.route("/:id").get(protect, getOrderById);

// @route   PUT /api/orders/:id/pay
// @desc    Cập nhật trạng thái thanh toán
// @access  Private
router.route("/:id/pay").put(protect, updateOrderToPaid);

// @route   PUT /api/orders/:id/deliver
// @desc    Cập nhật trạng thái giao hàng
// @access  Private/Admin
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);

// @route   PUT /api/orders/:id/status
// @desc    Cập nhật trạng thái đơn hàng
// @access  Private/Admin
router.route("/:id/status").put(protect, admin, updateOrderStatus);

// @route   GET /api/orders/:id/statuses
// @desc    Lấy lịch sử trạng thái đơn hàng
// @access  Private
router.route("/:id/statuses").get(protect, getOrderStatuses);

// @route   GET /api/orders/:id/payments
// @desc    Lấy lịch sử thanh toán đơn hàng
// @access  Private
router.route("/:id/payments").get(protect, getPaymentStatuses);

export default router;
