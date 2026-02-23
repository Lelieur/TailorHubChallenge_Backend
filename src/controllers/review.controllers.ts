import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

const createReview = (req: Request, res: Response, next: NextFunction) => {
  const { name, date, rating, comments, authorId, restaurantId } = req.body;

  prisma.review
    .create({
      data: {
        name,
        date,
        rating,
        comments,
        authorId,
        restaurantId,
      },
    })
    .then((review) => res.status(201).json(review))
    .catch((error) => next(error));
};

const deleteReview = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  prisma.review
    .delete({ where: { id } })
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => next(error));
};

const updateReview = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);
  const { name, date, rating, comments, restaurantId } = req.body;

  prisma.review
    .update({
      where: { id },
      data: { name, date, rating, comments, restaurantId },
    })
    .then(() => {
      res.status(200).json({ message: "Review updated successfully" });
    })
    .catch((error) => next(error));
};

const getReviewById = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  prisma.review
    .findUnique({ where: { id } })
    .then((review) => res.status(200).json(review))
    .catch((error) => next(error));
};

export { createReview, deleteReview, updateReview, getReviewById };
