import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextFunction, Request } from 'express';
import { createMockResponse, flushPromises } from './helpers/http';

const {
  restaurantFindUniqueMock,
  restaurantCreateMock,
  restaurantFindManyMock,
  restaurantUpdateMock,
  restaurantDeleteMock,
} = vi.hoisted(() => ({
  restaurantFindUniqueMock: vi.fn(),
  restaurantCreateMock: vi.fn(),
  restaurantFindManyMock: vi.fn(),
  restaurantUpdateMock: vi.fn(),
  restaurantDeleteMock: vi.fn(),
}));

vi.mock('../src/db', () => ({
  prisma: {
    restaurant: {
      findUnique: restaurantFindUniqueMock,
      create: restaurantCreateMock,
      findMany: restaurantFindManyMock,
      update: restaurantUpdateMock,
      delete: restaurantDeleteMock,
    },
  },
}));

import {
  getAllRestaurants,
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  updateRestaurant,
} from '../src/controllers/restaurant.controllers';

describe('restaurant controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllRestaurants returns 200 with list', async () => {
    restaurantFindManyMock.mockResolvedValue([{ id: 'r1' }]);
    const req = {} as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getAllRestaurants(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 'r1' }]);
  });

  it('getAllRestaurants calls next on error', async () => {
    restaurantFindManyMock.mockRejectedValue(new Error('db error'));
    const req = {} as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getAllRestaurants(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('createRestaurant returns 401 without token payload', () => {
    const req = { body: { name: 'R1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    createRestaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
    expect(restaurantCreateMock).not.toHaveBeenCalled();
  });

  it('createRestaurant uses userId from token as createdById', async () => {
    restaurantCreateMock.mockResolvedValue({ id: 'rest-1' });

    const req = {
      payload: { id: 'token-user' },
      body: {
        name: 'R1',
        neighborhood: 'N',
        address: 'A',
        latlng: { lat: 0, lng: 0 },
        image: 'img',
        cuisine_type: 'Italian',
        operating_hours: {},
        createdById: 'malicious-user',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    createRestaurant(req, res, next);
    await flushPromises();

    expect(restaurantCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          createdById: 'token-user',
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('getRestaurantById returns 404 if not found', async () => {
    restaurantFindUniqueMock.mockResolvedValue(null);

    const req = { params: { id: 'missing-id' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getRestaurantById(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Restaurant not found' });
  });

  it('getRestaurantById returns 200 when found', async () => {
    restaurantFindUniqueMock.mockResolvedValue({ id: 'rest-1' });
    const req = { params: { id: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getRestaurantById(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 'rest-1' });
  });

  it('getRestaurantById calls next on error', async () => {
    restaurantFindUniqueMock.mockRejectedValue(new Error('db error'));
    const req = { params: { id: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    getRestaurantById(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('createRestaurant calls next on db error', async () => {
    restaurantCreateMock.mockRejectedValue(new Error('db error'));
    const req = {
      payload: { id: 'token-user' },
      body: { name: 'R1' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    createRestaurant(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('updateRestaurant returns 200 on success', async () => {
    restaurantUpdateMock.mockResolvedValue({});
    const req = { params: { id: 'rest-1' }, body: { name: 'R1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateRestaurant(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Restaurant updated successfully' });
  });

  it('updateRestaurant calls next on error', async () => {
    restaurantUpdateMock.mockRejectedValue(new Error('db error'));
    const req = { params: { id: 'rest-1' }, body: { name: 'R1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    updateRestaurant(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });

  it('deleteRestaurant returns 200 on success', async () => {
    restaurantFindUniqueMock.mockResolvedValue({ createdById: 'token-user' });
    restaurantDeleteMock.mockResolvedValue({ id: 'rest-1' });
    const req = { payload: { id: 'token-user' }, params: { id: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteRestaurant(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 'rest-1' });
  });

  it('deleteRestaurant returns 401 without token payload', () => {
    const req = { params: { id: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteRestaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized user' });
    expect(restaurantDeleteMock).not.toHaveBeenCalled();
  });

  it('deleteRestaurant returns 403 when user is not owner', async () => {
    restaurantFindUniqueMock.mockResolvedValue({ createdById: 'other-user' });
    const req = { payload: { id: 'token-user' }, params: { id: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteRestaurant(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden: You can only delete your own restaurant',
    });
    expect(restaurantDeleteMock).not.toHaveBeenCalled();
  });

  it('deleteRestaurant returns 404 when restaurant does not exist', async () => {
    restaurantFindUniqueMock.mockResolvedValue(null);
    const req = { payload: { id: 'token-user' }, params: { id: 'missing-rest' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteRestaurant(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Restaurant not found' });
    expect(restaurantDeleteMock).not.toHaveBeenCalled();
  });

  it('deleteRestaurant calls next on error', async () => {
    restaurantFindUniqueMock.mockResolvedValue({ createdById: 'token-user' });
    restaurantDeleteMock.mockRejectedValue(new Error('db error'));
    const req = { payload: { id: 'token-user' }, params: { id: 'rest-1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    deleteRestaurant(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalled();
  });
});
