import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, restrictTo('admin'), createCategory);

export default router;
