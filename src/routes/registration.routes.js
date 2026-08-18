import { Router } from 'express';
import {
  getMyRegistrations,
  cancelRegistration,
  registerForEvent
} from '../controllers/registration.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/my', getMyRegistrations);
router.post('/', registerForEvent);
router.delete('/:id', cancelRegistration);

export default router;
