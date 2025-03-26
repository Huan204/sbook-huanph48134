# Hướng dẫn chạy ứng dụng SBook

Ứng dụng SBook được tổ chức theo mô hình đầy đủ với:

- **Backend (server)**: Được viết bằng Node.js + Express + TypeScript
- **Frontend (client)**: Được viết bằng React
- **Admin Dashboard**: Trang quản trị hệ thống

## Cấu trúc dự án

```
sbook/
├── server/             # Backend API sử dụng Express + TypeScript
│   ├── src/            # Mã nguồn TypeScript
│   ├── dist/           # Mã đã được biên dịch
│   ├── .env            # Biến môi trường cho server
│   └── package.json    # Cấu hình package cho server
├── src/                # Frontend React application
│   ├── components/     # Các thành phần React
│   ├── App.js          # Component App chính
│   └── index.js        # Điểm vào của React app
├── public/             # Tài nguyên tĩnh
├── client-new/         # Phiên bản client mới (nếu có)
├── client-backup/      # Bản sao lưu của client
├── package.json        # Cấu hình package cho client
└── MONGODB_SETUP.md    # Hướng dẫn cài đặt MongoDB
```

## Cài đặt môi trường

### 1. Cài đặt MongoDB

Xem hướng dẫn trong file `MONGODB_SETUP.md`

### 2. Cài đặt thư viện

```bash
# Cài đặt thư viện cho server
cd server
npm install

# Cài đặt thư viện cho client (thư mục gốc)
cd ..
npm install
```

## Chạy ứng dụng

### 1. Khởi động Server (Backend)

```bash
cd server
npm run dev
```

Khi khởi động thành công, bạn sẽ thấy thông báo:

```
Server đang chạy ở chế độ development
Server đang chạy tại http://localhost:5001
```

### 2. Khởi động Client (Frontend)

```bash
# Từ thư mục gốc
npm start
```

Khi khởi động thành công, trình duyệt sẽ tự động mở trang web tại địa chỉ:

```
http://localhost:3000
```

### 3. Khởi động Admin Dashboard

Admin Dashboard được tích hợp trong ứng dụng và có thể truy cập qua đường dẫn:

```
http://localhost:3000/admin
```

Để đăng nhập vào trang Admin:

1. Sử dụng tài khoản có quyền admin (isAdmin: true trong cơ sở dữ liệu)
2. Sau khi đăng nhập, truy cập đường dẫn /admin

```bash
# Tạo tài khoản admin qua API (sử dụng Postman hoặc công cụ tương tự)
POST http://localhost:5001/api/users/register
Body: 
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "123456",
  "isAdmin": true


# Hoặc sử dụng script nếu có
cd server
npm run seed:admin
```

## Thông tin cấu hình và API

### Ports

- **Backend Server**: 5001 (cấu hình trong `server/.env`)
- **Frontend Client**: 3000 (cấu hình mặc định của React)
- **Admin Dashboard**: Sử dụng cùng port với Frontend (3000)
- **MongoDB**: 27017 (mặc định)

### Backend API Endpoints

#### Xác thực người dùng

- **Đăng ký**: `POST /api/users/register`
- **Đăng nhập**: `POST /api/users/login`
- **Thông tin người dùng**: `GET /api/users/profile`
- **Cập nhật thông tin**: `PUT /api/users/profile`

#### Sản phẩm

- **Lấy tất cả sản phẩm**: `GET /api/products`
- **Lấy chi tiết sản phẩm**: `GET /api/products/:id`
- **Tìm kiếm sản phẩm**: `GET /api/products/search?keyword=xyz`
- **Lọc theo danh mục**: `GET /api/products/category/:categoryId`

#### Đơn hàng

- **Tạo đơn hàng**: `POST /api/orders`
- **Lấy chi tiết đơn hàng**: `GET /api/orders/:id`
- **Lấy đơn hàng của người dùng**: `GET /api/orders/myorders`

#### API Admin

- **Quản lý người dùng**: `GET /api/admin/users`
- **Quản lý sản phẩm**: `POST/PUT/DELETE /api/admin/products`
- **Quản lý đơn hàng**: `GET /api/admin/orders`
- **Thống kê**: `GET /api/admin/dashboard`

### Frontend Routes

- **Trang chủ**: `/`
- **Chi tiết sản phẩm**: `/product/:id`
- **Giỏ hàng**: `/cart`
- **Đăng nhập**: `/login`
- **Đăng ký**: `/register`
- **Trang cá nhân**: `/profile`
- **Lịch sử đơn hàng**: `/orders`
- **Chi tiết đơn hàng**: `/order/:id`

### Admin Routes

- **Trang Dashboard**: `/admin`
- **Quản lý người dùng**: `/admin/users`
- **Quản lý sản phẩm**: `/admin/products`
- **Thêm/sửa sản phẩm**: `/admin/product/:id/edit`
- **Quản lý đơn hàng**: `/admin/orders`
- **Quản lý danh mục**: `/admin/categories`

## Xử lý lỗi phổ biến

1. **Lỗi server không khởi động**:

   - Kiểm tra xem MongoDB đã chạy chưa
   - Kiểm tra cổng 5001 đã được sử dụng bởi ứng dụng khác chưa
   - Kiểm tra file `.env` trong thư mục server (tham khảo `.env.example`)

2. **Lỗi client không kết nối được server**:

   - Kiểm tra server đã chạy thành công chưa
   - Kiểm tra cấu hình proxy trong `package.json` hoặc setupProxy.js
   - Kiểm tra công CORS trên server

3. **Lỗi không đăng nhập được**:

   - Kiểm tra kết nối MongoDB (chạy lệnh `mongo` để xác nhận)
   - Kiểm tra log server để xem lỗi xác thực
   - Kiểm tra Console trong trình duyệt để xem lỗi API

4. **Không truy cập được trang Admin**:
   - Xác nhận đã đăng nhập bằng tài khoản admin
   - Kiểm tra quyền isAdmin trong cơ sở dữ liệu
   - Kiểm tra router và auth middleware

## Môi trường phát triển

Dự án sử dụng TypeScript cho phần server và JavaScript cho phần client với các công nghệ:

- **Backend**: Node.js, Express, TypeScript, MongoDB + Mongoose
- **Frontend**: React, React Router, React Bootstrap

## Các script hữu ích

### Server

```bash
npm run dev      # Khởi động server với chế độ phát triển
npm run build    # Biên dịch TypeScript thành JavaScript
npm start        # Chạy phiên bản đã biên dịch (production)
npm run data:import  # Import dữ liệu mẫu
```

### Client

```bash
npm start        # Khởi động development server
npm run build    # Tạo bản build production
```

### Admin

Admin Dashboard được tích hợp trong client và sẽ tự động có sẵn khi bạn chạy client. Quyền truy cập được kiểm soát thông qua hệ thống xác thực người dùng và kiểm tra quyền (authorization middleware).

Phát triển bởi Huanlnph48134.
