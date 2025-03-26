"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// @route   POST /api/users
// @desc    Đăng ký người dùng mới
// @access  Public
router.post("/", userController_1.registerUser);
// @route   POST /api/users/login
// @desc    Đăng nhập người dùng & lấy token
// @access  Public
router.post("/login", userController_1.authUser);
// @route   GET /api/users/profile
// @desc    Lấy thông tin người dùng
// @access  Private
router
    .route("/profile")
    .get(authMiddleware_1.protect, userController_1.getUserProfile)
    .put(authMiddleware_1.protect, userController_1.updateUserProfile);
// @route   GET /api/users
// @desc    Lấy tất cả người dùng
// @access  Private/Admin
router.route("/").get(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.getUsers);
// @route   GET /api/users/:id
// @desc    Lấy thông tin người dùng theo ID
// @access  Private/Admin
router
    .route("/:id")
    .get(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.getUserById)
    .put(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.updateUser)
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.deleteUser);
exports.default = router;
