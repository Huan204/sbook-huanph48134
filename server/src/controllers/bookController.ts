import { Request, Response } from "express";
import Book, { IBook } from "../models/Book";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware";
import BookRecommendation from "../models/BookRecommendation";
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware";

// @desc    Fetch all books
// @route   GET /api/books
// @access  Public
export const getBooks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    console.log("[Controller] getBooks được gọi với query:", req.query);

    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
      console.log("Đang lấy tất cả sách từ database...");
      const books = await Book.find({});
      console.log(`Tìm thấy ${books.length} sách`);
      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      });
    } catch (error) {
      console.error("Lỗi khi lấy sách:", error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Lỗi không xác định",
        });
      }
    }
  }
);

// @desc    Fetch single book
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Lỗi không xác định",
      });
    }
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    // Kiểm tra xem người dùng có tồn tại trong request không
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Không được phép truy cập",
      });
    }

    const book = new Book({
      user: req.user._id,
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      image: req.body.image,
      category: req.body.category,
      price: req.body.price,
      countInStock: req.body.countInStock,
      discount: req.body.discount,
      isFeatured: req.body.isFeatured,
    });

    const createdBook = await book.save();

    res.status(201).json({
      success: true,
      data: createdBook,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Lỗi không xác định",
      });
    }
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
export const updateBook = async (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      description,
      image,
      category,
      price,
      countInStock,
      discount,
      isFeatured,
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
      });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.image = image || book.image;
    book.category = category || book.category;
    book.price = price !== undefined ? price : book.price;
    book.countInStock =
      countInStock !== undefined ? countInStock : book.countInStock;
    book.discount = discount !== undefined ? discount : book.discount;
    book.isFeatured = isFeatured !== undefined ? isFeatured : book.isFeatured;

    const updatedBook = await book.save();

    res.status(200).json({
      success: true,
      data: updatedBook,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Lỗi không xác định",
      });
    }
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: "Sách đã được xóa",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Lỗi không xác định",
      });
    }
  }
};

// @desc    Create new review
// @route   POST /api/books/:id/reviews
// @access  Private
export const createBookReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
      });
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để đánh giá sách",
      });
    }

    // Kiểm tra dữ liệu hợp lệ
    if (!req.user._id) {
      return res.status(400).json({
        success: false,
        message: "Thông tin người dùng không hợp lệ",
      });
    }

    // Tạo một đánh giá mới
    const review = {
      _id: new mongoose.Types.ObjectId(),
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      createdAt: new Date(),
    };

    // Thêm đánh giá mới vào mảng đánh giá của sách
    book.reviews.push(review);

    // Cập nhật số lượng đánh giá
    book.numReviews = book.reviews.length;

    // Tính toán lại điểm đánh giá trung bình
    book.rating =
      book.reviews.reduce((acc, item) => item.rating + acc, 0) /
      book.reviews.length;

    // Lưu thông tin sách với đánh giá mới
    await book.save();

    // Lưu bình luận vào bảng BookRecommendation
    try {
      const BookRecommendation = mongoose.model("BookRecommendation");

      // Tạo entry mới cho bình luận trong BookRecommendation với cùng ID để có thể tham chiếu
      const reviewForRecommendation = {
        _id: review._id, // Sử dụng cùng ID để có thể tham chiếu
        user: req.user._id,
        book: book._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
        createdAt: new Date(),
      };

      console.log(
        "Thêm bình luận vào BookRecommendation:",
        reviewForRecommendation
      );

      // Tìm hoặc tạo collection BookRecommendation và thêm review vào
      const recommendationDoc = await BookRecommendation.findOne({});

      if (recommendationDoc) {
        // Nếu đã có document, thêm review vào mảng reviews
        recommendationDoc.reviews.push(reviewForRecommendation);
        await recommendationDoc.save();
        console.log(
          "Đã thêm bình luận vào document BookRecommendation hiện có"
        );
      } else {
        // Nếu chưa có document nào, tạo mới với mảng reviews chứa review hiện tại
        await BookRecommendation.create({
          reviews: [reviewForRecommendation],
          lastUpdated: new Date(),
        });
        console.log("Đã tạo document BookRecommendation mới với bình luận");
      }

      console.log("Đã lưu bình luận vào BookRecommendation thành công");
    } catch (err) {
      console.error("Lỗi khi lưu bình luận vào BookRecommendation:", err);
      // Không throw lỗi ở đây để không ảnh hưởng đến việc lưu bình luận vào Book
    }

    res.status(201).json({
      success: true,
      message: "Đã thêm đánh giá thành công",
      review: review,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Lỗi không xác định",
      });
    }
  }
};

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
export const getFeaturedBooks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    console.log("[Controller] getFeaturedBooks được gọi");

    try {
      const featuredBooks = await Book.find({ isFeatured: true }).limit(8);
      console.log(`Tìm thấy ${featuredBooks.length} sách nổi bật`);

      res.json(featuredBooks);
    } catch (error) {
      console.error("Lỗi trong getFeaturedBooks:", error);
      res.status(500).json({ message: "Lỗi khi lấy sách nổi bật" });
    }
  }
);

