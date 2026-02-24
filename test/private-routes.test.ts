import express, { Application } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const mockedHandlers = vi.hoisted(() => ({
  signupUser: vi.fn((req, res) => res.status(200).json({ route: 'signup' })),
  loginUser: vi.fn((req, res) => res.status(200).json({ route: 'login' })),
  verifyUser: vi.fn((req, res) => res.status(200).json({ route: 'verify' })),
  logoutUser: vi.fn((req, res) => res.status(200).json({ route: 'logout' })),
  getAllRestaurants: vi.fn((req, res) => res.status(200).json({ route: 'restaurants-list' })),
  getRestaurantById: vi.fn((req, res) => res.status(200).json({ route: 'restaurants-by-id' })),
  createRestaurant: vi.fn((req, res) => res.status(200).json({ route: 'restaurants-create' })),
  deleteRestaurant: vi.fn((req, res) => res.status(200).json({ route: 'restaurants-delete' })),
  createReview: vi.fn((req, res) => res.status(200).json({ route: 'reviews-create' })),
  deleteReview: vi.fn((req, res) => res.status(200).json({ route: 'reviews-delete' })),
  updateReview: vi.fn((req, res) => res.status(200).json({ route: 'reviews-update' })),
  getReviewById: vi.fn((req, res) => res.status(200).json({ route: 'reviews-by-id' })),
  getUserById: vi.fn((req, res) => res.status(200).json({ route: 'users-by-id' })),
  updateUserById: vi.fn((req, res) => res.status(200).json({ route: 'users-update' })),
  addFavoriteRestaurant: vi.fn((req, res) => res.status(200).json({ route: 'users-add-favorite' })),
  removeFavoriteRestaurant: vi.fn((req, res) =>
    res.status(200).json({ route: 'users-remove-favorite' }),
  ),
}));

vi.mock('../src/controllers/auth.controllers', () => ({
  signupUser: mockedHandlers.signupUser,
  loginUser: mockedHandlers.loginUser,
  verifyUser: mockedHandlers.verifyUser,
  logoutUser: mockedHandlers.logoutUser,
}));

vi.mock('../src/controllers/restaurant.controllers', () => ({
  getAllRestaurants: mockedHandlers.getAllRestaurants,
  getRestaurantById: mockedHandlers.getRestaurantById,
  createRestaurant: mockedHandlers.createRestaurant,
  deleteRestaurant: mockedHandlers.deleteRestaurant,
}));

vi.mock('../src/controllers/review.controllers', () => ({
  createReview: mockedHandlers.createReview,
  deleteReview: mockedHandlers.deleteReview,
  updateReview: mockedHandlers.updateReview,
  getReviewById: mockedHandlers.getReviewById,
}));

vi.mock('../src/controllers/user.controllers', () => ({
  getUserById: mockedHandlers.getUserById,
  updateUserById: mockedHandlers.updateUserById,
  addFavoriteRestaurant: mockedHandlers.addFavoriteRestaurant,
  removeFavoriteRestaurant: mockedHandlers.removeFavoriteRestaurant,
}));

import authRouter from '../src/routes/auth.routes';
import restaurantRouter from '../src/routes/restaurant.routes';
import reviewRouter from '../src/routes/review.routes';
import userRouter from '../src/routes/user.routes';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type RouteCase = { method: HttpMethod; path: string; body?: Record<string, unknown> };

describe('private routes auth guard', () => {
  const app: Application = express();
  app.use(express.json());
  app.use('/api', authRouter);
  app.use('/api', restaurantRouter);
  app.use('/api', reviewRouter);
  app.use('/api', userRouter);

  beforeAll(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });

  const privateRoutes: RouteCase[] = [
    { method: 'get', path: '/api/verify' },
    { method: 'post', path: '/api/logout' },
    { method: 'get', path: '/api/restaurants' },
    { method: 'get', path: '/api/restaurants/rest-1' },
    { method: 'post', path: '/api/restaurants', body: { name: 'R1' } },
    { method: 'post', path: '/api/reviews', body: { comments: 'Great' } },
    { method: 'put', path: '/api/reviews/review-1', body: { comments: 'Updated' } },
    { method: 'delete', path: '/api/reviews/review-1' },
    { method: 'get', path: '/api/reviews/review-1' },
    { method: 'get', path: '/api/users/user-1' },
  ];

  const publicRoutes: RouteCase[] = [
    { method: 'post', path: '/api/signup', body: { email: 'user@test.com' } },
    {
      method: 'post',
      path: '/api/login',
      body: { email: 'user@test.com', password: 'StrongPass1!' },
    },
  ];

  it.each(privateRoutes)(
    '$method $path returns 401 without token',
    async ({ method, path, body }) => {
      let req = request(app)[method](path);
      if (body) {
        req = req.send(body);
      }

      const response = await req;
      expect(response.status).toBe(401);
    },
  );

  it.each(privateRoutes)(
    '$method $path returns 401 with invalid token',
    async ({ method, path, body }) => {
      let req = request(app)[method](path).set('Authorization', 'Bearer invalid-token');
      if (body) {
        req = req.send(body);
      }

      const response = await req;
      expect(response.status).toBe(401);
    },
  );

  it.each(privateRoutes)(
    '$method $path returns 200 with valid token',
    async ({ method, path, body }) => {
      const token = jwt.sign({ id: 'user-1' }, process.env.TOKEN_SECRET as string, {
        expiresIn: '1h',
        jwtid: `jti-${method}-${path}`,
      });

      let req = request(app)[method](path).set('Authorization', `Bearer ${token}`);
      if (body) {
        req = req.send(body);
      }

      const response = await req;
      expect(response.status).toBe(200);
    },
  );

  it.each(publicRoutes)('$method $path is public', async ({ method, path, body }) => {
    let req = request(app)[method](path);
    if (body) {
      req = req.send(body);
    }

    const response = await req;
    expect(response.status).toBe(200);
  });
});
