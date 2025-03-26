import mongoose, { Document } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
  book: mongoose.Types.ObjectId;
  bookTitle?: string;
  isHidden?: boolean;
}

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
    book: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Book",
    },
    bookTitle: {
      type: String,
      required: false,
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
  {
    timestamps: false,
    collection: "reviews",
  }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
