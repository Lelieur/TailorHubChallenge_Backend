import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "./legacy-models/User.model";
import Restaurant from "./legacy-models/Restaurant.model";
import Review from "./legacy-models/Review.model";
import { PrismaClient } from "../../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const toId = (value: unknown): string | null => {
  if (!value) return null;
  try {
    return String(value);
  } catch {
    return null;
  }
};

const buildReviewKey = (input: {
  restaurantId: string;
  name: string;
  date: string;
  rating: number;
  comments: string;
}): string =>
  `${input.restaurantId}|${input.name}|${input.date}|${input.rating}|${input.comments}`;

const getDirectDatabaseUrl = (): string => {
  const url =
    process.env.DIRECT_DATABASE_URL ||
    process.env.DIRECT_DATABASE ||
    process.env.DATABASE_URL;
  if (!url) throw new Error("DIRECT_DATABASE_URL is missing in environment");
  return url;
};

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment");
  }

  const directUrl = getDirectDatabaseUrl();
  const pool = new Pool({ connectionString: directUrl });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Reset Postgres data to make migration idempotent
    await prisma.review.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();

    const users = await User.find().lean();
    const restaurants = await Restaurant.find().lean();
    const reviews = await Review.find().lean();

    const userIdMap = new Map<string, string>();
    const restaurantIdMap = new Map<string, string>();
    const reviewIdsByUserId = new Map<string, string[]>();

    const addReviewIdForUser = (userId: string, reviewId: string): void => {
      const existing = reviewIdsByUserId.get(userId);
      if (!existing) {
        reviewIdsByUserId.set(userId, [reviewId]);
        return;
      }
      if (!existing.includes(reviewId)) {
        existing.push(reviewId);
      }
    };

    const systemUser = await prisma.user.create({
      data: {
        username: "system",
        email: "default_reviewer@system.local",
        password: "not-a-real-password",
      },
    });

    for (const user of users) {
      const mongoId = toId(user._id);
      if (!mongoId) continue;

      const created = await prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          password: user.password,
          createdAt: user.createdAt ?? new Date(),
          updatedAt: user.updatedAt ?? new Date(),
        },
      });

      userIdMap.set(mongoId, created.id);
    }

    for (const restaurant of restaurants) {
      const mongoId = toId(restaurant._id);
      if (!mongoId) continue;

      const createdByMongoId = toId(restaurant.createdBy);
      const createdById = createdByMongoId
        ? userIdMap.get(createdByMongoId) ?? null
        : null;

      const created = await prisma.restaurant.create({
        data: {
          name: restaurant.name,
          neighborhood: restaurant.neighborhood,
          address: restaurant.address,
          latlng: restaurant.latlng ?? {},
          image: restaurant.image,
          cuisine_type: restaurant.cuisine_type,
          operating_hours: restaurant.operating_hours ?? {},
          createdById,
          createdAt: restaurant.createdAt ?? new Date(),
          updatedAt: restaurant.updatedAt ?? new Date(),
        },
      });

      restaurantIdMap.set(mongoId, created.id);
    }

    for (const review of reviews) {
      const authorMongoId = toId(review.authorId);
      const restaurantMongoId = toId(review.restaurantId);

      if (!authorMongoId || !restaurantMongoId) {
        console.warn("Skipping review without authorId or restaurantId");
        continue;
      }

      const authorId = userIdMap.get(authorMongoId);
      const restaurantId = restaurantIdMap.get(restaurantMongoId);

      if (!authorId || !restaurantId) {
        console.warn("Skipping review with missing mapped IDs");
        continue;
      }

      const created = await prisma.review.create({
        data: {
          name: review.name,
          date: review.date,
          rating: Number(review.rating),
          comments: review.comments,
          authorId,
          restaurantId,
          createdAt: review.createdAt ?? new Date(),
          updatedAt: review.updatedAt ?? new Date(),
        },
      });

      addReviewIdForUser(authorId, created.id);
    }

    const existingReviews = await prisma.review.findMany({
      select: {
        restaurantId: true,
        name: true,
        date: true,
        rating: true,
        comments: true,
      },
    });
    const existingReviewKeys = new Set(
      existingReviews.map((r) =>
        buildReviewKey({
          restaurantId: r.restaurantId,
          name: r.name,
          date: r.date,
          rating: r.rating,
          comments: r.comments,
        }),
      ),
    );

    for (const restaurant of restaurants) {
      const restaurantMongoId = toId(restaurant._id);
      if (!restaurantMongoId) continue;
      const restaurantId = restaurantIdMap.get(restaurantMongoId);
      if (!restaurantId) continue;

      const embeddedReviews = Array.isArray(restaurant.reviews)
        ? restaurant.reviews
        : [];

      for (const embedded of embeddedReviews) {
        const name = String(embedded.name ?? "Anonymous");
        const date = String(embedded.date ?? "");
        const rating = Number(embedded.rating ?? 0);
        const comments = String(embedded.comments ?? "");
        const embeddedAuthorMongoId = toId(embedded.authorId);
        const embeddedAuthorId =
          embeddedAuthorMongoId && userIdMap.has(embeddedAuthorMongoId)
            ? userIdMap.get(embeddedAuthorMongoId) ?? systemUser.id
            : systemUser.id;

        const key = buildReviewKey({
          restaurantId,
          name,
          date,
          rating,
          comments,
        });

        if (existingReviewKeys.has(key)) continue;

        const created = await prisma.review.create({
          data: {
            name,
            date,
            rating,
            comments,
            authorId: embeddedAuthorId,
            restaurantId,
          },
        });

        addReviewIdForUser(embeddedAuthorId, created.id);
        existingReviewKeys.add(key);
      }
    }

    for (const [userId, reviewIds] of reviewIdsByUserId.entries()) {
      await prisma.user.update({
        where: { id: userId },
        data: { reviewIds: { set: reviewIds } },
      });
    }

    for (const user of users) {
      const mongoId = toId(user._id);
      if (!mongoId) continue;

      const userId = userIdMap.get(mongoId);
      if (!userId) continue;

      const favoriteMongoIds = (user.favoriteRestaurants ?? [])
        .map((r) => toId(r))
        .filter((id): id is string => Boolean(id));

      const favoriteIds = favoriteMongoIds
        .map((id) => restaurantIdMap.get(id))
        .filter((id): id is string => Boolean(id));

      if (favoriteIds.length === 0) continue;

      await prisma.user.update({
        where: { id: userId },
        data: {
          favoriteRestaurantIds: { set: favoriteIds },
        },
      });
    }

    console.log("Migration completed");
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    // prisma is scoped in main, nothing to disconnect here if main failed early
    await mongoose.disconnect();
  });
