import { body, param } from 'express-validator';

export const announcementValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Announcement message is required')
    .isLength({ min: 3 })
    .withMessage('Message must be at least 3 characters long')
];
