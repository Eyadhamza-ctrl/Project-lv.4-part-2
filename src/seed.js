import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/user.model.js';
import { Category } from './models/category.model.js';
import { Event } from './models/event.model.js';
import { connectDB } from './config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});

    console.log('Seeding categories...');
    const categories = await Category.insertMany([
      { name: 'Music', description: 'Music festivals, concerts, and live performances' },
      { name: 'Tech', description: 'Technology conferences, hackathons, and AI meetups' },
      { name: 'Sports', description: 'Tournaments, matches, and athletic events' },
      { name: 'Art', description: 'Exhibitions, art galleries, and cultural displays' }
    ]);

    const musicCat = categories.find((c) => c.name === 'Music');
    const techCat = categories.find((c) => c.name === 'Tech');
    const sportsCat = categories.find((c) => c.name === 'Sports');

    console.log('Seeding admin and attendee users...');
    const adminUser = await User.create({
      name: 'Pulse Admin',
      email: 'admin@eventpulse.com',
      password: 'password123',
      role: 'admin'
    });

    const attendeeUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'attendee'
    });

    console.log('Seeding events...');
    await Event.create([
      {
        title: 'Cairo Jazz Summit 2026',
        description: 'An international celebration of jazz music and culture.',
        category: musicCat._id,
        city: 'Cairo',
        venue: 'Cairo Opera House',
        date: new Date('2026-10-20T18:00:00.000Z'),
        capacity: 200,
        createdBy: adminUser._id
      },
      {
        title: 'AI & Web Development Expo 2026',
        description: 'Explore state-of-the-art AI applications and web tech.',
        category: techCat._id,
        city: 'Cairo',
        venue: 'Cairo International Convention Centre',
        date: new Date('2026-11-15T09:00:00.000Z'),
        capacity: 500,
        createdBy: adminUser._id
      },
      {
        title: 'North Africa Marathon 2026',
        description: 'Annual 42km marathon open for athletes and enthusiasts.',
        category: sportsCat._id,
        city: 'Alexandria',
        venue: 'Alexandria Stadium',
        date: new Date('2026-12-01T06:00:00.000Z'),
        capacity: 1000,
        createdBy: adminUser._id
      }
    ]);

    console.log('Database seeded successfully! 🎉');
    console.log(`Admin email: ${adminUser.email}`);
    console.log('Admin password: password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();
