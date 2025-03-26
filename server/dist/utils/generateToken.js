"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    // Lấy JWT_SECRET và JWT_EXPIRES_IN từ biến môi trường, hoặc sử dụng giá trị mặc định
    const JWT_SECRET = process.env.JWT_SECRET || "sbook_secret_key_123";
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";
    // Ký và trả về token
    return jsonwebtoken_1.default.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
exports.default = generateToken;
