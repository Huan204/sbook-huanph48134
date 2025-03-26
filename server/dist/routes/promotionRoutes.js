"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promotionController_1 = require("../controllers/promotionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Route công khai
router.get("/active", promotionController_1.getActivePromotions);
router.post("/validate", promotionController_1.validatePromotion);
router.post("/apply", authMiddleware_1.protect, promotionController_1.applyPromotion);
// Route chỉ quản trị viên mới có quyền truy cập
router.get("/", authMiddleware_1.protect, authMiddleware_1.admin, promotionController_1.getAllPromotions);
router.get("/:id", authMiddleware_1.protect, authMiddleware_1.admin, promotionController_1.getPromotionById);
router.post("/", authMiddleware_1.protect, authMiddleware_1.admin, promotionController_1.createPromotion);
router.put("/:id", authMiddleware_1.protect, authMiddleware_1.admin, promotionController_1.updatePromotion);
router.delete("/:id", authMiddleware_1.protect, authMiddleware_1.admin, promotionController_1.deletePromotion);
exports.default = router;
