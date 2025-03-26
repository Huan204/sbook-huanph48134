"use strict";
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
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Book_1 = __importDefault(require("../models/Book"));
const mongoose_1 = __importDefault(require("mongoose"));
const bookController_1 = require("../controllers/bookController");
const router = express_1.default.Router();
// @route   GET /api/books
// @desc    Lấy tất cả sách
// @access  Public
router.get("/", bookController_1.getBooks);
// @route   GET /api/books/featured
// @desc    Lấy sách nổi bật
// @access  Public
router.get("/featured", bookController_1.getFeaturedBooks);
// @route   GET /api/books/latest
// @desc    Lấy sách mới nhất
// @access  Public
router.get("/latest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Số lượng sách mới nhất cần lấy
        const limit = Number(req.query.limit) || 8;
        // Lấy danh sách sách mới nhất
        const books = yield Book_1.default.find({}).sort({ createdAt: -1 }).limit(limit);
        res.json(books);
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy sách mới nhất" });
    }
}));
// @route   GET /api/books/search
// @desc    Tìm kiếm sách
// @access  Public
router.get("/search", bookController_1.searchBooks);
// @route   GET /api/books/allreviews
// @desc    Lấy tất cả bình luận từ bảng Books
// @access  Public
router.get("/allreviews", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Thêm CORS headers
        res.header("Access-Control-Allow-Origin", "http://localhost:3001");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "GET");
        res.header("Access-Control-Allow-Credentials", "true");
        console.log("Đang lấy dữ liệu bình luận từ bảng Books...");
        // Tìm tất cả sách có chứa reviews
        const books = yield Book_1.default.find({ "reviews.0": { $exists: true } }).select("title reviews");
        console.log(`Tìm thấy ${books.length} sách có bình luận`);
        if (!books || books.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }
        // Tạo mảng chứa tất cả bình luận từ các sách
        let allReviews = [];
        books.forEach((book) => {
            // Thêm tiêu đề sách vào mỗi review
            const bookReviews = book.reviews.map((review) => (Object.assign(Object.assign({}, (review.toObject ? review.toObject() : review)), { bookTitle: book.title, bookId: book._id })));
            allReviews = [...allReviews, ...bookReviews];
        });
        console.log(`Tổng số bình luận: ${allReviews.length}`);
        res.status(200).json({
            success: true,
            data: allReviews,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy bình luận từ Books:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy bình luận",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
}));
// @route   GET /api/books/getallreviews
// @desc    Lấy tất cả bình luận từ bảng BookRecommendation
// @access  Public
router.get("/getallreviews", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Thêm CORS headers
        res.header("Access-Control-Allow-Origin", "http://localhost:3001");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "GET");
        res.header("Access-Control-Allow-Credentials", "true");
        // Lấy model BookRecommendation
        const BookRecommendation = mongoose_1.default.model("BookRecommendation");
        console.log("Đang truy vấn dữ liệu từ bảng BookRecommendation...");
        // Tìm tất cả reviews từ bảng bookrecommendations
        const recommendationDoc = yield BookRecommendation.findOne({});
        console.log("Kết quả truy vấn:", recommendationDoc ? "Tìm thấy document" : "Không tìm thấy document");
        if (!recommendationDoc ||
            !recommendationDoc.reviews ||
            recommendationDoc.reviews.length === 0) {
            console.log("Không có dữ liệu bình luận nào");
            return res.status(200).json({
                success: true,
                data: [],
            });
        }
        // Chuyển document thành plain object
        const recommendationData = recommendationDoc.toObject
            ? recommendationDoc.toObject()
            : recommendationDoc;
        console.log(`Số lượng bình luận tìm thấy: ${recommendationData.reviews.length}`);
        // Xử lý dữ liệu để thêm tiêu đề sách
        const reviewsWithBookTitle = recommendationData.reviews.map((review) => {
            return {
                _id: review._id,
                name: review.name,
                user: review.user,
                book: review.book,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                bookTitle: review.book && review.book.title
                    ? review.book.title
                    : "Không có tiêu đề",
            };
        });
        console.log("Đã xử lý dữ liệu bình luận thành công, trả về", reviewsWithBookTitle.length, "bản ghi");
        res.status(200).json({
            success: true,
            data: reviewsWithBookTitle,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy bình luận từ BookRecommendation:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy bình luận",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
}));
// @route   GET /api/books/recommendations
// @desc    Lấy đề xuất sách cho người dùng
// @access  Private
router.route("/recommendations").get(authMiddleware_1.protect, bookController_1.getRecommendedBooks);
// @route   GET /api/books/category/:categoryId
// @desc    Lấy sách theo danh mục
// @access  Public
router.get("/category/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const pageSize = 10;
        const page = Number(req.query.page) || 1;
        // Lọc sách theo danh mục
        const count = yield Book_1.default.countDocuments({ category: categoryId });
        const books = yield Book_1.default.find({ category: categoryId })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });
        res.json({
            books,
            page,
            pages: Math.ceil(count / pageSize),
            count,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy sách theo danh mục" });
    }
}));
// @route   GET /api/books/:id
// @desc    Lấy sách theo ID
// @access  Public
router.get("/:id", bookController_1.getBookById);
// @route   GET /api/books/:id/reviews
// @desc    Lấy tất cả bình luận của một sách
// @access  Public
router.get("/:id/reviews", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.params.id;
        const book = yield Book_1.default.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sách",
            });
        }
        res.status(200).json({
            success: true,
            data: book.reviews,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy bình luận",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
}));
// @route   POST /api/books/:id/reviews
// @desc    Tạo đánh giá sách
// @access  Private
router.post("/:id/reviews", authMiddleware_1.protect, bookController_1.createBookReview);
// @desc    Thêm sách mới
// @route   POST /api/books
// @access  Private/Admin
router.post("/", authMiddleware_1.protect, authMiddleware_1.admin, bookController_1.createBook);
// @desc    Cập nhật sách
// @route   PUT /api/books/:id
// @access  Private/Admin
router.put("/:id", authMiddleware_1.protect, authMiddleware_1.admin, bookController_1.updateBook);
// @desc    Xóa sách
// @route   DELETE /api/books/:id
// @access  Private/Admin
router.delete("/:id", authMiddleware_1.protect, authMiddleware_1.admin, bookController_1.deleteBook);
// @route   GET /api/books/:id/similar
// @desc    Lấy sách tương tự với sách hiện tại
// @access  Public
router.route("/:id/similar").get(bookController_1.getSimilarBooks);
exports.default = router;
