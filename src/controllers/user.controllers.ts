import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

const getTokenUserId = (req: Request): string | null => {
  const userId = req.payload?.id;
  return typeof userId === 'string' ? userId : null;
};

const getUserById = (req: Request, res: Response, next: NextFunction) => {
  const requestedUserId = String(req.params.id);
  const tokenUserId = getTokenUserId(req);

  if (!tokenUserId) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }

  if (requestedUserId !== tokenUserId) {
    res.status(403).json({ message: 'Forbidden: You can only access your own user data' });
    return;
  }

  prisma.user
    .findUnique({
      where: { id: requestedUserId },
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
  const tokenUserId = getTokenUserId(req);

  if (!tokenUserId) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }

  prisma
    .$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: tokenUserId },
        select: { favoriteRestaurantIds: true },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const favoriteRestaurantIds = user.favoriteRestaurantIds.includes(restaurantId)
        ? user.favoriteRestaurantIds
        : [...user.favoriteRestaurantIds, restaurantId];

      return tx.user.update({
        where: { id: tokenUserId },
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
  const tokenUserId = getTokenUserId(req);

  if (!tokenUserId) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }

  prisma
    .$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: tokenUserId },
        select: { favoriteRestaurantIds: true },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const favoriteRestaurantIds = user.favoriteRestaurantIds.filter((id) => id !== restaurantId);

      return tx.user.update({
        where: { id: tokenUserId },
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
