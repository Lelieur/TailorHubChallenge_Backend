import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { NextFunction, Request } from 'express';
import verifyToken from '../src/middlewares/verifyToken';
import { revokeTokenJti } from '../src/services/token-revocation';
import { createMockResponse } from './helpers/http';

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

  it('returns 401 bearer token required when Bearer token is blank (unit)', () => {
    const req = { headers: { authorization: 'Bearer ' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Bearer token is required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 500 when TOKEN_SECRET is missing (unit)', () => {
    const prevSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const req = { headers: { authorization: 'Bearer token-value' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'TOKEN_SECRET not configured' });
    expect(next).not.toHaveBeenCalled();
    process.env.TOKEN_SECRET = prevSecret;
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

  it('returns 401 when jwt.verify returns a string payload (unit)', () => {
    const verifySpy = vi.spyOn(jwt, 'verify').mockReturnValue('invalid-payload');

    const req = { headers: { authorization: 'Bearer token-value' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token payload' });
    expect(next).not.toHaveBeenCalled();
    verifySpy.mockRestore();
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
