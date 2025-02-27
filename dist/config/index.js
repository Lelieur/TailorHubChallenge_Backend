"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const FRONTEND_URL = process.env.NODE_ENV === "production"
    ? process.env.ORIGIN || "https://tailor-challenge-frontend.vercel.app"
    : "http://localhost:5173"; // URL para el entorno local
exports.default = (app) => {
    app.set("trust proxy", 1);
    app.use((0, cors_1.default)({
        origin: [FRONTEND_URL],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        optionsSuccessStatus: 200,
    }));
    app.use((0, morgan_1.default)("dev"));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
};
