import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

const getUserById = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  prisma.user
    .findUnique({
      where: { id },
      include: {
        reviews: true,
        favoriteRestaurants: true,
      },
    })
    .then((user) => res.status(200).json(user))
    .catch((error) => next(error));
};

const addFavoriteRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const restaurantId = String(req.params.id);
  const userId = String(req.body.id);

  prisma.user
    .update({
      where: { id: userId },
      data: {
        favoriteRestaurants: {
          connect: { id: restaurantId },
        },
      },
    })
    .then((user) => res.status(200).json(user))
    .catch((error) => next(error));
};

const removeFavoriteRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const restaurantId = String(req.params.id);
  const userId = String(req.body.id);

  prisma.user
    .update({
      where: { id: userId },
      data: {
        favoriteRestaurants: {
          disconnect: { id: restaurantId },
        },
      },
    })
    .then((user) => res.status(200).json(user))
    .catch((error) => next(error));
};

export { getUserById, addFavoriteRestaurant, removeFavoriteRestaurant };
