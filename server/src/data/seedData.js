import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import colors from "colors";

// Import models
import User from "../models/User.js";
import Book from "../models/Book.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";

// Config
dotenv.config();

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/sbook")
  .then(() => console.log("MongoDB kết nối thành công"))
  .catch((err) => console.error(`Lỗi kết nối MongoDB: ${err.message}`));

// Dữ liệu mẫu
const users = [
  {
    name: "Admin User",
    email: "admin@sbook.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "Trần Thị B",
    email: "tranthib@gmail.com",
    password: bcrypt.hashSync("123456", 10),
  },
];

const categories = [
  {
    name: "Văn học Việt Nam",
    description: "Sách văn học Việt Nam",
  },
  {
    name: "Văn học nước ngoài",
    description: "Sách văn học nước ngoài được dịch sang tiếng Việt",
  },
  {
    name: "Kinh tế",
    description: "Sách về kinh tế, kinh doanh và tài chính",
  },
  {
    name: "Tâm lý - Kỹ năng sống",
    description: "Sách về tâm lý học và kỹ năng sống",
  },
  {
    name: "Thiếu nhi",
    description: "Sách dành cho trẻ em và thiếu niên",
  },
  {
    name: "Tiểu sử - Hồi ký",
    description: "Sách tiểu sử và hồi ký của các nhân vật nổi tiếng",
  },
];

const books = [
  {
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    description:
      "Đắc nhân tâm (tên tiếng Anh là How to Win Friends and Influence People) là một quyển sách nhằm tự giúp bản thân bán chạy nhất từ trước đến nay. Quyển sách này do Dale Carnegie viết và đã được xuất bản lần đầu vào năm 1936, nó đã được bán 15 triệu bản trên khắp thế giới.",
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/f1/a2/e6/34b64eb0925bc56e7480216d66df5857.jpg",
    category: "Tâm lý - Kỹ năng sống",
    price: 76000,
    countInStock: 50,
    rating: 4.5,
    numReviews: 0,
    reviews: [],
    discount: 0,
    isFeatured: true,
  },
  {
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    description:
      "Tất cả những trải nghiệm trong chuyến phiêu du theo đuổi vận mệnh của mình đã giúp Santiago thấu hiểu được ý nghĩa sâu xa nhất của hạnh phúc, hòa hợp với vũ trụ và con người.",
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/e1/04/02/1e87931a6774b61768df2536915a5893.jpg",
    category: "Văn học nước ngoài",
    price: 69000,
    countInStock: 40,
    rating: 4.8,
    numReviews: 0,
    reviews: [],
    discount: 10,
    isFeatured: true,
  },
  {
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    author: "Rosie Nguyễn",
    description:
      "Bạn hối tiếc vì đã không nắm bắt cơ hội trước mắt? Bạn nuối tiếc vì những ngày tháng thanh xuân chưa tận hưởng hết?...",
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/06/8f/8a/0eecece53de962f445a19f6bbc2286e8.jpg",
    category: "Tâm lý - Kỹ năng sống",
    price: 80000,
    countInStock: 30,
    rating: 4.2,
    numReviews: 0,
    reviews: [],
    discount: 5,
    isFeatured: true,
  },
  {
    title: "Tâm Lý Học Tội Phạm",
    author: "Hans Gross",
    description:
      "Cuốn sách là kết quả của nhiều năm nghiên cứu tội phạm bởi tác giả - người thẩm phán lừng danh Hans Gross.",
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/78/9d/70/c6ad8a5d08a744a08e3ec53204ccd48c.jpg",
    category: "Tâm lý - Kỹ năng sống",
    price: 125000,
    countInStock: 25,
    rating: 4.7,
    numReviews: 0,
    reviews: [],
    discount: 15,
    isFeatured: false,
  },
  {
    title: "Dám Bị Ghét",
    author: "Koga Fumitake, Kishimi Ichiro",
    description:
      "Dám Bị Ghét - cuốn sách gây chấn động Nhật Bản với lượng tiêu thụ hơn 3.5 triệu bản!",
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/53/fd/89/b1518598de2e6c97cc86ad47d55b88ef.jpg",
    category: "Tâm lý - Kỹ năng sống",
    price: 96000,
    countInStock: 35,
    rating: 4.4,
    numReviews: 0,
    reviews: [],
    discount: 0,
    isFeatured: false,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "Một cách dễ dàng và đã được chứng minh để xây dựng thói quen tốt và phá vỡ thói quen xấu.",
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/06/00/75/c99a500bc3adf9bf153cc856055f76fa.jpg",
    category: "Tâm lý - Kỹ năng sống",
    price: 155000,
    countInStock: 20,
    rating: 4.6,
    numReviews: 0,
    reviews: [],
    discount: 12,
    isFeatured: true,
  },
  {
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    description:
      "Mở đầu bằng những thanh âm trong sáng và kết thúc lắng lại trong những nốt trầm hoài niệm, Cây Cam Ngọt Của Tôi khiến ta nhận ra, cuộc đời đáng sống biết bao nhiêu.",
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
    category: "Văn học nước ngoài",
    price: 108000,
    countInStock: 30,
    rating: 4.9,
    numReviews: 0,
    reviews: [],
    discount: 20,
    isFeatured: true,
  },
  {
    title: "Tôi Tài Giỏi, Bạn Cũng Thế",
    author: "Adam Khoo",
    description:
      "Tôi Tài Giỏi, Bạn Cũng Thế là cuốn sách nằm trong bộ sách Tôi Tài Giỏi, bạn cũng thế của tác giả Adam Khoo.",
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/8c/32/ff/4d4b69e0d96f75761ce5af03ee467610.jpg",
    category: "Tâm lý - Kỹ năng sống",
    price: 115000,
    countInStock: 25,
    rating: 4.3,
    numReviews: 0,
    reviews: [],
    discount: 8,
    isFeatured: false,
  },
];

// Import dữ liệu
const importData = async () => {
  try {
    // Xóa dữ liệu cũ
    await User.deleteMany();
    await Book.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();

    // Tạo người dùng
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Tạo danh mục
    const createdCategories = await Category.insertMany(categories);

    // Tạo sách với ID người dùng và ID danh mục
    const sampleBooks = books.map((book) => {
      // Tìm ID của danh mục tương ứng
      const category = createdCategories.find(
        (cat) => cat.name === book.category
      );
      return {
        ...book,
        user: adminUser,
        category: category ? category._id : createdCategories[0]._id,
      };
    });

    await Book.insertMany(sampleBooks);

    console.log("Dữ liệu đã được import thành công".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Xóa tất cả dữ liệu
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();

    console.log("Dữ liệu đã được xóa thành công".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Thực thi
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
