import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

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
    .then((restaurant) => res.status(200).json(restaurant))
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
  const { name, neighborhood, address, latlng, image, cuisine_type, operating_hours } = req.body;

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
      },
    })
    .then((restaurant) => res.status(201).json(restaurant))
    .catch((error) => next(error));
};

const deleteRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  prisma.restaurant
    .delete({ where: { id } })
    .then((restaurant) => res.status(200).json(restaurant))
    .catch((error) => next(error));
};

export {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
};
