import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextFunction, Request } from 'express';
import { createMockResponse, flushPromises } from './helpers/http';

const { transactionMock, reviewFindUniqueMock, reviewUpdateMock } = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  reviewFindUniqueMock: vi.fn(),
  reviewUpdateMock: vi.fn(),
}));

vi.mock('../src/db', () => ({
  prisma: {
    $transaction: transactionMock,
    review: {
      findUnique: reviewFindUniqueMock,
      update: reviewUpdateMock,
    },
  },
}));

import {
  createReview,
  deleteReview,
  getReviewById,
  updateReview,
} from '../src/controllers/review.controllers';

describe('review controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createReview returns 401 without token payload', () => {
    const req = { body: { restaurantId: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    createReview(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
  });

  it('createReview returns 400 and lists missing/invalid fields', () => {
    const req = {
      payload: { id: 'token-user' },
      body: {
        name: '',
        rating: '5',
        comments: '',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    createReview(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'Faltan algunos campos obligatorios o son incorrectos: Nombre, Fecha, Puntuación, Comentarios, Restaurante',
    });
  });

  it('createReview ignores authorId in body and uses token user id', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ reviewIds: [] }),
        update: vi.fn().mockResolvedValue({}),
      },
      review: {
        create: vi.fn().mockResolvedValue({ id: 'review-1' }),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );

    const req = {
      payload: { id: 'token-user' },
      body: {
        name: 'User',
        date: '2026-02-24',
        rating: 5,
        comments: 'Great',
        authorId: 'malicious-user',
        restaurantId: 'rest-1',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    createReview(req, res, next);
    await flushPromises();

    expect(tx.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          authorId: 'token-user',
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('createReview calls next when transaction fails', async () => {
    transactionMock.mockRejectedValue(new Error('db error'));
    const req = {
      payload: { id: 'token-user' },
      body: {
        name: 'User',
        date: '2026-02-24',
        rating: 5,
        comments: 'Great',
        restaurantId: 'rest-1',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    createReview(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('createReview calls next when token user does not exist', async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      review: {
        create: vi.fn(),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = {
      payload: { id: 'token-user' },
      body: {
        name: 'User',
        date: '2026-02-24',
        rating: 5,
        comments: 'Great',
        restaurantId: 'rest-1',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    createReview(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('updateReview returns 403 when review owner is different', async () => {
    reviewFindUniqueMock.mockResolvedValue({ authorId: 'other-user' });

    const req = {
      payload: { id: 'token-user' },
      params: { id: 'review-1' },
      body: {},
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateReview(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden: You can only edit your own review',
    });
    expect(reviewUpdateMock).not.toHaveBeenCalled();
  });

  it('updateReview returns 404 when review does not exist', async () => {
    reviewFindUniqueMock.mockResolvedValue(null);

    const req = {
      payload: { id: 'token-user' },
      params: { id: 'missing-review' },
      body: {},
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateReview(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Review not found' });
  });

  it('updateReview returns 401 without token payload', () => {
    const req = {
      params: { id: 'review-1' },
      body: {},
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateReview(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
  });

  it('updateReview returns 200 for owner', async () => {
    reviewFindUniqueMock.mockResolvedValue({ authorId: 'token-user' });
    reviewUpdateMock.mockResolvedValue({ id: 'review-1' });

    const req = {
      payload: { id: 'token-user' },
      params: { id: 'review-1' },
      body: { comments: 'updated' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateReview(req, res, next);
    await flushPromises();

    expect(reviewUpdateMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Review updated successfully' });
  });

  it('updateReview calls next on error', async () => {
    reviewFindUniqueMock.mockRejectedValue(new Error('db error'));

    const req = {
      payload: { id: 'token-user' },
      params: { id: 'review-1' },
      body: {},
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateReview(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('deleteReview returns 403 when review owner is different', async () => {
    const tx = {
      review: {
        findUnique: vi.fn().mockResolvedValue({ id: 'review-1', authorId: 'other-user' }),
        delete: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );

    const req = { payload: { id: 'token-user' }, params: { id: 'review-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteReview(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden: You can only delete your own review',
    });
    expect(tx.review.delete).not.toHaveBeenCalled();
  });

  it('deleteReview returns 401 without token payload', () => {
    const req = { params: { id: 'review-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteReview(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
  });

  it('deleteReview returns 404 when review does not exist', async () => {
    const tx = {
      review: {
        findUnique: vi.fn().mockResolvedValue(null),
        delete: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );

    const req = { payload: { id: 'token-user' }, params: { id: 'review-404' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteReview(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Review not found' });
    expect(tx.review.delete).not.toHaveBeenCalled();
  });

  it('deleteReview returns 204 for owner and removes review id', async () => {
    const tx = {
      review: {
        findUnique: vi.fn().mockResolvedValue({ id: 'review-1', authorId: 'token-user' }),
        delete: vi.fn().mockResolvedValue({}),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ reviewIds: ['review-1', 'review-2'] }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = { payload: { id: 'token-user' }, params: { id: 'review-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteReview(req, res, next);
    await flushPromises();

    expect(tx.review.delete).toHaveBeenCalledWith({ where: { id: 'review-1' } });
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { reviewIds: { set: ['review-2'] } },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('deleteReview calls next when owner user record does not exist', async () => {
    const tx = {
      review: {
        findUnique: vi.fn().mockResolvedValue({ id: 'review-1', authorId: 'token-user' }),
        delete: vi.fn(),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };
    transactionMock.mockImplementation(
      async (cb: (client: typeof tx) => Promise<unknown> | unknown) => cb(tx),
    );
    const req = { payload: { id: 'token-user' }, params: { id: 'review-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteReview(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('getReviewById returns 404 when review does not exist', async () => {
    reviewFindUniqueMock.mockResolvedValue(null);

    const req = { params: { id: 'review-404' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getReviewById(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Review not found' });
  });

  it('getReviewById returns 200 when review exists', async () => {
    reviewFindUniqueMock.mockResolvedValue({ id: 'review-1' });

    const req = { params: { id: 'review-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getReviewById(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 'review-1' });
  });

  it('getReviewById calls next on error', async () => {
    reviewFindUniqueMock.mockRejectedValue(new Error('db error'));

    const req = { params: { id: 'review-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getReviewById(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });
});
