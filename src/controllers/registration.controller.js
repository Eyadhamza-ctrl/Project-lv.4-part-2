import { asyncHandler } from '../utils/asyncHandler.js';
import {
  registerForEventService,
  unregisterFromEventService,
  getMyRegistrationsService,
  cancelRegistrationByIdService,
  getEventAttendeesService
} from '../services/registration.service.js';

export const registerForEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id || req.body.eventId || req.body.event;
  const registration = await registerForEventService(eventId, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Registered for event successfully',
    data: registration
  });
});

export const unregisterFromEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id || req.body.eventId || req.body.event;
  const result = await unregisterFromEventService(eventId, req.user._id);
  res.status(200).json({
    success: true,
    message: result.message
  });
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await getMyRegistrationsService(req.user._id);
  res.status(200).json({
    success: true,
    count: registrations.length,
    data: registrations
  });
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registrationId = req.params.id;
  const result = await cancelRegistrationByIdService(registrationId, req.user._id);
  res.status(200).json({
    success: true,
    message: result.message
  });
});

export const getEventAttendees = asyncHandler(async (req, res) => {
  const attendees = await getEventAttendeesService(req.params.id);
  res.status(200).json({
    success: true,
    count: attendees.length,
    data: attendees
  });
});
