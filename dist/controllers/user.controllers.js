"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavoriteRestaurant = exports.addFavoriteRestaurant = exports.getUserById = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const getUserById = (req, res, next) => {
    const { id } = req.params;
    User_model_1.default.findById(id)
        .populate("reviews")
        .populate("favoriteRestaurants")
        .then((user) => res.status(200).json(user))
        .catch((error) => next(error));
};
exports.getUserById = getUserById;
const addFavoriteRestaurant = (req, res, next) => {
    const { id: restaurantId } = req.params;
    const { id: userId } = req.body;
    User_model_1.default.findByIdAndUpdate(userId, { $push: { favoriteRestaurants: restaurantId } }, { new: true, runValidators: true })
        .then((restaurant) => res.status(200).json(restaurant))
        .catch((error) => next(error));
};
exports.addFavoriteRestaurant = addFavoriteRestaurant;
const removeFavoriteRestaurant = (req, res, next) => {
    const { id: restaurantId } = req.params;
    const { id: userId } = req.body;
    console.log("userId desde el cuerpo:", userId);
    console.log("restaurantId desde los parámetros:", restaurantId);
    User_model_1.default.findByIdAndUpdate(userId, { $pull: { favoriteRestaurants: restaurantId } }, { new: true, runValidators: true })
        .then((restaurant) => res.status(200).json(restaurant))
        .catch((error) => next(error));
};
exports.removeFavoriteRestaurant = removeFavoriteRestaurant;
