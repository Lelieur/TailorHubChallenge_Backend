"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const router = (0, express_1.Router)();
router.post("/signup", auth_controllers_1.signupUser);
router.post("/login", auth_controllers_1.loginUser);
router.get("/verify", verifyToken_1.default, auth_controllers_1.verifyUser);
exports.default = router;
