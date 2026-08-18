import request from 'supertest';
import app from '../src/app.js';

describe('Registration & Announcement Endpoints', () => {
  let adminToken;
  let attendeeToken;
  let attendeeToken2;
  let eventId;

  beforeEach(async () => {
    // Register Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin Reg',
      email: 'admin_reg@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = adminRes.body.data.token;

    // Register Attendee 1
    const attendeeRes = await request(app).post('/api/auth/register').send({
      name: 'Attendee One',
      email: 'att1@example.com',
      password: 'password123',
      role: 'attendee'
    });
    attendeeToken = attendeeRes.body.data.token;

    // Register Attendee 2
    const attendeeRes2 = await request(app).post('/api/auth/register').send({
      name: 'Attendee Two',
      email: 'att2@example.com',
      password: 'password123',
      role: 'attendee'
    });
    attendeeToken2 = attendeeRes2.body.data.token;

    // Create Event with capacity 1 for capacity testing
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Exclusive Workshop',
        description: 'Limited seats workshop.',
        category: 'Education',
        city: 'Cairo',
        venue: 'Room 101',
        date: '2026-11-20T10:00:00.000Z',
        capacity: 1
      });
    eventId = eventRes.body.data._id;
  });

  describe('POST /api/events/:id/register', () => {
    it('should allow an attendee to register for an event', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('registeredAt');

      // Verify attendeesCount incremented
      const eventRes = await request(app).get(`/api/events/${eventId}`);
      expect(eventRes.body.data.attendeesCount).toBe(1);
    });

    it('should prevent duplicate registration by the same user', async () => {
      await request(app)
        .post(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      const res = await request(app)
        .post(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already registered');
    });

    it('should prevent registration when event capacity is full', async () => {
      // First registration uses full capacity (capacity = 1)
      await request(app)
        .post(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      // Second registration should fail
      const res = await request(app)
        .post(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken2}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('maximum capacity');
    });
  });

  describe('DELETE /api/events/:id/register', () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);
    });

    it('should allow user to unregister from an event', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify attendeesCount decremented
      const eventRes = await request(app).get(`/api/events/${eventId}`);
      expect(eventRes.body.data.attendeesCount).toBe(0);
    });

    it('should return 404 when unregistering from an event user is not registered for', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken2}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/events/:id/attendees', () => {
    it('should return attendee list for an event', async () => {
      await request(app)
        .post(`/api/events/${eventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      const res = await request(app)
        .get(`/api/events/${eventId}/attendees`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].user.name).toBe('Attendee One');
    });
  });

  describe('POST /api/events/:id/announcements', () => {
    it('should allow admin to broadcast an announcement', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          message: 'The event starts in 15 minutes!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('The event starts in 15 minutes!');
    });

    it('should deny non-admin from broadcasting an announcement', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/announcements`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({
          message: 'Hello attendees!'
        });

      expect(res.status).toBe(403);
    });
  });
});
