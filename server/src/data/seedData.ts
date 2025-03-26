import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as colors from "colors";
import * as bcrypt from "bcryptjs";
import connectDB from "../config/db";

// Import models
import User from "../models/User";
import Book from "../models/Book";
import Category from "../models/Category";
import Order from "../models/Order";
import Promotion from "../models/Promotion";

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

// Dữ liệu mẫu
const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "0912345678",
    address: "Hà Nội",
    isAdmin: true,
  },
  {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "0987654321",
    address: "Hồ Chí Minh",
    isAdmin: false,
  },
  {
    name: "Trần Thị B",
    email: "tranthib@example.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "0123456789",
    address: "Đà Nẵng",
    isAdmin: false,
  },
];

const categories = [
  {
    name: "Tiểu thuyết",
    description: "Các tác phẩm tiểu thuyết nổi tiếng",
    icon: "book",
  },
  {
    name: "Kinh doanh",
    description: "Sách về kinh doanh và khởi nghiệp",
    icon: "briefcase",
  },
  {
    name: "Khoa học",
    description: "Sách khoa học và công nghệ",
    icon: "atom",
  },
  {
    name: "Lịch sử",
    description: "Sách về lịch sử thế giới",
    icon: "landmark",
  },
  {
    name: "Tâm lý học",
    description: "Sách về tâm lý học và phát triển bản thân",
    icon: "brain",
  },
];

// Dữ liệu mẫu cho khuyến mãi
const promotions = [
  {
    code: "WELCOME15",
    type: "percentage",
    value: 15,
    minPurchase: 100000,
    maxDiscount: 50000,
    description: "Giảm 15% cho đơn hàng đầu tiên",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
    usageLimit: 1000,
    usageCount: 0,
  },
  {
    code: "FREESHIP",
    type: "fixed",
    value: 30000,
    minPurchase: 200000,
    description: "Miễn phí vận chuyển",
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isActive: true,
    usageLimit: 500,
    usageCount: 0,
  },
  {
    code: "SUMMER2023",
    type: "percentage",
    value: 10,
    minPurchase: 150000,
    maxDiscount: 100000,
    description: "Khuyến mãi hè 2023",
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    usageLimit: 300,
    usageCount: 0,
  },
  {
    code: "BOOKWORM",
    type: "fixed",
    value: 50000,
    minPurchase: 300000,
    description: "Ưu đãi đặc biệt cho độc giả thân thiết",
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    isActive: true,
    usageLimit: 200,
    usageCount: 0,
  },
];

const books = [
  {
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    description:
      "Đắc nhân tâm là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.",
    category: "Tâm lý học",
    price: 79000,
    countInStock: 10,
    rating: 4.5,
    numReviews: 12,
    image: "/images/dac-nhan-tam.jpg",
    discount: 10,
    isFeatured: true,
    publisher: "NXB Tổng hợp TP.HCM",
    publishedDate: new Date("2016-01-01"),
    pages: 320,
  },
  {
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    description:
      "Tiểu thuyết Nhà giả kim của Paulo Coelho như một câu chuyện cổ tích giản dị, nhân ái, giàu chất thơ, thấm đẫm những minh triết huyền bí của phương Đông.",
    category: "Tiểu thuyết",
    price: 69000,
    countInStock: 7,
    rating: 4.7,
    numReviews: 8,
    image: "/images/nha-gia-kim.jpg",
    discount: 5,
    isFeatured: true,
    publisher: "NXB Văn học",
    publishedDate: new Date("2013-10-01"),
    pages: 228,
  },
  {
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    description:
      "Cây Cam Ngọt Của Tôi kể về cậu bé Zezé sống cùng gia đình nghèo khó nhưng đầy tình yêu thương. Với trí tưởng tượng phong phú, cậu đã làm bạn với một cây cam ngọt.",
    category: "Tiểu thuyết",
    price: 108000,
    countInStock: 5,
    rating: 4.8,
    numReviews: 15,
    image: "/images/cay-cam-ngot-cua-toi.jpg",
    discount: 15,
    isFeatured: false,
    publisher: "NXB Hội Nhà Văn",
    publishedDate: new Date("2018-03-01"),
    pages: 244,
  },
  {
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    description:
      "Sapiens là một chuyến du hành vào lịch sử loài người, từ khi còn là những sinh vật tầm thường sống ở châu Phi cho đến khi trở thành chúa tể của cả thế giới.",
    category: "Lịch sử",
    price: 189000,
    countInStock: 4,
    rating: 4.9,
    numReviews: 25,
    image: "/images/sapiens.jpg",
    discount: 20,
    isFeatured: true,
    publisher: "NXB Thế Giới",
    publishedDate: new Date("2019-05-01"),
    pages: 560,
  },
  {
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    description:
      "Nghĩ Giàu Làm Giàu là một trong những cuốn sách bán chạy nhất mọi thời đại. Đây là cuốn sách dạy làm giàu đầu tiên và hay nhất từ trước đến nay.",
    category: "Kinh doanh",
    price: 98000,
    countInStock: 8,
    rating: 4.6,
    numReviews: 18,
    image: "/images/nghi-giau-lam-giau.jpg",
    discount: 8,
    isFeatured: true,
    publisher: "NXB Trẻ",
    publishedDate: new Date("2019-01-01"),
    pages: 400,
  },
  {
    title: "Vũ Trụ Trong Vỏ Hạt Dẻ",
    author: "Stephen Hawking",
    description:
      "Vũ Trụ Trong Vỏ Hạt Dẻ là cuốn sách nổi tiếng của nhà vật lý thiên tài Stephen Hawking về các lý thuyết mới nhất trong vật lý hiện đại.",
    category: "Khoa học",
    price: 120000,
    countInStock: 6,
    rating: 4.5,
    numReviews: 10,
    image: "/images/vu-tru-trong-vo-hat-de.jpg",
    discount: 12,
    isFeatured: false,
    publisher: "NXB Trẻ",
    publishedDate: new Date("2017-03-01"),
    pages: 240,
  },
];

// Hàm import dữ liệu
const importData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Book.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await Promotion.deleteMany({});

    // Thêm users mẫu
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Thêm categories mẫu
    const createdCategories = await Category.insertMany(categories);

    // Ánh xạ tên danh mục sang ID danh mục
    const categoryMap = new Map();
    createdCategories.forEach((cat) => {
      categoryMap.set(cat.name, cat._id);
    });

    // Cập nhật category ID cho books
    const sampleBooks = books.map((book) => {
      // Chuyển đổi tên danh mục sang ObjectId
      const categoryId =
        categoryMap.get(book.category) || createdCategories[0]._id;

      return {
        ...book,
        user: adminUser,
        category: categoryId,
      };
    });

    // Thêm books mẫu
    await Book.insertMany(sampleBooks);

    // Thêm promotions mẫu
    await Promotion.insertMany(promotions);

    console.log(colors.green.inverse("Dữ liệu đã được import thành công!"));
    process.exit();
  } catch (error) {
    console.error(colors.red.inverse(`Lỗi: ${error}`));
    process.exit(1);
  }
};

// Hàm xóa tất cả dữ liệu
const destroyData = async () => {
  try {
    await Book.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await Promotion.deleteMany({});

    console.log(colors.red.inverse("Dữ liệu đã bị xóa!"));
    process.exit();
  } catch (error) {
    console.error(colors.red.inverse(`Lỗi: ${error}`));
    process.exit(1);
  }
};

// Xử lý tham số dòng lệnh
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
