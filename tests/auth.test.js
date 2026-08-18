import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';

describe('Auth Endpoints', () => {
  const sampleUser = {
    name: 'Attendee User',
    email: 'attendee@example.com',
    password: 'password123',
    role: 'attendee'
  };

  const sampleAdmin = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new attendee user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(sampleUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('_id');
      expect(res.body.data.user.email).toBe(sampleUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should register an admin user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(sampleAdmin);

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('admin');
    });

    it('should return 422 for invalid email or missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'invalid-email',
          password: '123'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should return 400 when registering with existing email', async () => {
      await request(app).post('/api/auth/register').send(sampleUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(sampleUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(sampleUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: sampleUser.email,
          password: sampleUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(sampleUser.email);
    });

    it('should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: sampleUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should fail login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current logged in user profile', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(sampleUser);

      const token = registerRes.body.data.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.email).toBe(sampleUser.email);
    });

    it('should return 401 if request has no authorization token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
