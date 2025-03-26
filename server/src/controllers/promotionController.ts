import { Request, Response } from "express";
import Promotion, { IPromotion } from "../models/Promotion";
import mongoose from "mongoose";

// Lấy tất cả mã khuyến mãi
export const getAllPromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await Promotion.find()
      .populate("applicableCategories", "name")
      .populate("applicableBooks", "title");

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách mã khuyến mãi",
      error: (error as Error).message,
    });
  }
};

// Lấy mã khuyến mãi theo ID
export const getPromotionById = async (req: Request, res: Response) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin mã khuyến mãi",
      error: (error as Error).message,
    });
  }
};

// Tạo mã khuyến mãi mới
export const createPromotion = async (req: Request, res: Response) => {
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
    const existingPromotion = await Promotion.findOne({ code: normalizedCode });

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
    const newPromotion = await Promotion.create(req.body);

    res.status(201).json({
      success: true,
      data: newPromotion,
    });
  } catch (error) {
    console.error("Lỗi khi tạo mã khuyến mãi:", error);

    if (error instanceof Error) {
      // Kiểm tra lỗi trùng key (MongoDB E11000)
      if (
        error.message.includes("E11000") ||
        error.message.includes("duplicate key")
      ) {
        return res.status(400).json({
          success: false,
          message: "Mã khuyến mãi này đã tồn tại, vui lòng chọn mã khác",
        });
      }

      // Kiểm tra lỗi validation từ Mongoose
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message:
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.",
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
};

// Cập nhật mã khuyến mãi
export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật mã khuyến mãi",
      error: (error as Error).message,
    });
  }
};

// Xóa mã khuyến mãi
export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa mã khuyến mãi",
      error: (error as Error).message,
    });
  }
};

// Kiểm tra mã khuyến mãi có hợp lệ hay không
export const validatePromotion = async (req: Request, res: Response) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã khuyến mãi và tổng giá trị đơn hàng",
      });
    }

    const promotion = await Promotion.findOne({ code: code.toUpperCase() });

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra mã khuyến mãi",
      error: (error as Error).message,
    });
  }
};

// Áp dụng mã khuyến mãi cho đơn hàng
export const applyPromotion = async (req: Request, res: Response) => {
  try {
    const { code, orderId } = req.body;

    if (!code || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã khuyến mãi và ID đơn hàng",
      });
    }

    const promotion = await Promotion.findOne({ code: code.toUpperCase() });

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
    await promotion.save();

    res.status(200).json({
      success: true,
      message: "Đã áp dụng mã khuyến mãi thành công",
      data: promotion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi áp dụng mã khuyến mãi",
      error: (error as Error).message,
    });
  }
};

// Lấy danh sách mã khuyến mãi đang hoạt động
export const getActivePromotions = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    console.log("Đang tìm khuyến mãi active tại thời điểm:", now);

    // Sửa điều kiện truy vấn với $lte và $gte để đảm bảo tất cả mã trong khoảng thời gian hợp lệ được trả về
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ endDate: 1 }); // Sắp xếp theo thời gian kết thúc tăng dần

    console.log(
      `Tìm thấy ${promotions.length} khuyến mãi active:`,
      promotions.map((p) => ({
        code: p.code,
        isActive: p.isActive,
        startDate: p.startDate,
        endDate: p.endDate,
      }))
    );

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    console.error("Lỗi khi lấy khuyến mãi active:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách mã khuyến mãi đang hoạt động",
      error: (error as Error).message,
    });
  }
};