// @desc    Get books with discount
// @route   GET /api/books/discounted
// @access  Public
export const getDiscountedBooks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 8;
    console.log("Đang lấy sách giảm giá với limit:", limit);

    // Sử dụng $expr để so sánh oldPrice và price
    const books = await Book.find({
      oldPrice: { $exists: true, $ne: null },
      $expr: { $gt: ["$oldPrice", "$price"] },
    }).limit(limit);

    console.log(`Tìm thấy ${books.length} sách giảm giá`);

    res.json(books);
  } catch (error: any) {
    console.error("Lỗi khi lấy sách giảm giá:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy sách giảm giá",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
export const searchBooks = async (req: Request, res: Response) => {
  try {
    console.log("Query params:", req.query);

    // Xây dựng bộ lọc từ query params
    let filters: any = {};

    // Tìm kiếm theo từ khóa (title hoặc author)
    if (req.query.keyword) {
      filters.$or = [
        {
          title: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
        {
          author: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
      ];
    }

    // Lọc theo danh mục
    if (req.query.category) {
      filters.category = req.query.category;
    }

    // Lọc theo khoảng giá
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) {
        filters.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filters.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Lọc theo giảm giá
    if (req.query.discount === "true") {
      filters.discount = { $gt: 0 };
    }

    console.log("Filters:", filters);

    // Phân trang
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sắp xếp
    let sort = {};
    if (req.query.sort) {
      const sortParam = req.query.sort.toString();

      if (sortParam === "price_asc") sort = { price: 1 };
      else if (sortParam === "price_desc") sort = { price: -1 };
      else if (sortParam === "title_asc") sort = { title: 1 };
      else if (sortParam === "title_desc") sort = { title: -1 };
      else if (sortParam === "rating_desc") sort = { rating: -1 };
      else sort = { createdAt: -1 }; // Mặc định: sách mới nhất
    }

    // Thực hiện truy vấn
    const books = await Book.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("category", "name");

    // Đếm tổng số kết quả
    const total = await Book.countDocuments(filters);

    console.log(`Tìm thấy ${books.length} sách trong tổng số ${total} kết quả`);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: books,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sách:", error);
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Lỗi không xác định",
      });
    }
  }
};

// @desc    Get book recommendations for user
// @route   GET /api/books/recommendations
// @access  Private
export const getRecommendedBooks = async (req: AuthRequest, res: Response) => {
  try {
    // Kiểm tra người dùng đã đăng nhập
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Không được phép truy cập",
      });
    }

    // Tìm kiếm gợi ý sách hiện có
    let recommendations = await BookRecommendation.findOne({
      user: req.user._id,
    }).populate({
      path: "recommendedBooks.book",
      select: "title author image price rating numReviews discount description",
    });

    // Nếu chưa có gợi ý hoặc gợi ý đã cũ (quá 7 ngày), tạo mới
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (!recommendations || recommendations.lastUpdated < oneWeekAgo) {
      // Tạo gợi ý mới
      const newRecommendations =
        await BookRecommendation.generateRecommendations(req.user._id);

      // Populate dữ liệu sách cho đề xuất mới
      recommendations = await BookRecommendation.findById(
        newRecommendations._id
      ).populate({
        path: "recommendedBooks.book",
        select:
          "title author image price rating numReviews discount description",
      });
    }

    if (!recommendations) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy gợi ý sách phù hợp",
      });
    }

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Lỗi không xác định",
      });
    }
  }
};

// @desc    Get similar books to a specific book
// @route   GET /api/books/:id/similar
// @access  Public
export const getSimilarBooks = async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách",
      });
    }

    // Tìm sách tương tự dựa trên cùng thể loại, cùng tác giả
    const similarBooks = await Book.find({
      $or: [
        { category: book.category, _id: { $ne: book._id } },
        { author: book.author, _id: { $ne: book._id } },
      ],
    })
      .limit(5)
      .select("title author image price rating numReviews discount");

    res.status(200).json({
      success: true,
      count: similarBooks.length,
      data: similarBooks,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Lỗi không xác định",
      });
    }
  }
};
