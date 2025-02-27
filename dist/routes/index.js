"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_routes_1 = __importDefault(require("./auth.routes"));
const restaurant_routes_1 = __importDefault(require("./restaurant.routes"));
const cloudinary_routes_1 = __importDefault(require("./cloudinary.routes"));
const review_routes_1 = __importDefault(require("./review.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
exports.default = (app) => {
    app.use("/api", auth_routes_1.default);
    app.use("/api", restaurant_routes_1.default);
    app.use("/api", cloudinary_routes_1.default);
    app.use("/api", review_routes_1.default);
    app.use("/api", user_routes_1.default);
};
