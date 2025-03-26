import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Order, { IOrder } from "../models/Order";
import Book from "../models/Book";
import OrderStatus from "../models/OrderStatus";
import PaymentStatus from "../models/PaymentStatus";
import OrderHistory from "../models/OrderHistory";
import { AuthRequest } from "../middlewares/authMiddleware";

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    discountAmount,
    promotionCode,
  } = req.body;

  // Kiểm tra user đã được xác thực
  if (!req.user) {
    res.status(401);
    throw new Error("Không có thông tin người dùng");
  }

  // Kiểm tra xem có sản phẩm trong đơn hàng không
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("Không có sản phẩm nào trong đơn hàng");
  }

  try {
    console.log("Đang xử lý đơn hàng mới:", { paymentMethod, totalPrice });

    // Tạo đơn hàng mới
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      discountAmount: discountAmount || 0,
      promotionCode: promotionCode || "",
      status: "Đã đặt hàng",
      isPaid: false,
      isDelivered: false,
    });

    // Lưu đơn hàng vào database
    const createdOrder = await order.save();
    console.log("Đơn hàng đã được tạo:", createdOrder._id);

    // Tạo trạng thái đơn hàng
    const orderStatus = await OrderStatus.create({
      order: createdOrder._id,
      status: "Đã đặt hàng",
      description: "Đơn hàng đã được đặt thành công và đang chờ xác nhận",
      timestamp: new Date(),
      updatedBy: req.user._id,
    });

    // Tạo trạng thái thanh toán
    const paymentStatus = await PaymentStatus.create({
      order: createdOrder._id,
      status:
        paymentMethod === "Thanh toán khi nhận hàng"
          ? "Chờ thanh toán"
          : "Đang xử lý",
      amount: totalPrice,
      paymentMethod: paymentMethod,
      timestamp: new Date(),
      updatedBy: req.user._id,
      note:
        paymentMethod === "Thanh toán khi nhận hàng"
          ? "Sẽ thanh toán khi nhận hàng"
          : "Đang chờ thanh toán",
    });

    console.log("Đã tạo trạng thái đơn hàng và thanh toán");

    // Cập nhật lịch sử đơn hàng
    try {
      // Cập nhật lịch sử đơn hàng của người dùng
      const orderHistory = await OrderHistory.updateHistoryWithNewOrder(
        req.user._id,
        createdOrder._id,
        totalPrice,
        orderItems
      );
      console.log("Đã cập nhật lịch sử đơn hàng");
    } catch (historyError) {
      console.error("Lỗi cập nhật lịch sử đơn hàng:", historyError);
      // Không ảnh hưởng đến quy trình đặt hàng chính
    }

    // Trả về đơn hàng đầy đủ thông tin
    const populatedOrder = await Order.findById(createdOrder._id).populate(
      "user",
      "name email"
    );

    res.status(201).json(populatedOrder);
  } catch (error: any) {
    console.error("Lỗi tạo đơn hàng:", error);
    res.status(400);
    throw new Error(`Lỗi tạo đơn hàng: ${error.message}`);
  }
});

// @desc    Lấy đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Tìm đơn hàng và populate thông tin người dùng
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    // Kiểm tra quyền truy cập: chỉ người dùng tạo đơn hàng hoặc admin mới có thể xem
    if (!req.user) {
      res.status(401);
      throw new Error("Không có thông tin người dùng");
    }

    if (
      req.user.isAdmin ||
      (order.user && order.user._id.toString() === req.user!._id.toString())
    ) {
      res.json(order);
    } else {
      res.status(403);
      throw new Error("Bạn không có quyền xem đơn hàng này");
    }
  } else {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }
});

// @desc    Cập nhật trạng thái thanh toán
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!req.user) {
      res.status(401);
      throw new Error("Không có thông tin người dùng");
    }

    if (order) {
      // Kiểm tra quyền truy cập
      if (
        !req.user.isAdmin &&
        order.user.toString() !== req.user!._id.toString()
      ) {
        res.status(403);
        throw new Error("Bạn không có quyền cập nhật đơn hàng này");
      }

      // Cập nhật thông tin thanh toán
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      // Lưu đơn hàng đã cập nhật
      const updatedOrder = await order.save();

      // Cập nhật trạng thái thanh toán
      await PaymentStatus.create({
        order: order._id,
        status: "Thanh toán thành công",
        amount: order.totalPrice,
        paymentMethod: order.paymentMethod,
        transactionId: req.body.id,
        updatedBy: req.user?._id,
        note: "Thanh toán hoàn tất",
        paymentDetails: req.body,
      });

      // Cập nhật trạng thái đơn hàng
      await OrderStatus.create({
        order: order._id,
        status: "Đã xác nhận",
        description: "Đơn hàng đã được thanh toán và xác nhận",
        updatedBy: req.user?._id,
      });

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Không tìm thấy đơn hàng");
    }
  }
);

