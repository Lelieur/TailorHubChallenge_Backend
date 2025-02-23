"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_routes_1 = __importDefault(require("./auth.routes"));
const restaurant_routes_1 = __importDefault(require("./restaurant.routes"));
exports.default = (app) => {
    app.use('/api', auth_routes_1.default);
    app.use('/api', restaurant_routes_1.default);
};
