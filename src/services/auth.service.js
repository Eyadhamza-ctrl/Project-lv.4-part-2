import { User } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email address', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'attendee'
  });

  const token = generateToken({ id: user._id, role: user.role });

  return {
    user,
    token
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({ id: user._id, role: user.role });
  const userObject = user.toObject();

  return {
    user: userObject,
    token
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
