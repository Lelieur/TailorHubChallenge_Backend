import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

const getUserById = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  prisma.user
    .findUnique({
      where: { id },
    })
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const { favoriteRestaurantIds, reviewIds, ...rest } = user;
      res.status(200).json({
        ...rest,
        favoriteRestaurants: favoriteRestaurantIds,
        reviews: reviewIds,
      });
    })
    .catch((error) => next(error));
};

const addFavoriteRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const restaurantId = String(req.params.id);
  const userId = String(req.body.id);

  prisma
    .$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { favoriteRestaurantIds: true },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const favoriteRestaurantIds = user.favoriteRestaurantIds.includes(restaurantId)
        ? user.favoriteRestaurantIds
        : [...user.favoriteRestaurantIds, restaurantId];

      return tx.user.update({
        where: { id: userId },
        data: { favoriteRestaurantIds: { set: favoriteRestaurantIds } },
        select: { id: true, favoriteRestaurantIds: true },
      });
    })
    .then((user) =>
      res.status(200).json({
        id: user.id,
        favoriteRestaurants: user.favoriteRestaurantIds,
      }),
    )
    .catch((error) => next(error));
};

const removeFavoriteRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const restaurantId = String(req.params.id);
  const userId = String(req.body.id);

  prisma
    .$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { favoriteRestaurantIds: true },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const favoriteRestaurantIds = user.favoriteRestaurantIds.filter((id) => id !== restaurantId);

      return tx.user.update({
        where: { id: userId },
        data: { favoriteRestaurantIds: { set: favoriteRestaurantIds } },
        select: { id: true, favoriteRestaurantIds: true },
      });
    })
    .then((user) =>
      res.status(200).json({
        id: user.id,
        favoriteRestaurants: user.favoriteRestaurantIds,
      }),
    )
    .catch((error) => next(error));
};

export { getUserById, addFavoriteRestaurant, removeFavoriteRestaurant };
