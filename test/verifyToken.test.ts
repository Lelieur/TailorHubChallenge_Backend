import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll } from 'vitest';
import verifyToken from '../src/middlewares/verifyToken';

describe('verifyToken middleware', () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });

  const app = express();
  app.get('/private', verifyToken, (req, res) => {
    res.status(200).json({ userId: req.payload?.id });
  });

  it('returns 401 when token is missing', async () => {
    const response = await request(app).get('/private');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is required');
  });

  it('returns 401 when token is invalid', async () => {
    const response = await request(app)
      .get('/private')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized user');
  });

  it('returns 200 when token is valid', async () => {
    const validToken = jwt.sign({ id: 'user-123' }, process.env.TOKEN_SECRET as string, {
      expiresIn: '1h',
      jwtid: 'jti-valid-token',
    });

    const response = await request(app)
      .get('/private')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.userId).toBe('user-123');
  });
});
