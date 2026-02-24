import { Router } from 'express';
import verifyToken from '../middlewares/verifyToken';

import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  deleteRestaurant,
} from '../controllers/restaurant.controllers';

const router = Router();

router.get('/restaurants', verifyToken, getAllRestaurants);
router.get('/restaurants/:id', verifyToken, getRestaurantById);
router.post('/restaurants', verifyToken, createRestaurant);
router.delete('/restaurants/:id', verifyToken, deleteRestaurant);

export default router;
