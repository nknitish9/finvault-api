const request = require('supertest');
const app = require('../src/app');
const { db, initializeDatabase } = require('../src/config/database');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  initializeDatabase();
  // Clear db before tests
  db.prepare('DELETE FROM users').run();
});

afterAll(() => {
  db.close();
});

describe('Auth Endpoints', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
  });

  it('should not register user with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'anotheruser',
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Another User'
      });
      
    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('success', false);
  });
});
