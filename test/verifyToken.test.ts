import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll } from 'vitest';
import verifyToken from '../src/middlewares/verifyToken';
import { revokeTokenJti } from '../src/services/token-revocation';

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

  it('returns 401 when authorization header is not Bearer', async () => {
    const response = await request(app).get('/private').set('Authorization', 'Token abc');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header must use Bearer token');
  });

  it('returns 401 when bearer token is empty', async () => {
    const response = await request(app).get('/private').set('Authorization', 'Bearer ');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header must use Bearer token');
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

  it('returns 401 when token payload is missing user id', async () => {
    const tokenWithoutId = jwt.sign({ email: 'user@test.com' }, process.env.TOKEN_SECRET as string, {
      expiresIn: '1h',
      jwtid: 'jti-no-id',
    });

    const response = await request(app).get('/private').set('Authorization', `Bearer ${tokenWithoutId}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token missing user id');
  });

  it('returns 401 when token has expired', async () => {
    const expiredToken = jwt.sign({ id: 'user-123' }, process.env.TOKEN_SECRET as string, {
      expiresIn: -10,
      jwtid: 'jti-expired',
    });

    const response = await request(app).get('/private').set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized user');
  });

  it('returns 401 when token is revoked', async () => {
    const revokedToken = jwt.sign({ id: 'user-123' }, process.env.TOKEN_SECRET as string, {
      expiresIn: '1h',
      jwtid: 'jti-revoked',
    });
    revokeTokenJti('jti-revoked');

    const response = await request(app).get('/private').set('Authorization', `Bearer ${revokedToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token has been revoked');
  });
});
