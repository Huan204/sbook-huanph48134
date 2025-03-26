import { Request, Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import Book from "../models/Book";
import Review from "../models/Review"; // Import trực tiếp model Review

// @desc    Lấy tất cả đánh giá từ collection reviews
// @route   GET /api/reviews/all
// @access  Public
export const getAllReviewsFromCollection = async (
  req: Request,
  res: Response
) => {
  try {
    // Lấy tất cả reviews từ collection reviews
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .populate("book", "title")
      .lean();

    // Trả về dữ liệu reviews
    res.json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá từ collection:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách đánh giá từ collection",
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    });
  }
};

// @desc    Lấy tất cả đánh giá
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.query;

    // Nếu có bookId, chỉ lấy reviews của cuốn sách đó
    let booksQuery: FilterQuery<typeof Book> = {
      "reviews.0": { $exists: true },
    };
    if (bookId) {
      booksQuery = { _id: bookId, "reviews.0": { $exists: true } };
    }

    // Lấy tất cả sách có reviews
    const books = await Book.find(booksQuery).select("title reviews").lean();

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
    reviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách đánh giá",
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    });
  }
};

// @desc    Lấy đánh giá theo ID
// @route   GET /api/reviews/:id
// @access  Public
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;

    // Tìm sách chứa review có ID này
    const book = await Book.findOne({ "reviews._id": reviewId }).select(
      "title reviews"
    );

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
    } else {
      res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    res.status(500).json({
      message: "Không thể lấy đánh giá",
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    });
  }
};

// @desc    Cập nhật trạng thái đánh giá
// @route   PATCH /api/reviews/:id
// @access  Public
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { status, isHidden } = req.body;
    const reviewId = req.params.id;

    // Tìm sách chứa review
    const book = await Book.findOne({ "reviews._id": reviewId });

    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    // Tìm chỉ mục của review trong mảng reviews
    const reviewIndex = book.reviews.findIndex(
      (r) => r._id.toString() === reviewId
    );

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
      } else {
        book.rating = 0;
      }

      await book.save();
      return res.json({ message: "Đã từ chối và xóa bình luận" });
    }

    // Nếu có trường isHidden trong request, cập nhật trạng thái ẩn/hiện
    if (isHidden !== undefined) {
      try {
        // Trực tiếp cập nhật trường isHidden cho review trong mảng
        book.reviews[reviewIndex].isHidden = isHidden;

        // Lưu lại book sau khi cập nhật
        await book.save();

        return res.json({
          message: `Đã ${isHidden ? "ẩn" : "hiện"} bình luận thành công`,
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật isHidden:", error);
        return res.status(500).json({
          message: "Không thể cập nhật trạng thái ẩn/hiện của bình luận",
          error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
      }
    }

    // Nếu không có thay đổi gì, trả về thành công
    res.json({ message: "Không có thay đổi nào được thực hiện" });
  } catch (error) {
    console.error("Lỗi khi cập nhật bình luận:", error);
    res.status(500).json({
      message: "Không thể cập nhật bình luận",
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    });
  }
};

// @desc    Xóa đánh giá
// @route   DELETE /api/reviews/:id
// @access  Public
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;

    // Tìm sách chứa review
    const book = await Book.findOne({ "reviews._id": reviewId });

    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    // Xóa review khỏi mảng reviews
    const reviewIndex = book.reviews.findIndex(
      (r) => r._id.toString() === reviewId
    );
    if (reviewIndex !== -1) {
      book.reviews.splice(reviewIndex, 1);
      book.numReviews = book.reviews.length;

      // Cập nhật lại rating
      if (book.reviews.length > 0) {
        book.rating =
          book.reviews.reduce((sum, review) => sum + review.rating, 0) /
          book.reviews.length;
      } else {
        book.rating = 0;
      }

      await book.save();
      return res.json({ message: "Đã xóa bình luận" });
    } else {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bình luận trong sách" });
    }
  } catch (error) {
    console.error("Lỗi khi xóa đánh giá:", error);
    res.status(500).json({
      message: "Không thể xóa đánh giá",
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    });
  }
};

// @desc    Tạo đánh giá mới
// @route   POST /api/reviews
// @access  Public
export const createReview = async (req: Request, res: Response) => {
  try {
    const { bookId, bookTitle, userId, userName, rating, comment } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!bookId || !userId || !rating || !comment) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Tìm sách theo ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    // Tạo MongoDB ObjectId mới cho đánh giá
    const reviewId = new mongoose.Types.ObjectId();

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
    await book.save();

    // Tạo và lưu review vào collection riêng
    // Sử dụng Review đã import
    const newReview = new Review({
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
    const savedReview = await newReview.save();
    console.log("Đã lưu review với ID:", savedReview._id);

    res.status(201).json({
      message: "Đã thêm bình luận thành công",
      review: reviewData,
    });
  } catch (error) {
    console.error("Lỗi chi tiết khi tạo đánh giá:", error);
    res.status(500).json({
      message: "Không thể tạo đánh giá",
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    });
  }
};
