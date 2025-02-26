import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Review from "../models/Review.model";
import User from "../models/User.model";
import Restaurant from "../models/Restaurant.model";
const createReview = (req: Request, res: Response, next: NextFunction) => {
  const { name, date, rating, comments, authorId, restaurantId } = req.body;

  Review.create({
    name,
    date,
    rating,
    comments,
    authorId,
    restaurantId,
  })
    .then((review) => {
      res.status(201).json(review);
      return review;
    })
    .then((review) => {
      return Promise.all([
        User.findByIdAndUpdate(
          authorId,
          {
            $push: { reviews: review._id },
          },
          { new: true, runValidators: true }
        ),
        Restaurant.findByIdAndUpdate(
          restaurantId,
          { $push: { reviews: review } },
          { new: true, runValidators: true }
        ),
      ]);
    })
    .then(() => {
      // Aquí puedes manejar la respuesta si es necesario
    })
    .catch((error) => next(error));
};

const deleteReview = (req: Request, res: Response, next: NextFunction) => {
  console.log("deleteReview");
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid review ID" });
    return;
  }

  Review.findByIdAndDelete(id)
    .then((review) => {
      if (!review) {
        res.status(404).json({ message: "Review not found" });
        return null;
      }
      const { authorId, restaurantId } = review;
      return Promise.all([
        User.findByIdAndUpdate(
          authorId,
          { $pull: { reviews: review._id } },
          { new: true, runValidators: true }
        ),
        Restaurant.findByIdAndUpdate(
          restaurantId,
          { $pull: { reviews: { _id: review._id } } },
          { new: true, runValidators: true }
        ),
      ]);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => next(error));
};

const updateReview = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, date, rating, comments, restaurantId } = req.body;

  Review.findByIdAndUpdate(
    id,
    { name, date, rating, comments },
    { new: true, runValidators: true }
  )
    .then((updatedReview) => {
      if (!updatedReview) {
        res.status(404).json({ message: "Review not found" });
        return;
      }
      return Restaurant.findByIdAndUpdate(
        restaurantId,
        { $set: { "reviews.$[elem]": updatedReview } },
        {
          arrayFilters: [{ "elem._id": updatedReview._id }],
          new: true,
          runValidators: true,
        }
      );
    })
    .then(() => {
      res.status(200).json({ message: "Review updated successfully" });
    })
    .catch((error) => next(error));
};

export { createReview, deleteReview, updateReview };
