import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import HttpError from '../errors/http-error';

const getTokenUserId = (req: Request): string | null => {
  const userId = req.payload?.id;
  return typeof userId === 'string' ? userId : null;
};

const createReview = (req: Request, res: Response, next: NextFunction) => {
  const tokenUserId = getTokenUserId(req);
  if (!tokenUserId) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }

  const { name, date, rating, comments, restaurantId } = req.body;

  prisma
    .$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: tokenUserId },
        select: { reviewIds: true },
      });
      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      const review = await tx.review.create({
        data: {
          name,
          date,
          rating,
          comments,
          authorId: tokenUserId,
          restaurantId,
        },
      });

      const reviewIds = user.reviewIds.includes(review.id)
        ? user.reviewIds
        : [...user.reviewIds, review.id];

      await tx.user.update({
        where: { id: tokenUserId },
        data: { reviewIds: { set: reviewIds } },
      });

      return review;
    })
    .then((review) => res.status(201).json(review))
    .catch((error) => next(error));
};

const deleteReview = (req: Request, res: Response, next: NextFunction) => {
  const tokenUserId = getTokenUserId(req);
  if (!tokenUserId) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }

  const id = String(req.params.id);

  prisma
    .$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id },
        select: { id: true, authorId: true },
      });
      if (!review) {
        res.status(404).json({ message: 'Review not found' });
        return;
      }

      if (review.authorId !== tokenUserId) {
        res.status(403).json({ message: 'Forbidden: You can only delete your own review' });
        return;
      }

      const user = await tx.user.findUnique({
        where: { id: review.authorId },
        select: { reviewIds: true },
      });
      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      await tx.review.delete({ where: { id } });

      const reviewIds = user.reviewIds.filter((reviewId) => reviewId !== id);

      await tx.user.update({
        where: { id: review.authorId },
        data: { reviewIds: { set: reviewIds } },
      });

      res.status(204).send();
    })
    .catch((error) => next(error));
};

const updateReview = (req: Request, res: Response, next: NextFunction) => {
  const tokenUserId = getTokenUserId(req);
  if (!tokenUserId) {
    res.status(401).json({ message: 'Unauthorized user' });
    return;
  }

  const id = String(req.params.id);
  const { name, date, rating, comments, restaurantId } = req.body;

  prisma.review
    .findUnique({ where: { id }, select: { authorId: true } })
    .then((review) => {
      if (!review) {
        res.status(404).json({ message: 'Review not found' });
        return null;
      }

      if (review.authorId !== tokenUserId) {
        res.status(403).json({ message: 'Forbidden: You can only edit your own review' });
        return null;
      }

      return prisma.review.update({
        where: { id },
        data: { name, date, rating, comments, restaurantId },
      });
    })
    .then((updatedReview) => {
      if (!updatedReview) {
        return;
      }

      res.status(200).json({ message: 'Review updated successfully' });
    })
    .catch((error) => next(error));
};

const getReviewById = (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);

  prisma.review
    .findUnique({ where: { id } })
    .then((review) => {
      if (!review) {
        res.status(404).json({ message: 'Review not found' });
        return;
      }

      res.status(200).json(review);
    })
    .catch((error) => next(error));
};

export { createReview, deleteReview, updateReview, getReviewById };
