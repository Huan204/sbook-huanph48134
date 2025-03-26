import express from "express";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { protect, admin } from "../middlewares/authMiddleware";
import generateToken from "../utils/generateToken";

const router = express.Router();

// @desc    Đăng nhập admin
// @route   POST /api/admin/login
// @access  Public
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email
    const user = await User.findOne({ email, isAdmin: true }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        message: "Email không tồn tại hoặc không có quyền admin",
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);

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
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("Lỗi đăng nhập admin:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// @desc    Lấy thông tin admin
// @route   GET /api/admin/profile
// @access  Private/Admin
router.get("/profile", protect, admin, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy thông tin admin" });
    }
  } catch (error) {
    console.error("Lỗi lấy thông tin admin:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// @desc    Cập nhật thông tin admin
// @route   PUT /api/admin/profile
// @access  Private/Admin
router.put("/profile", protect, admin, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken((updatedUser._id as any).toString()),
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy thông tin admin" });
    }
  } catch (error) {
    console.error("Lỗi cập nhật thông tin admin:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

export default router;
