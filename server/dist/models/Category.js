"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Category Schema
const categorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
    },
    icon: {
        type: String,
        default: 'book',
    },
}, {
    timestamps: true,
});
// Virtual for category's URL
categorySchema.virtual('url').get(function () {
    return `/categories/${this._id}`;
});
// Ensure virtuals are included when converting to JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });
const Category = mongoose_1.default.model('Category', categorySchema);
exports.default = Category;
