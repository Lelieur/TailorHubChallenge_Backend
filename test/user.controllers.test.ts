import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextFunction, Request } from 'express';
import { createMockResponse, flushPromises } from './helpers/http';

const { transactionMock, userFindUniqueMock } = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
}));

vi.mock('../src/db', () => ({
  prisma: {
    $transaction: transactionMock,
    user: {
      findUnique: userFindUniqueMock,
    },
  },
}));

import {
  addFavoriteRestaurant,
  getUserById,
  removeFavoriteRestaurant,
  updateUserById,
} from '../src/controllers/user.controllers';

describe('user controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserById returns 403 when requesting another user', () => {
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'other-user' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden: You can only access your own user data',
    });
  });

  it('getUserById returns 401 when token payload is missing', () => {
    const req = { params: { id: 'user-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
  });

  it('getUserById returns 404 when user does not exist', async () => {
    userFindUniqueMock.mockResolvedValue(null);
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'token-user' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getUserById(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('getUserById returns 200 with mapped fields', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'token-user',
      username: 'Lucas',
      email: 'user@test.com',
      password: 'secret',
      favoriteRestaurantIds: ['r1'],
      reviewIds: ['rev1'],
    });
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'token-user' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getUserById(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        favoriteRestaurants: ['r1'],
        reviews: ['rev1'],
      }),
    );
  });

  it('getUserById calls next on db error', async () => {
    userFindUniqueMock.mockRejectedValue(new Error('db error'));
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'token-user' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getUserById(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('updateUserById returns 401 without token', () => {
    const req = {
      params: { id: 'token-user' },
      body: { restaurantId: 'rest-1', action: 'add' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
  });

  it('updateUserById returns 403 for different user', () => {
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'other-user' },
      body: { restaurantId: 'rest-1', action: 'add' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden: You can only edit your own user data',
    });
  });

  it('updateUserById returns 400 for invalid body', () => {
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'token-user' },
      body: { restaurantId: 'rest-1', action: 'invalid' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'restaurantId and action (add/remove) are required' });
  });

  it('updateUserById returns 200 and updates favorites', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ favoriteRestaurantIds: [] }),
        update: vi.fn().mockResolvedValue({
          id: 'token-user',
          favoriteRestaurantIds: ['rest-1'],
        }),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'token-user' },
      body: { restaurantId: 'rest-1', action: 'add' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateUserById(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 'token-user',
      favoriteRestaurants: ['rest-1'],
    });
  });

  it('updateUserById calls next when user is not found', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'token-user' },
      body: { restaurantId: 'rest-1', action: 'add' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateUserById(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('addFavoriteRestaurant uses token user id and not body id', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ favoriteRestaurantIds: [] }),
        update: vi.fn().mockResolvedValue({
          id: 'token-user',
          favoriteRestaurantIds: ['rest-1'],
        }),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );

    const req = {
      payload: { id: 'token-user' },
      params: { id: 'rest-1' },
      body: { id: 'malicious-user' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    addFavoriteRestaurant(req, res, next);
    await flushPromises();

    expect(tx.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'token-user' },
      select: { favoriteRestaurantIds: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 'token-user',
      favoriteRestaurants: ['rest-1'],
    });
  });

  it('addFavoriteRestaurant returns 401 without token', () => {
    const req = { params: { id: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    addFavoriteRestaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
  });

  it('addFavoriteRestaurant keeps list when restaurant is already favorite', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ favoriteRestaurantIds: ['rest-1'] }),
        update: vi.fn().mockResolvedValue({
          id: 'token-user',
          favoriteRestaurantIds: ['rest-1'],
        }),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'rest-1' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    addFavoriteRestaurant(req, res, next);
    await flushPromises();

    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { favoriteRestaurantIds: { set: ['rest-1'] } },
      }),
    );
  });

  it('addFavoriteRestaurant calls next when user is not found', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'rest-1' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    addFavoriteRestaurant(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('removeFavoriteRestaurant returns 401 without token', () => {
    const req = { params: { id: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    removeFavoriteRestaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
  });

  it('removeFavoriteRestaurant removes restaurant from favorites', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ favoriteRestaurantIds: ['rest-1', 'rest-2'] }),
        update: vi.fn().mockResolvedValue({
          id: 'token-user',
          favoriteRestaurantIds: ['rest-2'],
        }),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'rest-1' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    removeFavoriteRestaurant(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 'token-user',
      favoriteRestaurants: ['rest-2'],
    });
  });

  it('removeFavoriteRestaurant calls next on error', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = {
      payload: { id: 'token-user' },
      params: { id: 'rest-1' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    removeFavoriteRestaurant(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });
});
