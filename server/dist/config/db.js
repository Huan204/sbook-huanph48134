"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const colors = __importStar(require("colors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Khai báo kiểu cho options
const options = {
    // Loại bỏ các deprecated options
    serverSelectionTimeoutMS: 5000, // Thời gian timeout khi không thể kết nối
    socketTimeoutMS: 45000, // Thời gian timeout khi socket không hoạt động
    family: 4, // Ưu tiên sử dụng IPv4
};
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Lấy URI từ biến môi trường hoặc sử dụng URI mặc định
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/sbook";
        const conn = yield mongoose_1.default.connect(mongoURI, options);
        console.log(colors.cyan.underline(`MongoDB đã kết nối: ${conn.connection.host}`));
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(colors.red(`Lỗi kết nối MongoDB: ${error.message}`));
            // Lưu mongoURI trong biến để sử dụng trong block catch
            const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/sbook";
            // Kiểm tra lỗi kết nối cụ thể
            if (error.message.includes("ECONNREFUSED")) {
                console.error(colors.yellow("Không thể kết nối đến MongoDB. Vui lòng kiểm tra:"));
                console.error(colors.yellow("1. MongoDB đã được cài đặt và đang chạy"));
                console.error(colors.yellow("2. Địa chỉ và cổng trong connection string là chính xác"));
                console.error(colors.yellow(`3. Connection string hiện tại: ${mongoURI}`));
            }
            else if (error.name === "MongoServerSelectionError") {
                console.error(colors.yellow("MongoDB không phản hồi. Vui lòng kiểm tra dịch vụ MongoDB đã khởi động chưa."));
            }
        }
        else {
            console.error(colors.red("Đã xảy ra lỗi không xác định khi kết nối đến MongoDB"));
        }
        console.error(colors.red.bold("Ứng dụng sẽ tiếp tục chạy nhưng các tính năng liên quan đến DB sẽ không hoạt động"));
        // Không gọi process.exit(1) để cho phép ứng dụng tiếp tục chạy
    }
});
exports.default = connectDB;
