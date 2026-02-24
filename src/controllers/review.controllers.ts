import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

const createReview = (req: Request, res: Response, next: NextFunction) => {
  const { name, date, rating, comments, authorId, restaurantId } = req.body;

  prisma
    .$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: authorId },
        select: { reviewIds: true },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const review = await tx.review.create({
        data: {
          name,
          date,
          rating,
          comments,
          authorId,
          restaurantId,
        },
      });

      const reviewIds = user.reviewIds.includes(review.id)
        ? user.reviewIds
        : [...user.reviewIds, review.id];

      await tx.user.update({
        where: { id: authorId },
        data: { reviewIds: { set: reviewIds } },
      });

      return review;
    })
    .then((review) => res.status(201).json(review))
    .catch((error) => next(error));
};

const deleteReview = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  prisma
    .$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id },
        select: { id: true, authorId: true },
      });
      if (!review) {
        throw new Error('Review not found');
      }

      const user = await tx.user.findUnique({
        where: { id: review.authorId },
        select: { reviewIds: true },
      });
      if (!user) {
        throw new Error('User not found');
      }

      await tx.review.delete({ where: { id } });

      const reviewIds = user.reviewIds.filter((reviewId) => reviewId !== id);

      await tx.user.update({
        where: { id: review.authorId },
        data: { reviewIds: { set: reviewIds } },
      });
    })
    .then(() => res.status(204).send())
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
