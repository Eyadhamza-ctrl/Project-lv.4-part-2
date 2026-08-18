import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { AppError } from '../src/utils/appError.js';
import { asyncHandler } from '../src/utils/asyncHandler.js';

describe('Error Handling Utilities & Middlewares', () => {
  describe('AppError Utility', () => {
    it('should set status to fail for 4xx status codes (failure/error cases)', () => {
      const error = new AppError('Client Error', 400);
      expect(error.message).toBe('Client Error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('should set status to error for 5xx status codes', () => {
      const error = new AppError('Server Error', 500);
      expect(error.statusCode).toBe(500);
      expect(error.status).toBe('error');
    });

    it('should default status code to 500 if not provided', () => {
      const error = new AppError('Internal Failure');
      expect(error.statusCode).toBe(500);
      expect(error.status).toBe('error');
    });
  });

  describe('asyncHandler Utility', () => {
    it('should execute successfully when async function resolves (success case)', async () => {
      const mockFn = asyncHandler(async (req, res, next) => {
        res.status(200).send('Success');
      });

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const mockNext = jest.fn();

      await mockFn(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith('Success');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch rejected async promises and pass to next() (failure case)', async () => {
      const mockFn = asyncHandler(async (req, res, next) => {
        throw new AppError('Async error occurred', 400);
      });

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      await mockFn(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toBe('Async error occurred');
    });
  });

  describe('404 Middleware', () => {
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/api/non-existent-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Can't find /api/non-existent-route");
    });
  });

  describe('CastError Handling', () => {
    it('should handle invalid ObjectId format gracefully', async () => {
      const res = await request(app).get('/api/events/invalid-id-string');
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
