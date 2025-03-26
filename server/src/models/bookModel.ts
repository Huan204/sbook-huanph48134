import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  image: string;
  price: number;
  discount?: number;
  category: mongoose.Types.ObjectId;
  stock: number;
  rating: number;
  numReviews: number;
  reviews: Array<{
    user: mongoose.Types.ObjectId;
    name: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  pages: number;
  publisher: string;
  publishedDate: string;
  language: string;
  isbn: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
  },
  {
    timestamps: true,
  }
);

const BookSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Vui lòng nhập tên sách"],
      trim: true,
      maxlength: [100, "Tên sách không được vượt quá 100 ký tự"],
    },
    author: {
      type: String,
      required: [true, "Vui lòng nhập tên tác giả"],
      trim: true,
      maxlength: [100, "Tên tác giả không được vượt quá 100 ký tự"],
    },
    description: {
      type: String,
      required: [true, "Vui lòng nhập mô tả sách"],
    },
    image: {
      type: String,
      required: [true, "Vui lòng thêm hình ảnh sách"],
    },
    price: {
      type: Number,
      required: [true, "Vui lòng nhập giá sách"],
      min: [0, "Giá sách không được âm"],
    },
    discount: {
      type: Number,
      min: [0, "Giảm giá không được âm"],
      max: [100, "Giảm giá không được vượt quá 100%"],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Vui lòng chọn danh mục sách"],
      ref: "Category",
    },
    stock: {
      type: Number,
      required: [true, "Vui lòng nhập số lượng sách trong kho"],
      min: [0, "Số lượng sách không được âm"],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [ReviewSchema],
    pages: {
      type: Number,
      required: [true, "Vui lòng nhập số trang sách"],
      min: [1, "Số trang sách phải lớn hơn 0"],
    },
    publisher: {
      type: String,
      required: [true, "Vui lòng nhập nhà xuất bản"],
      trim: true,
    },
    publishedDate: {
      type: String,
      required: [true, "Vui lòng nhập ngày xuất bản"],
    },
    language: {
      type: String,
      required: [true, "Vui lòng nhập ngôn ngữ sách"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "Vui lòng nhập ISBN sách"],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBook>("Book", BookSchema);
