import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createEventService,
  getAllEventsService,
  getEventByIdService,
  updateEventService,
  deleteEventService
} from '../services/event.service.js';

export const createEvent = asyncHandler(async (req, res) => {
  const event = await createEventService(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: event
  });
});

export const getEvents = asyncHandler(async (req, res) => {
  const result = await getAllEventsService(req.query);
  res.status(200).json({
    success: true,
    count: result.events.length,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    pagination: result.pagination,
    data: result.events
  });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await getEventByIdService(req.params.id);
  res.status(200).json({
    success: true,
    data: event
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await updateEventService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
    data: event
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  await deleteEventService(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Event deleted successfully'
  });
});
