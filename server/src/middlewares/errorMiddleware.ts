import { Request, Response, NextFunction } from "express";

// Middleware xử lý route không tồn tại
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware xử lý lỗi
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nếu status code vẫn là 200, đặt thành 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
