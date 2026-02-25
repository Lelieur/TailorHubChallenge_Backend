import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

const getTokenUserId = (req: Request): string | null => {
  const userId = req.payload?.id;
  return typeof userId === 'string' ? userId : null;
};

const getAllRestaurants = (req: Request, res: Response, next: NextFunction) => {
  prisma.restaurant
    .findMany({
      include: {
        reviews: {
          include: {
            restaurant: {
              select: { name: true },
            },
          },
        },
      },
    })
    .then((restaurants) => res.status(200).json(restaurants))
    .catch((error) => next(error));
};

const getRestaurantById = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  prisma.restaurant
    .findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            restaurant: {
              select: { name: true },
            },
          },
        },
      },
    })
    .then((restaurant) => {
      if (!restaurant) {
        res.status(404).json({ message: 'Restaurant not found' });
        return;
      }

      res.status(200).json(restaurant);
    })
    .catch((error) => next(error));
};

const updateRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const restaurantId = String(req.params.id);
  const { name, neighborhood, address, latlng, image, cuisine_type, operating_hours } = req.body;

  prisma.restaurant
    .update({
      where: { id: restaurantId },
      data: {
        name,
        neighborhood,
        address,
        latlng,
        image,
        cuisine_type,
        operating_hours,
      },
    })
    .then(() => res.status(200).json({ message: 'Restaurant updated successfully' }))
    .catch((error) => next(error));
};

const createRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const tokenUserId = getTokenUserId(req);
  if (!tokenUserId) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }

  const { name, neighborhood, address, latlng, image, cuisine_type, operating_hours } = req.body;
  const missingOrInvalidFields: string[] = [];

  if (typeof name !== 'string' || !name.trim())
    missingOrInvalidFields.push('Nombre del restaurante');
  if (typeof neighborhood !== 'string' || !neighborhood.trim())
    missingOrInvalidFields.push('Barrio');
  if (typeof address !== 'string' || !address.trim()) missingOrInvalidFields.push('Dirección');
  if (typeof image !== 'string' || !image.trim()) missingOrInvalidFields.push('Imagen');
  if (typeof cuisine_type !== 'string' || !cuisine_type.trim())
    missingOrInvalidFields.push('Tipo de cocina');

  if (!latlng || typeof latlng !== 'object' || Array.isArray(latlng)) {
    missingOrInvalidFields.push('latlng');
  } else {
    const latlngObject = latlng as { lat?: unknown; lng?: unknown };
    if (typeof latlngObject.lat !== 'number') missingOrInvalidFields.push('latlng.lat');
    if (typeof latlngObject.lng !== 'number') missingOrInvalidFields.push('latlng.lng');
  }

  if (!operating_hours || typeof operating_hours !== 'object' || Array.isArray(operating_hours)) {
    missingOrInvalidFields.push('operating_hours');
  }

  if (missingOrInvalidFields.length > 0) {
    res.status(400).json({
      message: `Faltan algunos campos obligatorios o son incorrectos: ${missingOrInvalidFields.join(', ')}`,
    });
    return;
  }

  prisma.restaurant
    .create({
      data: {
        name,
        neighborhood,
        address,
        latlng,
        image,
        cuisine_type,
        operating_hours,
        createdById: tokenUserId,
      },
    })
    .then((restaurant) => res.status(201).json(restaurant))
    .catch((error) => next(error));
};

const deleteRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const tokenUserId = getTokenUserId(req);
  if (!tokenUserId) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }

  const id = String(req.params.id);

  prisma.restaurant
    .findUnique({ where: { id }, select: { createdById: true } })
    .then((restaurant) => {
      if (!restaurant) {
        res.status(404).json({ message: 'Restaurant not found' });
        return null;
      }

      if (!restaurant.createdById || restaurant.createdById !== tokenUserId) {
        res.status(403).json({ message: 'Forbidden: You can only delete your own restaurant' });
        return null;
      }

      return prisma.restaurant.delete({ where: { id } });
    })
    .then((deletedRestaurant) => {
      if (!deletedRestaurant) {
        return;
      }

      res.status(200).json(deletedRestaurant);
    })
    .catch((error) => next(error));
};

export {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
};
