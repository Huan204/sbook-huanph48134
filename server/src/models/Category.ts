import mongoose, { Document } from 'mongoose';

// Interface for Category
export interface ICategory extends Document {
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    icon: {
      type: String,
      default: 'book',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for category's URL
categorySchema.virtual('url').get(function (this: ICategory) {
  return `/categories/${this._id}`;
});

// Ensure virtuals are included when converting to JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
