# Tài liệu dự án SBook

## Tổng quan dự án

SBook là một ứng dụng web bán sách trực tuyến với đầy đủ chức năng như đăng ký, đăng nhập, xem sách, thêm vào giỏ hàng, thanh toán và quản lý đơn hàng.

## Công nghệ sử dụng

### Frontend (Client)

- **Framework**: React 19
- **Ngôn ngữ**: TypeScript
- **Quản lý state**: Redux, Redux Toolkit
- **Routing**: React Router DOM v7
- **UI/CSS**: Bootstrap 5, Styled-components
- **HTTP Client**: Axios
- **Công cụ khác**: React Icons, React Bootstrap

### Backend (Server)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Ngôn ngữ**: TypeScript
- **Database**: MongoDB
- **ORM/ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Middleware**: cors, morgan (logging)
- **Environment**: dotenv

### Công cụ phát triển

- **Building**: TypeScript compiler
- **Development**: ts-node-dev (hot-reloading)
- **Package Manager**: npm

## Cấu trúc dự án

```
SBook/
├── client/              # Frontend React app
│   ├── public/          # Static files
│   ├── src/             # Source code
│   │   ├── api/         # API calls
│   │   ├── components/  # React components
│   │   ├── pages/       # React pages
│   │   ├── redux/       # Redux store, slices
│   │   ├── types/       # TypeScript type definitions
│   │   ├── utils/       # Utility functions
│   │   └── App.tsx      # Main application component
│   └── package.json     # Frontend dependencies
│
├── server/              # Backend Node.js app
│   ├── src/             # Source code
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── data/        # Seed data
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── types/       # TypeScript type definitions
│   │   ├── utils/       # Utility functions
│   │   └── server.ts    # Server entry point
│   └── package.json     # Backend dependencies
│
└── MONGODB_SETUP.md     # Hướng dẫn cài đặt MongoDB
```

## Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js (v16 trở lên)
- MongoDB (cài đặt cục bộ hoặc MongoDB Atlas)
- npm (Node Package Manager)

### Cài đặt MongoDB

- Xem hướng dẫn cài đặt trong file `MONGODB_SETUP.md`

### Cài đặt và chạy Backend

1. Di chuyển đến thư mục server:

```bash
cd server
```

2. Cài đặt các dependencies:

```bash
npm install
```

3. Tạo file .env (hoặc sao chép từ .env.example):

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/sbook
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Chạy server trong chế độ phát triển:

```bash
npm run dev
```

5. Để build server:

```bash
npm run build
```

6. Để khởi chạy server đã build:

```bash
npm start
```

7. Để nhập dữ liệu mẫu:

```bash
npm run data:import
```

8. Để xóa tất cả dữ liệu:

```bash
npm run data:destroy
```

### Cài đặt và chạy Frontend

1. Di chuyển đến thư mục client:

```bash
cd client
```

2. Cài đặt các dependencies:

```bash
npm install
```

3. Chạy ứng dụng trong chế độ phát triển:

```bash
npm start
```

4. Để build ứng dụng:

```bash
npm run build
```

### Lưu ý khi sử dụng PowerShell

Khi sử dụng PowerShell trên Windows, toán tử `&&` không được hỗ trợ. Thay vào đó, hãy thực hiện các lệnh tuần tự:

```powershell
cd server
npm run dev
```

## Các chức năng chính

### Chức năng người dùng

- Đăng ký tài khoản
- Đăng nhập/Đăng xuất
- Xem danh sách sách theo danh mục
- Tìm kiếm sách
- Xem chi tiết sách
- Đánh giá và nhận xét sách
- Thêm sách vào giỏ hàng
- Thanh toán đơn hàng
- Xem lịch sử đơn hàng
- Cập nhật thông tin cá nhân

### Chức năng Admin

- Quản lý người dùng (xem, sửa, xóa)
- Quản lý sách (thêm, sửa, xóa)
- Quản lý danh mục (thêm, sửa, xóa)
- Quản lý đơn hàng
- Xem thống kê doanh số

## Cấu trúc cơ sở dữ liệu

### Collection Users

- \_id: ObjectId
- name: String
- email: String
- password: String (đã mã hóa)
- phone: String
- address: String
- isAdmin: Boolean
- createdAt: Date

### Collection Books

- \_id: ObjectId
- user: ObjectId (tham chiếu đến người tạo)
- title: String
- author: String
- description: String
- image: String
- category: ObjectId (tham chiếu đến danh mục)
- price: Number
- countInStock: Number
- rating: Number
- numReviews: Number
- reviews: Array (danh sách đánh giá)
- discount: Number
- isFeatured: Boolean
- createdAt: Date

### Collection Categories

- \_id: ObjectId
- name: String
- description: String

### Collection Orders

- \_id: ObjectId
- user: ObjectId (tham chiếu đến người đặt)
- orderItems: Array (danh sách sản phẩm)
- shippingAddress: Object
- paymentMethod: String
- paymentResult: Object
- itemsPrice: Number
- shippingPrice: Number
- totalPrice: Number
- isPaid: Boolean
- paidAt: Date
- isDelivered: Boolean
- deliveredAt: Date
- status: String
- createdAt: Date

## Xử lý lỗi thường gặp

- Xem phần "Xử lý lỗi thường gặp" trong file MONGODB_SETUP.md
