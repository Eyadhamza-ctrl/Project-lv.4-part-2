import { Category } from '../models/category.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new AppError('Category name is required', 422);
  }

  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    throw new AppError('Category already exists', 400);
  }

  const category = await Category.create({ name, description });
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});
