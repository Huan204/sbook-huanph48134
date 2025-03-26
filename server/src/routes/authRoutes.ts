import express from "express";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import { protect } from "../middlewares/authMiddleware";
import generateToken from "../utils/generateToken";

const router = express.Router();

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Tạo người dùng mới
    const user = await User.create({
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
        // token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req: Request, res: Response) => {
  console.log(req.body);

  // try {
  //   const { email, password } = req.body;

  //   // Kiểm tra email
  //   const user = await User.findOne({ email }).select("+password");

  //   if (!user) {
  //     return res
  //       .status(401)
  //       .json({ message: "Email hoặc mật khẩu không đúng" });
  //   }

  //   // Kiểm tra mật khẩu
  //   const isMatch = await user.matchPassword(password);

  //   if (!isMatch) {
  //     return res
  //       .status(401)
  //       .json({ message: "Email hoặc mật khẩu không đúng" });
  //   }

  //   res.json({
  //     _id: user._id,
  //     name: user.name,
  //     email: user.email,
  //     isAdmin: user.isAdmin,
  //     token: generateToken(user._id.toString()),
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: "Lỗi máy chủ" });
  // }
});

// @desc    Lấy thông tin người dùng đang đăng nhập
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, async (req: any, res: Response) => {
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
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/auth/profile
// @access  Private
router.put("/profile", protect, async (req: any, res: Response) => {
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
        // token: generateToken(updatedUser._id.toString()),
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

export default router;
