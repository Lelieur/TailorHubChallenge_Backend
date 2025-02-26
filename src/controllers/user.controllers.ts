import User from "../models/User.model";
import { Request, Response, NextFunction } from "express";

const getUserById = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  User.findById(id)
    .populate("reviews")
    .populate("favoriteRestaurants")
    .then((user) => res.status(200).json(user))
    .catch((error) => next(error));
};

const addFavoriteRestaurant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: restaurantId } = req.params;
  const { id: userId } = req.body;

  User.findByIdAndUpdate(
    userId,
    { $push: { favoriteRestaurants: restaurantId } },
    { new: true, runValidators: true }
  )
    .then((restaurant) => res.status(200).json(restaurant))
    .catch((error) => next(error));
};

const removeFavoriteRestaurant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: restaurantId } = req.params;
  const { id: userId } = req.body;

  console.log("userId desde el cuerpo:", userId);
  console.log("restaurantId desde los parámetros:", restaurantId);

  User.findByIdAndUpdate(
    userId,
    { $pull: { favoriteRestaurants: restaurantId } },
    { new: true, runValidators: true }
  )
    .then((restaurant) => res.status(200).json(restaurant))
    .catch((error) => next(error));
};

export { getUserById, addFavoriteRestaurant, removeFavoriteRestaurant };
