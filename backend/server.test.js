import request from 'supertest';
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Mock the database
const adapter = new JSONFile('test-db.json');
const defaultData = { mangaLibrary: [] };
const db = new Low(adapter, defaultData);

// Mock the app
const app = express();
app.use(express.json());

// Routes to test
app.get('/api/status', (req, res) => {
  res.json({ message: 'Backend server is running!', timestamp: new Date() });
});

describe('GET /api/status', () => {
  it('should return a status message', async () => {
    const res = await request(app).get('/api/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Backend server is running!');
  });
});
