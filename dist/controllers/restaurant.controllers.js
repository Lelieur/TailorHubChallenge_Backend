"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRestaurant = exports.deleteRestaurant = exports.createRestaurant = exports.getRestaurantById = exports.getAllRestaurants = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const getAllRestaurants = (req, res, next) => {
    Restaurant_1.default
        .find()
        .then((restaurants) => res.status(200).json(restaurants))
        .catch(error => next(error));
};
exports.getAllRestaurants = getAllRestaurants;
const getRestaurantById = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid restaurant ID" });
        return;
    }
    Restaurant_1.default
        .findById(id)
        .then((restaurant) => res.status(200).json(restaurant))
        .catch(error => next(error));
};
exports.getRestaurantById = getRestaurantById;
const updateRestaurant = (req, res, next) => {
    const { id: restaurantId } = req.params;
    const { name, neighborhood, address, photograph, latlng, image, cuisine_type, operating_hours, reviews } = req.body;
    Restaurant_1.default
        .findByIdAndUpdate(restaurantId, { name, neighborhood, address, photograph, latlng, image, cuisine_type, operating_hours, reviews }, { runValidators: true })
        .then(() => res.status(200).json({ message: "Restaurant updated successfully" }))
        .catch(error => next(error));
};
exports.updateRestaurant = updateRestaurant;
const createRestaurant = (req, res, next) => {
    const { name, neighborhood, address, photograph, latlng, image, cuisine_type, operating_hours, reviews } = req.body;
    Restaurant_1.default
        .create({ name, neighborhood, address, photograph, latlng, image, cuisine_type, operating_hours, reviews })
        .then((restaurant) => res.status(201).json(restaurant))
        .catch(error => next(error));
};
exports.createRestaurant = createRestaurant;
const deleteRestaurant = (req, res, next) => {
    const { id } = req.params;
    Restaurant_1.default
        .findByIdAndDelete(id)
        .then((restaurant) => res.status(200).json(restaurant))
        .catch((error) => next(error));
};
exports.deleteRestaurant = deleteRestaurant;
