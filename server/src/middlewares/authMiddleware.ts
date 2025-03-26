import * as jwt from "jsonwebtoken";
import * as asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { Types } from "mongoose";

// Interface cho dữ liệu được giải mã từ JWT
interface DecodedToken {
  id: string;
}

// Mở rộng interface Request để hỗ trợ user
export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    isAdmin: boolean;
  };
}

// Middleware bảo vệ route yêu cầu đăng nhập
export const protect = asyncHandler.default(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    // Kiểm tra token trong header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Lấy token từ header
        token = req.headers.authorization.split(" ")[1];

        // Giải mã token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "secret"
        ) as DecodedToken;

        // Tìm user từ id trong token và gán vào req.user
        const user = await User.findById(decoded.id).select("-password");

        if (user) {
          req.user = {
            _id: user._id as unknown as Types.ObjectId,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          };
        }

        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error("Không được phép truy cập, token không hợp lệ");
      }
    }

    if (!token) {
      res.status(401);
      throw new Error("Không được phép truy cập, không có token");
    }
  }
);

// Middleware kiểm tra quyền admin
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Không được phép truy cập, yêu cầu quyền admin");
  }
};
