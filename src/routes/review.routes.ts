import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";

import {
  createReview,
  deleteReview,
  updateReview,
} from "../controllers/review.controllers";

const router = Router();

router.post("/reviews", verifyToken, createReview);
router.delete("/reviews/:id", verifyToken, deleteReview);
router.put("/reviews/:id", verifyToken, updateReview);

export default router;
