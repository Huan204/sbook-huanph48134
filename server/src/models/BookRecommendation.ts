import mongoose, { Document, Schema, Model } from "mongoose";

// Định nghĩa interface cho statics
interface IBookRecommendationModel extends Model<IBookRecommendation> {
  generateRecommendations(
    userId: mongoose.Types.ObjectId
  ): Promise<IBookRecommendation>;
}

export interface IBookRecommendation extends Document {
  user: mongoose.Types.ObjectId;
  recommendedBooks: {
    book: mongoose.Types.ObjectId;
    score: number;
    recommendationReason: string;
  }[];
  reviews: {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    book: mongoose.Types.ObjectId;
    name: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  lastUpdated: Date;
}

const BookRecommendationSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    recommendedBooks: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        recommendationReason: {
          type: String,
          required: true,
          enum: [
            "Dựa trên sách đã mua",
            "Sách cùng tác giả",
            "Sách cùng thể loại",
            "Xu hướng phổ biến",
            "Được đánh giá cao",
            "Người dùng khác cũng mua",
            "Mới ra mắt",
          ],
        },
      },
    ],
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        book: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Book",
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Phương thức để tạo gợi ý sách cho người dùng
BookRecommendationSchema.statics.generateRecommendations = async function (
  userId: mongoose.Types.ObjectId
) {
  try {
    // Tìm kiếm user history
    const OrderHistory = mongoose.model("OrderHistory");
    const Book = mongoose.model("Book");

    const userHistory = await OrderHistory.findOne({ user: userId }).populate({
      path: "frequentlyPurchasedBooks.book",
      select: "category author",
    });

    if (!userHistory || !userHistory.frequentlyPurchasedBooks.length) {
      // Nếu người dùng chưa có lịch sử, gợi ý sách phổ biến
      const popularBooks = await Book.find({ numReviews: { $gt: 5 } })
        .sort({ rating: -1 })
        .limit(10);

      const recommendations = {
        user: userId,
        recommendedBooks: popularBooks.map((book) => ({
          book: book._id,
          score: Math.floor(book.rating * 20),
          recommendationReason: "Được đánh giá cao",
        })),
        lastUpdated: new Date(),
      };

      return await this.findOneAndUpdate({ user: userId }, recommendations, {
        upsert: true,
        new: true,
      });
    }

    // Trường hợp người dùng đã có lịch sử mua hàng
    // 1. Lấy các thể loại và tác giả phổ biến
    const purchasedBookInfo = userHistory.frequentlyPurchasedBooks.map(
      (item) => ({
        bookId: item.book._id,
        category: item.book.category,
        author: item.book.author,
        count: item.count,
      })
    );

    const categories = purchasedBookInfo
      .map((info) => info.category)
      .filter((value, index, self) => self.indexOf(value) === index);

    const authors = purchasedBookInfo
      .map((info) => info.author)
      .filter((value, index, self) => self.indexOf(value) === index);

    const purchasedBooks = purchasedBookInfo.map((info) => info.bookId);

    // 2. Tìm sách cùng thể loại nhưng chưa mua
    const categoryBooks = await Book.find({
      category: { $in: categories },
      _id: { $nin: purchasedBooks },
    }).limit(5);

    // 3. Tìm sách cùng tác giả nhưng chưa mua
    const authorBooks = await Book.find({
      author: { $in: authors },
      _id: { $nin: purchasedBooks },
    }).limit(5);

    // 4. Tìm sách bán chạy
    const trendingBooks = await Book.find({
      _id: { $nin: purchasedBooks },
    })
      .sort({ numReviews: -1 })
      .limit(5);

    // 5. Sách mới
    const newBooks = await Book.find({
      _id: { $nin: purchasedBooks },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Kết hợp các gợi ý
    const allRecommendations = [
      ...categoryBooks.map((book) => ({
        book: book._id,
        score: 85,
        recommendationReason: "Sách cùng thể loại",
      })),
      ...authorBooks.map((book) => ({
        book: book._id,
        score: 90,
        recommendationReason: "Sách cùng tác giả",
      })),
      ...trendingBooks.map((book) => ({
        book: book._id,
        score: 75,
        recommendationReason: "Xu hướng phổ biến",
      })),
      ...newBooks.map((book) => ({
        book: book._id,
        score: 70,
        recommendationReason: "Mới ra mắt",
      })),
    ];

    // Sắp xếp theo điểm số
    allRecommendations.sort((a, b) => b.score - a.score);

    // Loại bỏ trùng lặp và lấy tối đa 15 gợi ý
    const uniqueRecommendations = [];
    const bookIds = new Set();

    for (const rec of allRecommendations) {
      if (!bookIds.has(rec.book.toString())) {
        bookIds.add(rec.book.toString());
        uniqueRecommendations.push(rec);
        if (uniqueRecommendations.length >= 15) break;
      }
    }

    // Cập nhật hoặc tạo mới
    return await this.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        recommendedBooks: uniqueRecommendations,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error generating book recommendations:", error);
    throw error;
  }
};

export default mongoose.model<IBookRecommendation, IBookRecommendationModel>(
  "BookRecommendation",
  BookRecommendationSchema
);
