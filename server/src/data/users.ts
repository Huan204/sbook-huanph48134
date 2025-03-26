import bcrypt from "bcryptjs";

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
    phone: "0987654321",
    address: {
      street: "123 Đường Admin",
      city: "Hà Nội",
      postalCode: "100000",
      country: "Việt Nam",
    },
  },
  {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "0912345678",
    address: {
      street: "456 Đường Lê Lợi",
      city: "Hồ Chí Minh",
      postalCode: "700000",
      country: "Việt Nam",
    },
  },
  {
    name: "Trần Thị B",
    email: "tranthib@example.com",
    password: bcrypt.hashSync("123456", 10),
    phone: "0923456789",
    address: {
      street: "789 Đường Trần Phú",
      city: "Đà Nẵng",
      postalCode: "550000",
      country: "Việt Nam",
    },
  },
];

export default users;
