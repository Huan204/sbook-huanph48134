import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken";
import User from "../models/User";
import { AuthRequest } from "../middlewares/authMiddleware";

// @desc    Đăng nhập người dùng & lấy token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);
    // Kiểm tra email
    const user = await User.findOne({ email, isAdmin: false }).select(
      "+password"
    );

    if (!user) {
      res.status(401).json({
        message: "Email không tồn tại hoặc không có quyền admin",
      });
      return;
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        message: "Mật khẩu không đúng",
      });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("Lỗi đăng nhập admin:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// @desc    Đăng ký người dùng mới
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Kiểm tra xem email đã tồn tại chưa
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email đã được sử dụng");
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
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(400);
    throw new Error("Dữ liệu người dùng không hợp lệ");
  }
});

// @desc    Lấy thông tin người dùng
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Không tìm thấy thông tin người dùng");
  }

  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Không tìm thấy thông tin người dùng");
    }

    const user = await User.findById(req.user._id);

    if (user) {
      // Cập nhật thông tin
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.avatar = req.body.avatar || user.avatar;

      // Cập nhật mật khẩu nếu có
      if (req.body.password) {
        user.password = req.body.password;
      }

      // Lưu thông tin đã cập nhật
      const updatedUser = await user.save();

      // Trả về thông tin đã cập nhật
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id.toString()),
      });
    } else {
      res.status(404);
      throw new Error("Không tìm thấy người dùng");
    }
  }
);

// @desc    Lấy tất cả người dùng
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc    Xóa người dùng
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Không cho phép xóa tài khoản admin
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Không thể xóa tài khoản admin");
    }

    // Xóa người dùng
    await user.deleteOne();
    res.json({ message: "Đã xóa người dùng" });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});

// @desc    Lấy thông tin người dùng theo ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Cập nhật thông tin
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.isAdmin =
      req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

    // Lưu thông tin đã cập nhật
    const updatedUser = await user.save();

    // Trả về thông tin đã cập nhật
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
