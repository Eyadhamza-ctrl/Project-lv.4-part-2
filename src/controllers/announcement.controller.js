import { asyncHandler } from '../utils/asyncHandler.js';
import { getEventByIdService } from '../services/event.service.js';
import { broadcastAnnouncement } from '../sockets/index.js';
import { Message } from '../models/message.model.js';
import { AppError } from '../utils/appError.js';

export const postAnnouncement = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const { message, content } = req.body;
  const messageText = message || content;

  if (!messageText) {
    throw new AppError('Message content is required', 422);
  }

  // Ensure event exists
  const event = await getEventByIdService(eventId);

  // Persist announcement in Message model
  const messageDoc = await Message.create({
    event: event._id,
    sender: req.user._id,
    content: messageText,
    timestamp: new Date()
  });

  const announcementPayload = {
    _id: messageDoc._id,
    eventId: event._id,
    eventTitle: event.title,
    message: messageText,
    content: messageText,
    announcedBy: {
      id: req.user._id,
      name: req.user.name
    },
    sender: {
      id: req.user._id,
      name: req.user.name
    },
    timestamp: messageDoc.timestamp,
    createdAt: messageDoc.createdAt
  };

  // Broadcast announcement via Socket.io
  broadcastAnnouncement(eventId, announcementPayload);

  res.status(200).json({
    success: true,
    message: 'Announcement broadcasted successfully',
    data: announcementPayload
  });
});

export const getAnnouncementsHistory = asyncHandler(async (req, res) => {
  const eventId = req.params.id || req.params.eventId;

  // Ensure event exists
  await getEventByIdService(eventId);

  const messages = await Message.find({ event: eventId })
    .populate('sender', 'name email role')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});