// @desc    Cập nhật trạng thái giao hàng
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!req.user) {
      res.status(401);
      throw new Error("Không có thông tin người dùng");
    }

    if (order) {
      // Cập nhật trạng thái giao hàng
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.status = "Đã giao hàng";

      // Lưu đơn hàng đã cập nhật
      const updatedOrder = await order.save();

      // Cập nhật trạng thái đơn hàng
      await OrderStatus.create({
        order: order._id,
        status: "Đã giao hàng",
        description: "Đơn hàng đã được giao thành công",
        updatedBy: req.user?._id,
      });

      // Nếu là thanh toán khi nhận hàng, cập nhật thanh toán
      if (order.paymentMethod === "Thanh toán khi nhận hàng" && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        await order.save();

        // Cập nhật trạng thái thanh toán
        await PaymentStatus.create({
          order: order._id,
          status: "Thanh toán thành công",
          amount: order.totalPrice,
          paymentMethod: order.paymentMethod,
          updatedBy: req.user?._id,
          note: "Thanh toán khi nhận hàng",
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Không tìm thấy đơn hàng");
    }
  }
);

// @desc    Lấy đơn hàng của người dùng đăng nhập
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Không có thông tin người dùng");
  }

  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({})
    .populate("user", "id name")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!req.user) {
      res.status(401);
      throw new Error("Không có thông tin người dùng");
    }

    if (order) {
      // Cập nhật trạng thái
      order.status = status;

      // Cập nhật các trạng thái khác liên quan
      if (status === "Đã giao hàng") {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      } else if (status === "Đã hủy") {
        order.isDelivered = false;
        order.deliveredAt = undefined;
      }

      // Lưu đơn hàng đã cập nhật
      const updatedOrder = await order.save();

      // Cập nhật trạng thái đơn hàng
      await OrderStatus.create({
        order: order._id,
        status: status,
        description:
          req.body.description || `Đơn hàng chuyển sang trạng thái ${status}`,
        updatedBy: req.user?._id,
        note: req.body.note,
      });

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Không tìm thấy đơn hàng");
    }
  }
);

// @desc    Get order statuses by order ID
// @route   GET /api/orders/:id/statuses
// @access  Private
const getOrderStatuses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      console.log(`Đang lấy lịch sử trạng thái cho đơn hàng: ${req.params.id}`);

      const orderStatuses = await OrderStatus.find({ order: req.params.id })
        .sort({ createdAt: 1 })
        .populate("updatedBy", "name");

      if (!orderStatuses || orderStatuses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch sử trạng thái đơn hàng",
        });
      }

      console.log(`Tìm thấy ${orderStatuses.length} trạng thái đơn hàng`);

      res.status(200).json({
        success: true,
        count: orderStatuses.length,
        data: orderStatuses,
      });
    } catch (error) {
      console.error("Lỗi khi lấy trạng thái đơn hàng:", error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Lỗi không xác định",
        });
      }
    }
  }
);

// @desc    Get payment statuses by order ID
// @route   GET /api/orders/:id/payments
// @access  Private
const getPaymentStatuses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      console.log(`Đang lấy lịch sử thanh toán cho đơn hàng: ${req.params.id}`);

      const paymentStatuses = await PaymentStatus.find({ order: req.params.id })
        .sort({ createdAt: 1 })
        .populate("updatedBy", "name");

      if (!paymentStatuses || paymentStatuses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch sử thanh toán đơn hàng",
        });
      }

      console.log(`Tìm thấy ${paymentStatuses.length} trạng thái thanh toán`);

      res.status(200).json({
        success: true,
        count: paymentStatuses.length,
        data: paymentStatuses,
      });
    } catch (error) {
      console.error("Lỗi khi lấy trạng thái thanh toán:", error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Lỗi không xác định",
        });
      }
    }
  }
);

// @desc    Get user order history and stats
// @route   GET /api/orders/history
// @access  Private
const getUserOrderHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      let history = await OrderHistory.findOne({ user: req.user?._id })
        .populate("orders", "status totalPrice createdAt")
        .populate("favoriteCategories", "name")
        .populate("frequentlyPurchasedBooks.book", "title image author price");

      if (!history) {
        return res.status(404).json({
          success: false,
          message: "Chưa có lịch sử đơn hàng",
        });
      }

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Lỗi không xác định",
        });
      }
    }
  }
);

export {
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
};
