import express from "express";
import { Request, Response } from "express";
import User from "../models/User";
import { protect, admin } from "../middlewares/authMiddleware";
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from "../controllers/userController";

const router = express.Router();

// @route   POST /api/users
// @desc    Đăng ký người dùng mới
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/users/login
// @desc    Đăng nhập người dùng & lấy token
// @access  Public
router.post("/login", authUser);

// @route   GET /api/users/profile
// @desc    Lấy thông tin người dùng
// @access  Private
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// @route   GET /api/users
// @desc    Lấy tất cả người dùng
// @access  Private/Admin
router.route("/").get(protect, admin, getUsers);

// @route   GET /api/users/:id
// @desc    Lấy thông tin người dùng theo ID
// @access  Private/Admin
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
