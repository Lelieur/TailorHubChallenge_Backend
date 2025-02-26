import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const tokenParts = token.split(" ");
    const bearerToken = tokenParts[1];

    if (!bearerToken) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET not found");
    }

    const validTokenPayload = jwt.verify(bearerToken, process.env.TOKEN_SECRET);

    req.payload = validTokenPayload as jwt.JwtPayload;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized user" });
  }
};

export default verifyToken;
