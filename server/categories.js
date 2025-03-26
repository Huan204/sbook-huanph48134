const mongoose = require("mongoose");
const Category = require("./dist/models/Category").default;

mongoose
  .connect("mongodb://localhost:27017/sbook")
  .then(async () => {
    console.log("Kết nối MongoDB thành công");

    const categories = [
      { name: "Văn học", description: "Sách văn học", icon: "book" },
      { name: "Kinh tế", description: "Sách kinh tế", icon: "chart-line" },
      { name: "Khoa học", description: "Sách khoa học", icon: "flask" },
      {
        name: "Tiểu thuyết",
        description: "Sách tiểu thuyết",
        icon: "book-open",
      },
      { name: "Tâm lý học", description: "Sách tâm lý học", icon: "brain" },
      { name: "Thiếu nhi", description: "Sách thiếu nhi", icon: "child" },
      {
        name: "Kỹ năng sống",
        description: "Sách kỹ năng sống",
        icon: "hands-helping",
      },
      {
        name: "Giáo dục",
        description: "Sách giáo dục",
        icon: "graduation-cap",
      },
    ];

    try {
      // Xóa tất cả danh mục hiện có
      await Category.deleteMany({});

      // Thêm danh mục mới
      const result = await Category.insertMany(categories);
      console.log(`Đã thêm ${result.length} danh mục sách vào MongoDB`);
    } catch (error) {
      console.error("Lỗi:", error.message);
    } finally {
      mongoose.disconnect();
      console.log("Đã ngắt kết nối MongoDB");
    }
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
  });
