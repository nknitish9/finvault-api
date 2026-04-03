const request = require('supertest');
const app = require('../src/app');
const { db, initializeDatabase } = require('../src/config/database');
const User = require('../src/models/User');

let analystToken;
let viewerToken;

beforeAll(async () => {
  initializeDatabase();
  db.prepare('DELETE FROM financial_records').run();
  db.prepare('DELETE FROM users').run();

  const analyst = User.create({ username: 'ana', email: 'ana@a.com', password_hash: 'hash', full_name: 'Ana', role: 'analyst' });
  const viewer = User.create({ username: 'view2', email: 'v2@v.com', password_hash: 'hash', full_name: 'View', role: 'viewer' });

  const AuthService = require('../src/services/auth.service');
  analystToken = AuthService.generateToken(analyst);
  viewerToken = AuthService.generateToken(viewer);
});

afterAll(() => {
  db.close();
});

describe('Dashboard Endpoints', () => {
  it('should allow analyst to view summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${analystToken}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total_income');
  });

  it('should deny viewer from viewing summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);
      
    expect(res.statusCode).toEqual(403);
  });
});
