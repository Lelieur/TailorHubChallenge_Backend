import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.model";
import User from "../models/User.model";

const getAllRestaurants = (req: Request, res: Response, next: NextFunction) => {
  Restaurant.find()
    .populate({
      path: "reviews",
      populate: {
        path: "restaurantId",
        select: "name",
      },
    })
    .then((restaurants) => res.status(200).json(restaurants))
    .catch((error) => next(error));
};

const getRestaurantById = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid restaurant ID" });
    return;
  }

  Restaurant.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "restaurantId",
        select: "name",
      },
    })
    .then((restaurant) => res.status(200).json(restaurant))
    .catch((error) => next(error));
};

const updateRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const { id: restaurantId } = req.params;
  const {
    name,
    neighborhood,
    address,
    photograph,
    latlng,
    image,
    cuisine_type,
    operating_hours,
    reviews,
  } = req.body;

  Restaurant.findByIdAndUpdate(
    restaurantId,
    {
      name,
      neighborhood,
      address,
      photograph,
      latlng,
      image,
      cuisine_type,
      operating_hours,
      reviews,
    },
    { runValidators: true }
  )
    .then(() =>
      res.status(200).json({ message: "Restaurant updated successfully" })
    )
    .catch((error) => next(error));
};

const createRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const {
    name,
    neighborhood,
    address,
    photograph,
    latlng,
    image,
    cuisine_type,
    operating_hours,
    reviews,
  } = req.body;

  Restaurant.create({
    name,
    neighborhood,
    address,
    photograph,
    latlng,
    image,
    cuisine_type,
    operating_hours,
    reviews,
  })
    .then((restaurant) => res.status(201).json(restaurant))
    .catch((error) => next(error));
};

const deleteRestaurant = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  Restaurant.findByIdAndDelete(id)
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
