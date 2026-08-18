import request from 'supertest';
import app from '../src/app.js';

describe('Event Endpoints', () => {
  let adminToken;
  let attendeeToken;
  let createdEventId;

  const adminCredentials = {
    name: 'Admin User',
    email: 'admin_events@example.com',
    password: 'password123',
    role: 'admin'
  };

  const attendeeCredentials = {
    name: 'Attendee User',
    email: 'attendee_events@example.com',
    password: 'password123',
    role: 'attendee'
  };

  const sampleEventData = {
    title: 'Tech Summit Cairo 2026',
    description: 'Premier technology and AI summit in North Africa.',
    category: 'Technology',
    city: 'Cairo',
    venue: 'Cairo International Convention Centre',
    date: '2026-10-15T09:00:00.000Z',
    capacity: 100
  };

  beforeEach(async () => {
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send(adminCredentials);
    adminToken = adminRes.body.data.token;

    const attendeeRes = await request(app)
      .post('/api/auth/register')
      .send(attendeeCredentials);
    attendeeToken = attendeeRes.body.data.token;
  });

  describe('POST /api/events', () => {
    it('should allow admin to create an event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleEventData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe(sampleEventData.title);
      createdEventId = res.body.data._id;
    });

    it('should deny non-admin user from creating an event (403)', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send(sampleEventData);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('do not have permission');
    });

    it('should return 422 for invalid event payload', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'AB' // short title, missing required fields
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/events & Advanced Query Features', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...sampleEventData,
          title: 'Cairo Jazz Fest',
          category: 'Music',
          city: 'Cairo',
          date: '2026-11-01T18:00:00.000Z'
        });

      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...sampleEventData,
          title: 'Alexandria Art Expo',
          category: 'Art',
          city: 'Alexandria',
          date: '2026-12-05T10:00:00.000Z'
        });
    });

    it('should fetch events with default pagination', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });

    it('should filter events by category', async () => {
      const res = await request(app).get('/api/events?category=Music');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      const catName = typeof res.body.data[0].category === 'object' ? res.body.data[0].category.name : res.body.data[0].category;
      expect(catName).toBe('Music');
    });

    it('should filter events by city', async () => {
      const res = await request(app).get('/api/events?city=Alexandria');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].city).toBe('Alexandria');
    });

    it('should search events by keyword', async () => {
      const res = await request(app).get('/api/events?search=Jazz');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toContain('Jazz');
    });

    it('should sort events by date descending', async () => {
      const res = await request(app).get('/api/events?sort=-date');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(new Date(res.body.data[0].date).getTime()).toBeGreaterThan(
        new Date(res.body.data[1].date).getTime()
      );
    });
  });

  describe('GET, PATCH, DELETE /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleEventData);
      eventId = res.body.data._id;
    });

    it('should fetch single event by ID', async () => {
      const res = await request(app).get(`/api/events/${eventId}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(eventId);
    });

    it('should return 404 for non-existent event ID', async () => {
      const nonExistentId = '66b123456789abcdef123456';
      const res = await request(app).get(`/api/events/${nonExistentId}`);
      expect(res.status).toBe(404);
    });

    it('should allow admin to update an event', async () => {
      const res = await request(app)
        .patch(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Tech Summit 2026',
          capacity: 150
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Tech Summit 2026');
      expect(res.body.data.capacity).toBe(150);
    });

    it('should allow admin to delete an event', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const checkRes = await request(app).get(`/api/events/${eventId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
