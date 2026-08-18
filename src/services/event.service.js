import mongoose from 'mongoose';
import { Event } from '../models/event.model.js';
import { Category } from '../models/category.model.js';
import { AppError } from '../utils/appError.js';

// Helper to resolve category ID from name or ID
const resolveCategoryId = async (categoryInput) => {
  if (!categoryInput) return null;

  if (mongoose.Types.ObjectId.isValid(categoryInput) && String(new mongoose.Types.ObjectId(categoryInput)) === String(categoryInput)) {
    const cat = await Category.findById(categoryInput);
    if (cat) return cat._id;
  }

  // Treat as category name
  let cat = await Category.findOne({
    name: { $regex: new RegExp(`^${categoryInput}$`, 'i') }
  });

  if (!cat) {
    cat = await Category.create({ name: categoryInput });
  }

  return cat._id;
};

export const createEventService = async (eventData, userId) => {
  if (eventData.category) {
    eventData.category = await resolveCategoryId(eventData.category);
  }

  const event = await Event.create({
    ...eventData,
    createdBy: userId
  });

  return await Event.findById(event._id)
    .populate('category')
    .populate('createdBy', 'name email');
};

export const getAllEventsService = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort,
    sortBy,
    category,
    city,
    date,
    startDate,
    endDate,
    search
  } = queryParams;

  const filter = {};

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category) && String(new mongoose.Types.ObjectId(category)) === String(category)) {
      filter.category = category;
    } else {
      const cat = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, 'i') }
      });
      if (cat) {
        filter.category = cat._id;
      } else {
        filter.category = null; // No match
      }
    }
  }

  if (city) {
    filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  } else if (date) {
    const start = new Date(date);
    if (!isNaN(start.getTime())) {
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = {
        $gte: start,
        $lt: end
      };
    }
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  let sortOptions = { date: 1 }; // Default sort by date ascending

  if (sortBy) {
    if (sortBy === 'date') {
      sortOptions = { date: 1 };
    } else if (sortBy === 'registrations') {
      sortOptions = { attendeesCount: -1 };
    }
  } else if (sort) {
    sortOptions = {};
    const fields = sort.split(',');
    fields.forEach((field) => {
      if (field.startsWith('-')) {
        sortOptions[field.substring(1)] = -1;
      } else {
        sortOptions[field] = 1;
      }
    });
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Event.countDocuments(filter);
  const events = await Event.find(filter)
    .populate('category')
    .populate('createdBy', 'name email')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    events,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    }
  };
};

export const getEventByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid event ID format', 422);
  }

  const event = await Event.findById(id)
    .populate('category')
    .populate('createdBy', 'name email');

  if (!event) {
    throw new AppError('Event not found', 404);
  }
  return event;
};

export const updateEventService = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid event ID format', 422);
  }

  if (updateData.category) {
    updateData.category = await resolveCategoryId(updateData.category);
  }

  const event = await Event.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  })
    .populate('category')
    .populate('createdBy', 'name email');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return event;
};

export const deleteEventService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid event ID format', 422);
  }

  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  return event;
};
