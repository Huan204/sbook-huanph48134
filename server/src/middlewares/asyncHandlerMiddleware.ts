import { Request, Response, NextFunction } from "express";

/**
 * Hàm bọc các hàm xử lý bất đồng bộ và tự động xử lý lỗi
 * @param fn Hàm xử lý yêu cầu bất đồng bộ
 * @returns Express middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next?: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
