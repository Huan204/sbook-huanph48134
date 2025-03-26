import mongoose, { Document } from "mongoose";

// Interface for review
export interface IReview {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isHidden?: boolean;
}

// Interface for Book
export interface IBook extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  author: string;
  description: string;
  image: string;
  images: string[];
  category: mongoose.Types.ObjectId;
  price: number;
  publisher: string;
  publishedDate: Date;
  pages: number;
  countInStock: number;
  rating: number;
  numReviews: number;
  reviews: IReview[];
  isFeatured: boolean;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review Schema
const reviewSchema = new mongoose.Schema(
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false }
);

// Book Schema
const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [String],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    publisher: {
      type: String,
      required: false,
    },
    publishedDate: {
      type: Date,
      required: false,
    },
    pages: {
      type: Number,
      required: false,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: [reviewSchema],
    discount: {
      type: Number,
      required: false,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for book's URL
bookSchema.virtual("url").get(function (this: IBook) {
  return `/books/${this._id}`;
});

// Ensure virtuals are included when converting to JSON
bookSchema.set("toJSON", { virtuals: true });
bookSchema.set("toObject", { virtuals: true });

const Book = mongoose.model<IBook>("Book", bookSchema);

export default Book;
