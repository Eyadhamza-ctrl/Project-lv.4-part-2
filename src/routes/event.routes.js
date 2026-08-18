import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} from '../controllers/event.controller.js';
import {
  registerForEvent,
  unregisterFromEvent,
  getEventAttendees
} from '../controllers/registration.controller.js';
import {
  postAnnouncement,
  getAnnouncementsHistory
} from '../controllers/announcement.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createEventValidation,
  updateEventValidation,
  eventIdValidation
} from '../validations/event.validation.js';
import { announcementValidation } from '../validations/announcement.validation.js';

const router = Router();

// Event CRUD
router.post('/', protect, restrictTo('admin'), validate(createEventValidation), createEvent);
router.get('/', getEvents);
router.get('/:id', validate(eventIdValidation), getEventById);
router.put('/:id', protect, restrictTo('admin'), validate(updateEventValidation), updateEvent);
router.patch('/:id', protect, restrictTo('admin'), validate(updateEventValidation), updateEvent);
router.delete('/:id', protect, restrictTo('admin'), validate(eventIdValidation), deleteEvent);

// Registrations
router.post('/:id/register', protect, validate(eventIdValidation), registerForEvent);
router.delete('/:id/register', protect, validate(eventIdValidation), unregisterFromEvent);
router.get('/:id/attendees', protect, validate(eventIdValidation), getEventAttendees);

// Announcements / Messages (Admin broadcast & history)
router.post('/:id/announcements', protect, restrictTo('admin'), validate(announcementValidation), postAnnouncement);
router.post('/:id/messages', protect, restrictTo('admin'), validate(announcementValidation), postAnnouncement);
router.get('/:id/announcements', validate(eventIdValidation), getAnnouncementsHistory);
router.get('/:id/messages', validate(eventIdValidation), getAnnouncementsHistory);

export default router;
