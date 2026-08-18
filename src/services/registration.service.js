import mongoose from 'mongoose';
import { Registration } from '../models/registration.model.js';
import { Event } from '../models/event.model.js';
import { AppError } from '../utils/appError.js';

export const registerForEventService = async (eventId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError('Invalid event ID format', 422);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check duplicate registration first
  const existingRegistration = await Registration.findOne({
    user: userId,
    event: eventId
  });

  if (existingRegistration) {
    throw new AppError('You are already registered for this event', 400);
  }

  // Check event capacity
  if (event.attendeesCount >= event.capacity) {
    throw new AppError('Event has reached maximum capacity', 400);
  }

  const registration = await Registration.create({
    user: userId,
    event: eventId
  });

  // Increment attendeesCount and popularity
  await Event.findByIdAndUpdate(eventId, {
    $inc: { attendeesCount: 1, popularity: 5 }
  });

  return await Registration.findById(registration._id)
    .populate({
      path: 'event',
      populate: { path: 'category' }
    })
    .populate('user', 'name email');
};

export const unregisterFromEventService = async (eventId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError('Invalid event ID format', 422);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const registration = await Registration.findOneAndDelete({
    user: userId,
    event: eventId
  });

  if (!registration) {
    throw new AppError('Registration not found for this event', 404);
  }

  // Decrement attendeesCount safely
  await Event.findByIdAndUpdate(eventId, {
    $inc: { attendeesCount: -1 }
  });

  return { message: 'Successfully unregistered from event' };
};

export const getMyRegistrationsService = async (userId) => {
  const registrations = await Registration.find({ user: userId })
    .populate({
      path: 'event',
      populate: { path: 'category' }
    })
    .sort({ registeredAt: -1 });

  return registrations;
};

export const cancelRegistrationByIdService = async (registrationOrEventId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(registrationOrEventId)) {
    throw new AppError('Invalid registration ID format', 422);
  }

  // Find registration by Registration _id OR by event ID belonging to this user
  let registration = await Registration.findOne({
    _id: registrationOrEventId,
    user: userId
  });

  if (!registration) {
    registration = await Registration.findOne({
      event: registrationOrEventId,
      user: userId
    });
  }

  if (!registration) {
    // Check if registration exists for another user
    const existingOther = await Registration.findById(registrationOrEventId);
    if (existingOther) {
      throw new AppError('You do not have permission to cancel this registration', 403);
    }
    throw new AppError('Registration not found', 404);
  }

  const deletedReg = await Registration.findByIdAndDelete(registration._id);

  // Decrement attendeesCount safely
  await Event.findByIdAndUpdate(deletedReg.event, {
    $inc: { attendeesCount: -1 }
  });

  return { message: 'Registration cancelled successfully' };
};

export const getEventAttendeesService = async (eventId) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError('Invalid event ID format', 422);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const registrations = await Registration.find({ event: eventId })
    .populate('user', 'name email role')
    .sort({ registeredAt: -1 });

  return registrations;
};
