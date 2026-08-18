import { asyncHandler } from '../utils/asyncHandler.js';
import { registerUser, loginUser, getUserById } from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  
  res.cookie('token', result.token, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);

  res.cookie('token', result.token, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: result
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});
