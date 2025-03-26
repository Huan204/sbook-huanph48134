"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Hàm bọc các hàm xử lý bất đồng bộ và tự động xử lý lỗi
 * @param fn Hàm xử lý yêu cầu bất đồng bộ
 * @returns Express middleware
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
