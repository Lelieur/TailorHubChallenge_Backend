"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            res.status(401).json({ message: "No token provided" });
            return;
        }
        const tokenParts = token.split(' ');
        const bearerToken = tokenParts[1];
        if (!bearerToken) {
            res.status(401).json({ message: "Invalid token format" });
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            throw new Error('TOKEN_SECRET not found');
        }
        const validTokenPayload = jsonwebtoken_1.default.verify(bearerToken, process.env.TOKEN_SECRET);
        req.payload = validTokenPayload;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized user" });
    }
};
exports.default = verifyToken;
