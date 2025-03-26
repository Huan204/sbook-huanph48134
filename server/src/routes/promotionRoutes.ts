import express from "express";
import {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion,
  applyPromotion,
  getActivePromotions,
} from "../controllers/promotionController";
import { protect, admin } from "../middlewares/authMiddleware";

const router = express.Router();

// Route công khai
router.get("/active", getActivePromotions);
router.post("/validate", validatePromotion);
router.post("/apply", protect, applyPromotion);

// Route chỉ quản trị viên mới có quyền truy cập
router.get("/", protect, admin, getAllPromotions);
router.get("/:id", protect, admin, getPromotionById);
router.post("/", protect, admin, createPromotion);
router.put("/:id", protect, admin, updatePromotion);
router.delete("/:id", protect, admin, deletePromotion);

export default router;
