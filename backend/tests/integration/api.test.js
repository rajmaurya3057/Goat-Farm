const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const User = require('../../src/models/User');

let mongoServer;
let adminToken;

jest.setTimeout(600000);

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests';
  process.env.JWT_EXPIRE = '1d';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashed = await bcrypt.hash('Password123', 12);
  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: hashed,
    role: 'ADMIN',
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'Password123' });

  adminToken = loginRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Health endpoints', () => {
  it('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('GET /ready returns OK when DB connected', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('connected');
  });
});

describe('Auth API', () => {
  it('POST /api/auth/login returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('GET /api/auth/me returns user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@test.com');
    expect(res.body.data.role).toBe('ADMIN');
  });

  it('POST /api/auth/register is blocked when users exist', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another',
        email: 'another@test.com',
        password: 'Password123',
      });

    expect(res.status).toBe(403);
  });
});

describe('Goat API', () => {
  let goatId;

  it('POST /api/goats creates a goat', async () => {
    const res = await request(app)
      .post('/api/goats')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        uidTag: 'GF001',
        name: 'Sheru',
        gender: 'Male',
        breed: 'Boer',
        status: 'Active',
        currentWeight: 35,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.uidTag).toBe('GF001');
    goatId = res.body.data._id;
  });

  it('GET /api/goats lists goats with pagination', async () => {
    const res = await request(app)
      .get('/api/goats?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.totalRecords).toBeDefined();
  });

  it('POST /api/goats/:id/weight records weight', async () => {
    const res = await request(app)
      .post(`/api/goats/${goatId}/weight`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ weight: 38 });

    expect(res.status).toBe(201);
    expect(res.body.data.weight).toBe(38);
  });

  it('GET /api/goats/:id returns full profile', async () => {
    const res = await request(app)
      .get(`/api/goats/${goatId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.goat).toBeDefined();
    expect(res.body.data.weightHistory).toBeDefined();
  });
});

describe('Medicine API', () => {
  let medicineId;
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  it('POST /api/medicines creates medicine with auto status', async () => {
    const res = await request(app)
      .post('/api/medicines')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Ivermectin',
        type: 'Dewormer',
        quantity: 10,
        unit: 'Bottle',
        expiryDate: futureDate.toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Available');
    medicineId = res.body.data._id;
  });

  it('GET /api/medicines/:id returns medicine', async () => {
    const res = await request(app)
      .get(`/api/medicines/${medicineId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.medicine.name).toBe('Ivermectin');
  });
});

describe('Alerts API', () => {
  it('GET /api/alerts returns alerts list', async () => {
    const res = await request(app)
      .get('/api/alerts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Settings API', () => {
  it('GET /api/settings returns farm settings', async () => {
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('PUT /api/settings updates settings', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ farmName: 'Raj Goat Farm', phone: '9999999999' });

    expect(res.status).toBe(200);
    expect(res.body.data.farmName).toBe('Raj Goat Farm');
  });
});
