import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";

import {
  getUserById,
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
} from "../controllers/user.controllers";

const router = Router();

router.get("/users/:id", verifyToken, getUserById);
router.put("/users/addfavorite/:id", verifyToken, addFavoriteRestaurant);
router.put("/users/removefavorite/:id", verifyToken, removeFavoriteRestaurant);

export default router;
