"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const restaurant_controllers_1 = require("../controllers/restaurant.controllers");
const router = (0, express_1.Router)();
router.get('/restaurants', restaurant_controllers_1.getAllRestaurants);
router.get('/restaurants/:id', restaurant_controllers_1.getRestaurantById);
router.put('/restaurants/:id', verifyToken_1.default, restaurant_controllers_1.updateRestaurant);
router.post('/restaurants', verifyToken_1.default, restaurant_controllers_1.createRestaurant);
router.delete('/restaurants/:id', verifyToken_1.default, restaurant_controllers_1.deleteRestaurant);
exports.default = router;
