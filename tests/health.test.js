import request from 'supertest';
import app from '../src/app.js';

describe('Health Endpoint', () => {
  it('should return 200 OK with server and database status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });
});
