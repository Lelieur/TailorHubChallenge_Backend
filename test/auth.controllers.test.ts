import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextFunction, Request } from 'express';
import { createMockResponse, flushPromises } from './helpers/http';

const {
  findUniqueMock,
  createMock,
  revokeTokenJtiMock,
  compareSyncMock,
  genSaltSyncMock,
  hashSyncMock,
  signMock,
} = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  revokeTokenJtiMock: vi.fn(),
  compareSyncMock: vi.fn(),
  genSaltSyncMock: vi.fn(),
  hashSyncMock: vi.fn(),
  signMock: vi.fn(),
}));

vi.mock('../src/db', () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
      create: createMock,
    },
  },
}));

vi.mock('../src/services/token-revocation', () => ({
  revokeTokenJti: revokeTokenJtiMock,
}));

vi.mock('bcrypt', () => ({
  default: {
    compareSync: compareSyncMock,
    genSaltSync: genSaltSyncMock,
    hashSync: hashSyncMock,
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: signMock,
  },
}));

import { loginUser, logoutUser, signupUser } from '../src/controllers/auth.controllers';
import { verifyUser } from '../src/controllers/auth.controllers';

describe('auth controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TOKEN_SECRET = 'test-secret';
  });

  it('signupUser returns 400 when required fields are missing', () => {
    const req = { body: { email: 'user@test.com' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    signupUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
  });

  it('signupUser returns 400 for weak password', () => {
    const req = {
      body: { username: 'U', email: 'user@test.com', password: 'weak' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    signupUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('signupUser returns 400 for invalid email', () => {
    const req = {
      body: { username: 'U', email: 'invalid-email', password: 'StrongPass1!' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    signupUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please use a valid email address' });
  });

  it('signupUser returns 409 when user already exists', async () => {
    findUniqueMock.mockResolvedValue({ id: 'existing' });

    const req = {
      body: { username: 'U', email: 'user@test.com', password: 'StrongPass1!' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    signupUser(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already registered' });
    expect(next).not.toHaveBeenCalled();
  });

  it('signupUser creates user and returns 201', async () => {
    findUniqueMock.mockResolvedValue(null);
    genSaltSyncMock.mockReturnValue('salt');
    hashSyncMock.mockReturnValue('hashed');
    createMock.mockResolvedValue({
      id: 'new-user',
      username: 'U',
      email: 'user@test.com',
      password: 'hashed',
    });

    const req = {
      body: { username: 'U', email: 'user@test.com', password: 'StrongPass1!' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    signupUser(req, res, next);
    await flushPromises();

    expect(createMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('signupUser calls next on db error', async () => {
    findUniqueMock.mockRejectedValue(new Error('db error'));

    const req = {
      body: { username: 'U', email: 'user@test.com', password: 'StrongPass1!' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    signupUser(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('loginUser returns 400 when required fields are missing', () => {
    const req = { body: { email: 'user@test.com' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
  });

  it('loginUser returns 500 when TOKEN_SECRET is missing', () => {
    delete process.env.TOKEN_SECRET;
    const req = { body: { email: 'user@test.com', password: 'StrongPass1!' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'TOKEN_SECRET not configured' });
  });

  it('loginUser returns 400 when user is not found', async () => {
    findUniqueMock.mockResolvedValue(null);
    const req = { body: { email: 'user@test.com', password: 'StrongPass1!' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    loginUser(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('loginUser returns 400 when password is invalid', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'user-1',
      username: 'Lucas',
      email: 'user@test.com',
      password: 'hashed-password',
      favoriteRestaurantIds: [],
    });
    compareSyncMock.mockReturnValue(false);
    const req = { body: { email: 'user@test.com', password: 'wrong' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    loginUser(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unable to authenticate the user.' });
  });

  it('loginUser returns 200 and auth token for valid credentials', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'user-1',
      username: 'Lucas',
      email: 'user@test.com',
      password: 'hashed-password',
      favoriteRestaurantIds: ['rest-1'],
    });
    compareSyncMock.mockReturnValue(true);
    signMock.mockReturnValue('signed-token');

    const req = { body: { email: 'user@test.com', password: 'StrongPass1!' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    loginUser(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      authToken: 'signed-token',
      userData: {
        id: 'user-1',
        username: 'Lucas',
        email: 'user@test.com',
        favoriteRestaurants: ['rest-1'],
      },
    });
    expect(signMock).toHaveBeenCalled();
  });

  it('loginUser calls next on db error', async () => {
    findUniqueMock.mockRejectedValue(new Error('db error'));
    const req = { body: { email: 'user@test.com', password: 'StrongPass1!' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    loginUser(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('verifyUser returns payload', () => {
    const req = { payload: { id: 'user-1' } } as unknown as Request;
    const res = createMockResponse();

    verifyUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ loggedUserData: { id: 'user-1' } });
  });

  it('logoutUser returns 400 when token has no jti', () => {
    const req = { payload: {} } as unknown as Request;
    const res = createMockResponse();

    logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token cannot be revoked' });
  });

  it('logoutUser revokes token and returns 204', () => {
    const req = { payload: { jti: 'token-jti' } } as unknown as Request;
    const res = createMockResponse();

    logoutUser(req, res);

    expect(revokeTokenJtiMock).toHaveBeenCalledWith('token-jti');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
