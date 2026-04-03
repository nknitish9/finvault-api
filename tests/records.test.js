const request = require('supertest');
const app = require('../src/app');
const { db, initializeDatabase } = require('../src/config/database');
const User = require('../src/models/User');

let adminToken;
let viewerToken;
let recordId;

beforeAll(async () => {
  initializeDatabase();
  db.prepare('DELETE FROM financial_records').run();
  db.prepare('DELETE FROM users').run();

  // Create admin
  const admin = User.create({ username: 'admin1', email: 'admin1@admin.com', password_hash: 'hash', full_name: 'Admin', role: 'admin' });
  
  // Create viewer
  const viewer = User.create({ username: 'viewer1', email: 'viewer1@v.com', password_hash: 'hash', full_name: 'Viewer', role: 'viewer' });

  // Generate tokens manually since we skipped real auth for speed in setup
  const AuthService = require('../src/services/auth.service');
  adminToken = AuthService.generateToken(admin);
  viewerToken = AuthService.generateToken(viewer);
});

afterAll(() => {
  db.close();
});

describe('Records Endpoints', () => {
  it('should allow admin to create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type: 'income',
        category: 'salary',
        amount: 1000,
        date: '2024-01-01'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    recordId = res.body.data.record.id;
  });

  it('should deny viewer from creating a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        type: 'expense',
        category: 'food',
        amount: 20,
        date: '2024-01-02'
      });
      
    expect(res.statusCode).toEqual(403);
  });

  it('should allow viewer to list records', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.records.length).toBeGreaterThan(0);
  });
  
  it('should allow admin to soft delete a record', async () => {
    const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
    expect(res.statusCode).toEqual(200);
  });
});
