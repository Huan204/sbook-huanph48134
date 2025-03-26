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
const express = require("express");
const dotenv = __importStar(require("dotenv"));
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const db_1 = __importDefault(require("./config/db"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const promotionRoutes_1 = __importDefault(require("./routes/promotionRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const colors = __importStar(require("colors"));
const mongoose_1 = __importDefault(require("mongoose"));
// Cài đặt env
dotenv.config();
// Khởi tạo kết nối DB
(0, db_1.default)();
const app = express();
// Middleware cơ bản
app.use(express.json());
// Cấu hình CORS để chấp nhận kết nối từ client
app.use(cors({
    origin: [
        process.env.CLIENT_URL || "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5003",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
}));
console.log(`CORS được cấu hình cho: ${process.env.CLIENT_URL || "http://localhost:3000"}, http://localhost:3001, http://localhost:3002, http://localhost:5003`);
// Sử dụng middleware Morgan trong môi trường development
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
// Cấu hình phục vụ file tĩnh
// Kiểm tra và sử dụng __dirname nếu đã có sẵn trong môi trường
const currentDir = path.resolve();
console.log("Đường dẫn hiện tại:", currentDir);
console.log("Đường dẫn public:", path.join(currentDir, "public"));
// Phục vụ thư mục public cho các file tĩnh
app.use("/public", express.static(path.join(currentDir, "public")));
app.use("/images", express.static(path.join(currentDir, "public", "images")));
app.use("/images/payments", express.static(path.join(currentDir, "public", "images", "payments")));
// Phục vụ file trang chủ ở route /
app.get("/", (req, res) => {
    res.json({ message: "API đang hoạt động. Hãy sử dụng /api để truy cập API" });
});
// Middleware xử lý lỗi MongoDB - đặt trước routes
app.use((req, res, next) => {
    // @ts-ignore - thêm thuộc tính mới vào req
    req.mongoDBConnected = true;
    // Kiểm tra nếu Mongoose không được kết nối
    if (mongoose_1.default) {
        try {
            // Kiểm tra trạng thái kết nối
            const state = mongoose_1.default.connection.readyState;
            if (state !== 1) {
                // 1 = connected
                // @ts-ignore - thiết lập trạng thái MongoDB
                req.mongoDBConnected = false;
            }
        }
        catch (error) {
            // @ts-ignore - thiết lập trạng thái MongoDB
            req.mongoDBConnected = false;
        }
    }
    next();
});
// Routes
app.use("/api/books", (req, res, next) => {
    console.log(`[BOOKS API] ${req.method} ${req.originalUrl}`);
    // @ts-ignore - kiểm tra nếu MongoDB không kết nối
    if (!req.mongoDBConnected && req.method !== "GET") {
        return res.status(503).json({
            message: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
        });
    }
    next();
}, bookRoutes_1.default);
app.use("/api/users", (req, res, next) => {
    // @ts-ignore - kiểm tra nếu MongoDB không kết nối
    if (!req.mongoDBConnected) {
        return res.status(503).json({
            message: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
        });
    }
    next();
}, userRoutes_1.default);
app.use("/api/orders", (req, res, next) => {
    // @ts-ignore - kiểm tra nếu MongoDB không kết nối
    if (!req.mongoDBConnected) {
        return res.status(503).json({
            message: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
        });
    }
    next();
}, orderRoutes_1.default);
app.use("/api/categories", (req, res, next) => {
    console.log(`[CATEGORIES API] ${req.method} ${req.originalUrl}`);
    // @ts-ignore - kiểm tra nếu MongoDB không kết nối
    if (!req.mongoDBConnected && req.method !== "GET") {
        return res.status(503).json({
            message: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
        });
    }
    next();
}, categoryRoutes_1.default);
app.use("/api/reviews", (req, res, next) => {
    // @ts-ignore - kiểm tra nếu MongoDB không kết nối
    if (!req.mongoDBConnected) {
        return res.status(503).json({
            message: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
        });
    }
    next();
}, reviewRoutes_1.default);
app.use("/api/promotions", (req, res, next) => {
    // Timeout xử lý cho route promotions
    res.setTimeout(60000, () => {
        console.error(`[Timeout Warning] Request to ${req.originalUrl} timed out`);
        res.status(504).json({
            success: false,
            message: "Yêu cầu đã hết thời gian xử lý. Vui lòng thử lại sau.",
        });
    });
    // @ts-ignore - kiểm tra nếu MongoDB không kết nối
    if (!req.mongoDBConnected &&
        !(req.method === "GET" && req.path === "/active")) {
        return res.status(503).json({
            message: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
        });
    }
    // Log request to promotions API
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
}, promotionRoutes_1.default);
app.use("/api/cart", (req, res, next) => {
    // @ts-ignore - kiểm tra nếu MongoDB không kết nối
    if (!req.mongoDBConnected) {
        return res.status(503).json({
            message: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
        });
    }
    next();
}, cartRoutes_1.default);
// Admin routes
app.use("/api/admin", (req, res, next) => {
    // @ts-ignore - kiểm tra nếu MongoDB không kết nối
    if (!req.mongoDBConnected) {
        return res.status(503).json({
            message: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
        });
    }
    next();
}, adminRoutes_1.default);
// Thêm route trực tiếp cho /admin
app.use("/admin", (req, res) => {
    const redirectUrl = "/api/admin" + req.url;
    console.log(`Chuyển hướng từ ${req.originalUrl} đến ${redirectUrl}`);
    res.redirect(redirectUrl);
});
// Thêm route trực tiếp cho /categories và /books/featured
app.use("/categories", (req, res) => {
    const redirectUrl = "/api/categories" + req.url;
    console.log(`Chuyển hướng từ ${req.originalUrl} đến ${redirectUrl}`);
    res.redirect(redirectUrl);
});
app.use("/books/featured", (req, res) => {
    const redirectUrl = "/api/books/featured" + req.url;
    console.log(`Chuyển hướng từ ${req.originalUrl} đến ${redirectUrl}`);
    res.redirect(redirectUrl);
});
// Thêm route trực tiếp cho /users và các đường dẫn con
app.use("/users", (req, res) => {
    const redirectUrl = "/api" + req.originalUrl;
    console.log(`Chuyển hướng từ ${req.originalUrl} đến ${redirectUrl}`);
    // Sử dụng redirect để client tạo request mới
    res.redirect(redirectUrl);
});
// Thêm route trực tiếp cho /promotions
app.use("/promotions", (req, res) => {
    // Chuyển hướng tất cả các request đến /promotions tới /api/promotions
    const originalUrl = req.originalUrl;
    let redirectUrl = "";
    if (originalUrl === "/promotions" || originalUrl === "/promotions/") {
        // Nếu gọi đúng đến /promotions thì chuyển hướng đến API lấy promotions đang hoạt động
        redirectUrl = "/api/promotions/active";
    }
    else {
        // Các route con khác trong /promotions
        redirectUrl = "/api" + originalUrl;
    }
    console.log(`Chuyển hướng từ ${originalUrl} đến ${redirectUrl}`);
    res.redirect(redirectUrl);
});
// Thêm route trực tiếp cho /books
app.use("/books", (req, res, next) => {
    // Nếu là /books/featured thì bỏ qua vì đã xử lý ở trên
    if (req.originalUrl.startsWith("/books/featured")) {
        return next();
    }
    // Xác định URL chuyển hướng
    let redirectUrl = "";
    // Nếu có ID trong đường dẫn
    if (req.originalUrl.match(/^\/books\/[^\/]+$/)) {
        const id = req.originalUrl.split("/")[2];
        redirectUrl = `/api/books/${id}`;
    }
    // Nếu có reviews trong đường dẫn
    else if (req.originalUrl.match(/^\/books\/[^\/]+\/reviews$/)) {
        const id = req.originalUrl.split("/")[2];
        redirectUrl = `/api/books/${id}/reviews`;
    }
    // Mặc định
    else {
        redirectUrl = "/api" + req.originalUrl;
    }
    console.log(`Chuyển hướng từ ${req.originalUrl} đến ${redirectUrl}`);
    res.redirect(redirectUrl);
});
// Route kiểm tra API
app.get("/api", (req, res) => {
    res.json({ message: "API đang hoạt động" });
});
// API thống kê cho Admin
app.get("/api/admin/stats", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timeRange = req.query.timeRange || "30days";
        console.log(`[Admin Stats] Lấy thống kê cho khoảng thời gian: ${timeRange}`);
        // Dữ liệu mẫu cho biểu đồ doanh số theo tháng
        const salesByMonth = [
            { month: "Tháng 1", sales: 1200000 },
            { month: "Tháng 2", sales: 1900000 },
            { month: "Tháng 3", sales: 2500000 },
            { month: "Tháng 4", sales: 2100000 },
            { month: "Tháng 5", sales: 2800000 },
            { month: "Tháng 6", sales: 3200000 },
            { month: "Tháng 7", sales: 2700000 },
            { month: "Tháng 8", sales: 2900000 },
            { month: "Tháng 9", sales: 3500000 },
            { month: "Tháng 10", sales: 3700000 },
            { month: "Tháng 11", sales: 4200000 },
            { month: "Tháng 12", sales: 4800000 },
        ];
        // Dữ liệu mẫu cho sản phẩm bán chạy
        const topProducts = [
            {
                id: "SP001",
                name: "Sách Văn học đương đại",
                sales: 120,
                revenue: 2400000,
            },
            {
                id: "SP002",
                name: "Sách Kinh tế học cơ bản",
                sales: 85,
                revenue: 1700000,
            },
            {
                id: "SP003",
                name: "Sách Lịch sử Việt Nam",
                sales: 72,
                revenue: 1440000,
            },
            { id: "SP004", name: "Sách Thiếu nhi", sales: 68, revenue: 1360000 },
            { id: "SP005", name: "Sách Tâm lý học", sales: 54, revenue: 1080000 },
        ];
        // Dữ liệu mẫu cho thống kê theo danh mục
        const categoryStats = [
            { name: "Văn học", count: 230, percentage: 35 },
            { name: "Kinh tế", count: 150, percentage: 23 },
            { name: "Thiếu nhi", count: 120, percentage: 18 },
            { name: "Lịch sử", count: 85, percentage: 13 },
            { name: "Tâm lý - Kỹ năng sống", count: 70, percentage: 11 },
        ];
        // Doanh thu tổng cộng
        const totalRevenue = 35000000;
        // Tổng số đơn hàng
        const totalOrders = 620;
        // Giá trị trung bình mỗi đơn hàng
        const averageOrderValue = totalRevenue / totalOrders;
        // Trả về dữ liệu thống kê
        return res.json({
            salesByMonth,
            topProducts,
            categoryStats,
            totalRevenue,
            totalOrders,
            averageOrderValue,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy thống kê admin:", error);
        return res.status(500).json({
            message: "Lỗi khi lấy dữ liệu thống kê",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Middleware xử lý lỗi MongoDB
app.use((err, req, res, next) => {
    if (err &&
        (err.name === "MongoError" || err.name === "MongoServerSelectionError")) {
        console.error(colors.red(`Lỗi MongoDB: ${err.message}`));
        return res.status(503).json({
            message: "Lỗi kết nối đến máy chủ dữ liệu. Vui lòng kiểm tra kết nối MongoDB của bạn hoặc thử lại sau.",
            error: err.message,
        });
    }
    next(err);
});
// Middleware xử lý lỗi 404
app.use((req, res) => {
    res.status(404).json({ message: "Route không tồn tại" });
});
// Kiểm tra cổng đã được sử dụng chưa
const checkPort = (port) => {
    return new Promise((resolve, reject) => {
        // Tạo server tạm để kiểm tra cổng
        const server = require("http").createServer();
        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.log(colors.yellow(`Cổng ${port} đã được sử dụng, đang thử cổng ${port + 1}`));
                resolve(checkPort(port + 1)); // Thử cổng kế tiếp
            }
            else {
                reject(err);
            }
        });
        server.on("listening", () => {
            server.close();
            resolve(port);
        });
        server.listen(port);
    });
};
// Khởi động server với kiểm tra cổng
let PORT = process.env.PORT ? parseInt(process.env.PORT) : 5001;
checkPort(PORT)
    .then((availablePort) => {
    PORT = availablePort;
    app.listen(PORT, () => {
        console.log(colors.yellow.bold(`Server đang chạy ở chế độ ${process.env.NODE_ENV}`));
        console.log(colors.cyan.bold(`Server đang chạy tại http://localhost:${PORT}`));
    });
})
    .catch((err) => {
    console.error(colors.red(`Không thể khởi động server: ${err.message}`));
});
