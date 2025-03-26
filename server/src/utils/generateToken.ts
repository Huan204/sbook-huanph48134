import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { Types } from "mongoose";

const generateToken = (id: string | Types.ObjectId): string => {
  // Lấy JWT_SECRET và JWT_EXPIRES_IN từ biến môi trường, hoặc sử dụng giá trị mặc định
  const JWT_SECRET: Secret = process.env.JWT_SECRET || "sbook_secret_key_123";
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

  // Ký và trả về token
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };

  return jwt.sign({ id }, JWT_SECRET, options);
};

export default generateToken;
