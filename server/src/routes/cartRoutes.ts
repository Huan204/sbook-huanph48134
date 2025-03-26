import express from "express";
import { protect } from "../middlewares/authMiddleware";
import Cart from "../models/Cart";
import mongoose from "mongoose";

const router = express.Router();

// @desc    Đồng bộ hóa giỏ hàng (lấy hoặc cập nhật)
// @route   GET /api/cart/sync
// @access  Public
router.get("/sync", async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu deviceId",
      });
    }

    // Tìm giỏ hàng theo deviceId
    const cart = await Cart.findOne({ deviceId });

    // Nếu có người dùng đăng nhập và có token, liên kết deviceId với userId
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const userId = (req as any).user?._id;

      if (userId && cart) {
        // Cập nhật userId cho giỏ hàng
        cart.userId = userId;
        await cart.save();
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
  } catch (error: any) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy giỏ hàng",
      error: error.message,
    });
  }
});

// @desc    Đồng bộ hóa giỏ hàng (cập nhật)
// @route   POST /api/cart/sync
// @access  Public
router.post("/sync", async (req, res) => {
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
      bookId: new mongoose.Types.ObjectId(item._id),
      title: item.title,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      discount: item.discount,
    }));

    // Tìm và cập nhật giỏ hàng, hoặc tạo mới nếu chưa có
    const updatedCart = await Cart.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        items: cartItems,
        // Nếu có người dùng đăng nhập và có token, liên kết deviceId với userId
        ...(req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
          ? { userId: (req as any).user?._id }
          : {}),
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Đồng bộ hóa giỏ hàng thành công",
    });
  } catch (error: any) {
    console.error("Lỗi khi đồng bộ hóa giỏ hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi đồng bộ hóa giỏ hàng",
      error: error.message,
    });
  }
});

// @desc    Xóa giỏ hàng
// @route   DELETE /api/cart/sync
// @access  Public
router.delete("/sync", async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu deviceId",
      });
    }

    // Xóa giỏ hàng theo deviceId
    await Cart.findOneAndDelete({ deviceId });

    return res.status(200).json({
      success: true,
      message: "Xóa giỏ hàng thành công",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi xóa giỏ hàng",
      error: error.message,
    });
  }
});

export default router;
