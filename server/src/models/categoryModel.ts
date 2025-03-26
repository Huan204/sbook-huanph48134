import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên danh mục"],
      trim: true,
      maxlength: [50, "Tên danh mục không được vượt quá 50 ký tự"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, "Mô tả danh mục không được vượt quá 500 ký tự"],
    },
  },
  {
    timestamps: true,
  }
);

// Tạo slug từ tên danh mục trước khi lưu
CategorySchema.pre<ICategory>("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(
        /[^\w\sàáạãảăắằẳẵặâấầẩẫậèéẹẽẻêếềểễệìíịĩỉòóọõỏôốồổỗộơớờởỡợùúụũủưứừửữựỳýỵỹỷđ]+/g,
        ""
      )
      .replace(/\s+/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }
  next();
});

export default mongoose.model<ICategory>("Category", CategorySchema);
