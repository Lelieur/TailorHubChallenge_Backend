"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.signupUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const saltRounds = 10;
const signupUser = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({ message: "Password must contain at least one number and one special character" });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ message: "Password must be at least 8 characters long" });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Please use a valid email address" });
        return;
    }
    User_1.default
        .findOne({ email })
        .then((user) => {
        if (user) {
            res.status(400).json({ message: "User already registered" });
            return;
        }
        const salt = bcrypt_1.default.genSaltSync(saltRounds);
        const hashedPassword = bcrypt_1.default.hashSync(password, salt);
        return User_1.default
            .create({ username, email, password: hashedPassword });
    })
        .then((newUser) => {
        res.status(201).json({ message: "User created successfully", user: newUser });
    })
        .catch((error) => next(error));
};
exports.signupUser = signupUser;
const loginUser = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    User_1.default
        .findOne({ email })
        .then((user) => {
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const isPasswordValid = bcrypt_1.default.compareSync(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Unable to authenticate the user" });
            return;
        }
        const { _id, username, email } = user;
        const payload = { _id, username, email };
        const authToken = jsonwebtoken_1.default.sign(payload, process.env.TOKEN_SECRET || 'supersecret', { algorithm: 'HS256', expiresIn: "6h" });
        res.status(200).json({ token: authToken, id: user._id });
    })
        .catch((error) => next(error));
};
exports.loginUser = loginUser;
