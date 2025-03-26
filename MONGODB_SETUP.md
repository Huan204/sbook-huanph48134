# Hướng dẫn cài đặt và sử dụng MongoDB cho SBook

## 1. Cài đặt MongoDB

### Cài đặt MongoDB Community Edition trên Windows

1. Truy cập trang chủ MongoDB: https://www.mongodb.com/try/download/community
2. Chọn phiên bản mới nhất, chọn "Windows" và tải xuống file MSI
3. Chạy file cài đặt và làm theo hướng dẫn
4. Chọn "Complete" khi được hỏi về loại cài đặt
5. Chọn "Install MongoDB as a Service" để MongoDB tự động khởi động khi khởi động Windows
6. Hoàn tất quá trình cài đặt

### Cài đặt MongoDB Compass (GUI cho MongoDB)

1. Truy cập: https://www.mongodb.com/try/download/compass
2. Tải xuống và cài đặt MongoDB Compass
3. Sau khi cài đặt, mở MongoDB Compass và kết nối với MongoDB bằng URL: `mongodb://localhost:27017`

## 2. Cấu hình dự án để kết nối với MongoDB

1. Mở file `.env` trong thư mục gốc của dự án và đảm bảo có biến môi trường sau:

```
MONGO_URI=mongodb://localhost:27017/sbook
```

2. Nếu bạn sử dụng MongoDB Atlas (cloud), thay thế URI bằng connection string của bạn:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sbook
```

## 3. Tạo cơ sở dữ liệu và nhập dữ liệu mẫu

### Tự động nhập dữ liệu mẫu

1. Chạy MongoDB service (nếu chưa chạy)
2. Mở terminal trong thư mục `server` của dự án
3. Chạy lệnh sau để nhập dữ liệu mẫu:

```
npm run data:import
```

4. Để xóa tất cả dữ liệu, chạy:

```
npm run data:destroy
```

### Tạo cơ sở dữ liệu thủ công bằng MongoDB Compass

1. Mở MongoDB Compass và kết nối với `mongodb://localhost:27017`
2. Nhấp vào "Create Database"
3. Nhập tên cơ sở dữ liệu: `sbook` và tên collection đầu tiên: `users`
4. Nhấp vào "Create Database"
5. Tạo các collection sau:
   - `books`
   - `categories`
   - `orders`
   - `users`

## 4. Cấu trúc các bảng (Collections) trong MongoDB

### Collection `users`

```json
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "password": String, // Đã được mã hóa
  "phone": String,
  "address": String,
  "isAdmin": Boolean,
  "createdAt": Date
}
```

### Collection `books`

```json
{
  "_id": ObjectId,
  "user": ObjectId, // Tham chiếu đến user đã tạo sách
  "title": String,
  "author": String,
  "description": String,
  "image": String,
  "category": ObjectId, // Tham chiếu đến danh mục
  "price": Number,
  "countInStock": Number,
  "rating": Number,
  "numReviews": Number,
  "reviews": [
    {
      "user": ObjectId, // Tham chiếu đến user đã đánh giá
      "name": String,
      "rating": Number,
      "comment": String,
      "createdAt": Date
    }
  ],
  "discount": Number,
  "isFeatured": Boolean,
  "createdAt": Date
}
```

### Collection `categories`

```json
{
  "_id": ObjectId,
  "name": String,
  "description": String
}
```

### Collection `orders`

```json
{
  "_id": ObjectId,
  "user": ObjectId, // Tham chiếu đến user đã đặt hàng
  "orderItems": [
    {
      "book": ObjectId, // Tham chiếu đến sách
      "title": String,
      "quantity": Number,
      "image": String,
      "price": Number
    }
  ],
  "shippingAddress": {
    "address": String,
    "city": String,
    "postalCode": String,
    "country": String
  },
  "paymentMethod": String,
  "paymentResult": {
    "id": String,
    "status": String,
    "update_time": String,
    "email_address": String
  },
  "itemsPrice": Number,
  "shippingPrice": Number,
  "totalPrice": Number,
  "isPaid": Boolean,
  "paidAt": Date,
  "isDelivered": Boolean,
  "deliveredAt": Date,
  "status": String,
  "createdAt": Date
}
```

## 5. Xử lý lỗi thường gặp

### Lỗi kết nối MongoDB

- Đảm bảo dịch vụ MongoDB đang chạy
- Kiểm tra cổng 27017 có mở không
- Kiểm tra firewall có chặn kết nối không

### Lỗi "Authentication failed"

- Kiểm tra lại thông tin đăng nhập trong connection string
- Đảm bảo người dùng có quyền đọc/ghi trên database

### Lỗi "Maximum update depth exceeded" trong React

- Đây là lỗi vòng lặp vô hạn trong useEffect
- Kiểm tra dependency array trong useEffect

### Lỗi "Failed to load resource: the server responded with a status of 400"

- Kiểm tra cấu hình API endpoint trong file axiosConfig.ts
- Đảm bảo server đang chạy
- Kiểm tra dữ liệu gửi lên server có đúng định dạng không
