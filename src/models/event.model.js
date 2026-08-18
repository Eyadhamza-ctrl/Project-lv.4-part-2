import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Event category is required'],
      index: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    attendeesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    popularity: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Add text index for text search
eventSchema.index({
  title: 'text',
  description: 'text',
  city: 'text',
  venue: 'text'
});

export const Event = mongoose.model('Event', eventSchema);
