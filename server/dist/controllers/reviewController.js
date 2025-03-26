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
exports.createReview = exports.deleteReview = exports.updateReviewStatus = exports.getReviewById = exports.getReviews = exports.getAllReviewsFromCollection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Book_1 = __importDefault(require("../models/Book"));
const Review_1 = __importDefault(require("../models/Review")); // Import trực tiếp model Review
// @desc    Lấy tất cả đánh giá từ collection reviews
// @route   GET /api/reviews/all
// @access  Public
const getAllReviewsFromCollection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Lấy tất cả reviews từ collection reviews
        const reviews = yield Review_1.default.find({})
            .sort({ createdAt: -1 })
            .populate("user", "name")
            .populate("book", "title")
            .lean();
        // Trả về dữ liệu reviews
        res.json(reviews);
    }
    catch (error) {
        console.error("Lỗi khi lấy đánh giá từ collection:", error);
        res.status(500).json({
            message: "Không thể lấy danh sách đánh giá từ collection",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
});
exports.getAllReviewsFromCollection = getAllReviewsFromCollection;
// @desc    Lấy tất cả đánh giá
// @route   GET /api/reviews
// @access  Public
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookId } = req.query;
        // Nếu có bookId, chỉ lấy reviews của cuốn sách đó
        let booksQuery = { "reviews.0": { $exists: true } };
        if (bookId) {
            booksQuery = { _id: bookId, "reviews.0": { $exists: true } };
        }
        // Lấy tất cả sách có reviews
        const books = yield Book_1.default.find(booksQuery).select("title reviews").lean();
        // Chuyển đổi các reviews từ mảng trong Book thành định dạng cần thiết
        const reviews = [];
        for (const book of books) {
            for (const review of book.reviews) {
                // Bỏ qua các bình luận đã ẩn nếu không phải admin
                if (review.isHidden && !req.headers["is-admin"]) {
                    continue;
                }
                reviews.push({
                    _id: review._id,
                    bookId: book._id,
                    bookTitle: book.title,
                    userId: review.user,
                    userName: review.name,
                    rating: review.rating,
                    comment: review.comment,
                    status: "approved", // Mặc định các review trong Book là đã duyệt
                    createdAt: review.createdAt,
                    isHidden: review.isHidden !== undefined ? review.isHidden : false,
                });
            }
        }
        // Sắp xếp theo ngày tạo giảm dần
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.json(reviews);
    }
    catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        res.status(500).json({
            message: "Không thể lấy danh sách đánh giá",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
});
exports.getReviews = getReviews;
// @desc    Lấy đánh giá theo ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = req.params.id;
        // Tìm sách chứa review có ID này
        const book = yield Book_1.default.findOne({ "reviews._id": reviewId }).select("title reviews");
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        }
        // Tìm review cụ thể trong mảng reviews
        const review = book.reviews.find((r) => r._id.toString() === reviewId);
        if (review) {
            res.json({
                _id: review._id,
                bookId: book._id,
                bookTitle: book.title,
                userId: review.user,
                userName: review.name,
                rating: review.rating,
                comment: review.comment,
                status: "approved", // Mặc định các review trong Book là đã duyệt
                createdAt: review.createdAt,
                isHidden: review.isHidden !== undefined ? review.isHidden : false,
            });
        }
        else {
            res.status(404).json({ message: "Không tìm thấy đánh giá" });
        }
    }
    catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        res.status(500).json({
            message: "Không thể lấy đánh giá",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
});
exports.getReviewById = getReviewById;
// @desc    Cập nhật trạng thái đánh giá
// @route   PATCH /api/reviews/:id
// @access  Public
const updateReviewStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, isHidden } = req.body;
        const reviewId = req.params.id;
        // Tìm sách chứa review
        const book = yield Book_1.default.findOne({ "reviews._id": reviewId });
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        }
        // Tìm chỉ mục của review trong mảng reviews
        const reviewIndex = book.reviews.findIndex((r) => r._id.toString() === reviewId);
        if (reviewIndex === -1) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy bình luận trong sách" });
        }
        // Nếu có status trong request và status là rejected, xóa review
        if (status && status === "rejected") {
            book.reviews.splice(reviewIndex, 1);
            book.numReviews = book.reviews.length;
            // Cập nhật lại rating
            if (book.reviews.length > 0) {
                book.rating =
                    book.reviews.reduce((sum, review) => sum + review.rating, 0) /
                        book.reviews.length;
            }
            else {
                book.rating = 0;
            }
            yield book.save();
            return res.json({ message: "Đã từ chối và xóa bình luận" });
        }
        // Nếu có trường isHidden trong request, cập nhật trạng thái ẩn/hiện
        if (isHidden !== undefined) {
            try {
                // Trực tiếp cập nhật trường isHidden cho review trong mảng
                book.reviews[reviewIndex].isHidden = isHidden;
                // Lưu lại book sau khi cập nhật
                yield book.save();
                return res.json({
                    message: `Đã ${isHidden ? "ẩn" : "hiện"} bình luận thành công`,
                });
            }
            catch (error) {
                console.error("Lỗi khi cập nhật isHidden:", error);
                return res.status(500).json({
                    message: "Không thể cập nhật trạng thái ẩn/hiện của bình luận",
                    error: error instanceof Error ? error.message : "Lỗi không xác định",
                });
            }
        }
        // Nếu không có thay đổi gì, trả về thành công
        res.json({ message: "Không có thay đổi nào được thực hiện" });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật bình luận:", error);
        res.status(500).json({
            message: "Không thể cập nhật bình luận",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
});
exports.updateReviewStatus = updateReviewStatus;
// @desc    Xóa đánh giá
// @route   DELETE /api/reviews/:id
// @access  Public
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = req.params.id;
        // Tìm sách chứa review
        const book = yield Book_1.default.findOne({ "reviews._id": reviewId });
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        }
        // Xóa review khỏi mảng reviews
        const reviewIndex = book.reviews.findIndex((r) => r._id.toString() === reviewId);
        if (reviewIndex !== -1) {
            book.reviews.splice(reviewIndex, 1);
            book.numReviews = book.reviews.length;
            // Cập nhật lại rating
            if (book.reviews.length > 0) {
                book.rating =
                    book.reviews.reduce((sum, review) => sum + review.rating, 0) /
                        book.reviews.length;
            }
            else {
                book.rating = 0;
            }
            yield book.save();
            return res.json({ message: "Đã xóa bình luận" });
        }
        else {
            return res
                .status(404)
                .json({ message: "Không tìm thấy bình luận trong sách" });
        }
    }
    catch (error) {
        console.error("Lỗi khi xóa đánh giá:", error);
        res.status(500).json({
            message: "Không thể xóa đánh giá",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
});
exports.deleteReview = deleteReview;
// @desc    Tạo đánh giá mới
// @route   POST /api/reviews
// @access  Public
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookId, bookTitle, userId, userName, rating, comment } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!bookId || !userId || !rating || !comment) {
            return res
                .status(400)
                .json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }
        // Tìm sách theo ID
        const book = yield Book_1.default.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }
        // Tạo MongoDB ObjectId mới cho đánh giá
        const reviewId = new mongoose_1.default.Types.ObjectId();
        // Tạo review mới cho Book
        const reviewData = {
            _id: reviewId,
            name: userName,
            rating: Number(rating),
            comment,
            user: userId,
            createdAt: new Date(),
        };
        // Thêm review vào sách
        book.reviews.push(reviewData);
        book.numReviews = book.reviews.length;
        // Cập nhật rating
        book.rating =
            book.reviews.reduce((sum, item) => sum + item.rating, 0) /
                book.reviews.length;
        // Lưu sách
        yield book.save();
        // Tạo và lưu review vào collection riêng
        // Sử dụng Review đã import
        const newReview = new Review_1.default({
            _id: reviewId,
            user: userId,
            name: userName,
            book: bookId,
            bookTitle: bookTitle,
            rating: Number(rating),
            comment,
            createdAt: new Date(),
        });
        // Debug: kiểm tra dữ liệu trước khi lưu
        console.log("Dữ liệu review sẽ lưu:", JSON.stringify(newReview, null, 2));
        // Lưu vào collection reviews
        const savedReview = yield newReview.save();
        console.log("Đã lưu review với ID:", savedReview._id);
        res.status(201).json({
            message: "Đã thêm bình luận thành công",
            review: reviewData,
        });
    }
    catch (error) {
        console.error("Lỗi chi tiết khi tạo đánh giá:", error);
        res.status(500).json({
            message: "Không thể tạo đánh giá",
            error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
    }
});
exports.createReview = createReview;
