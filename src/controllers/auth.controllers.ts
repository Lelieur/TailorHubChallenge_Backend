import User from "../models/User.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
const saltRounds = 10;

const signupUser = (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]*$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must contain at least one number and one special character",
    });
    return;
  }

  if (password.length < 8) {
    res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Please use a valid email address" });
    return;
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        next(new Error("User already registered"));
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      return User.create({ username, email, password: hashedPassword });
    })
    .then((newUser) => {
      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    })
    .catch((error) => next(error));
};

const loginUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({
          message: "Unable to authenticate the user.",
        });
        return;
      }

      const { _id: id, username, email, favoriteRestaurants } = user;

      const payload = { id, username, email, favoriteRestaurants };

      const authToken = jwt.sign(
        payload,
        process.env.TOKEN_SECRET || "Pedo_Mellon_a_Minno",
        { algorithm: "HS256", expiresIn: "6h" }
      );

      res.status(200).json({
        authToken: authToken,
        userData: { id, username, email, favoriteRestaurants },
      });
    })
    .catch((error) => next(error));
};

const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ loggedUserData: req.payload });
};

export { signupUser, loginUser, verifyUser };
