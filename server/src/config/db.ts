import mongoose from "mongoose";
import * as colors from "colors";
import * as dotenv from "dotenv";

dotenv.config();

// Khai báo kiểu cho options
const options: mongoose.ConnectOptions = {
  // Loại bỏ các deprecated options
  serverSelectionTimeoutMS: 5000, // Thời gian timeout khi không thể kết nối
  socketTimeoutMS: 45000, // Thời gian timeout khi socket không hoạt động
  family: 4, // Ưu tiên sử dụng IPv4
};

const connectDB = async (): Promise<void> => {
  try {
    // Lấy URI từ biến môi trường hoặc sử dụng URI mặc định
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/sbook";

    const conn = await mongoose.connect(mongoURI, options);

    console.log(
      colors.cyan.underline(`MongoDB đã kết nối: ${conn.connection.host}`)
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(colors.red(`Lỗi kết nối MongoDB: ${error.message}`));

      // Lưu mongoURI trong biến để sử dụng trong block catch
      const mongoURI =
        process.env.MONGO_URI || "mongodb://localhost:27017/sbook";

      // Kiểm tra lỗi kết nối cụ thể
      if (error.message.includes("ECONNREFUSED")) {
        console.error(
          colors.yellow("Không thể kết nối đến MongoDB. Vui lòng kiểm tra:")
        );
        console.error(colors.yellow("1. MongoDB đã được cài đặt và đang chạy"));
        console.error(
          colors.yellow(
            "2. Địa chỉ và cổng trong connection string là chính xác"
          )
        );
        console.error(
          colors.yellow(`3. Connection string hiện tại: ${mongoURI}`)
        );
      } else if (error.name === "MongoServerSelectionError") {
        console.error(
          colors.yellow(
            "MongoDB không phản hồi. Vui lòng kiểm tra dịch vụ MongoDB đã khởi động chưa."
          )
        );
      }
    } else {
      console.error(
        colors.red("Đã xảy ra lỗi không xác định khi kết nối đến MongoDB")
      );
    }
    console.error(
      colors.red.bold(
        "Ứng dụng sẽ tiếp tục chạy nhưng các tính năng liên quan đến DB sẽ không hoạt động"
      )
    );
    // Không gọi process.exit(1) để cho phép ứng dụng tiếp tục chạy
  }
};

export default connectDB;
