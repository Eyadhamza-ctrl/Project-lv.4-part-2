import { body, param } from 'express-validator';

export const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format. Must be ISO8601 string'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be an integer greater than 0'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL')
];

export const updateEventValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),
  body('venue')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Venue cannot be empty'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Must be ISO8601 string'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be an integer greater than 0'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL')
];

export const eventIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID')
];
