import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { revokeTokenJti } from '../services/token-revocation';

const saltRounds = 10;

const signupUser = (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        'Password must contain at least one number and one special character and be at least 8 characters long',
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Please use a valid email address' });
    return;
  }

  prisma.user
    .findUnique({ where: { email } })
    .then((user) => {
      if (user) {
        next(new Error('User already registered'));
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      return prisma.user.create({
        data: { username, email, password: hashedPassword },
      });
    })
    .then((newUser) => {
      if (!newUser) return;
      const { ...safeUser } = newUser;
      res.status(201).json({ message: 'User created successfully', user: safeUser });
    })
    .catch((error) => next(error));
};

const loginUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const tokenSecret = process.env.TOKEN_SECRET;

  if (!email || !password) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  if (!tokenSecret) {
    res.status(500).json({ message: 'TOKEN_SECRET not configured' });
    return;
  }

  prisma.user
    .findUnique({
      where: { email },
    })
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({
          message: 'Unable to authenticate the user.',
        });
        return;
      }

      const { id, username, email, favoriteRestaurantIds } = user;

      const payload = {
        id,
        username,
        email,
        favoriteRestaurants: favoriteRestaurantIds,
      };

      const authToken = jwt.sign(payload, tokenSecret, {
        algorithm: 'HS256',
        expiresIn: '6h',
        jwtid: randomUUID(),
      });

      res.status(200).json({
        authToken,
        userData: { id, username, email, favoriteRestaurants: favoriteRestaurantIds },
      });
    })
    .catch((error) => next(error));
};

const verifyUser = (req: Request, res: Response) => {
  res.status(200).json({ loggedUserData: req.payload });
};

const logoutUser = (req: Request, res: Response) => {
  const tokenId = req.payload?.jti;

  if (!tokenId || typeof tokenId !== 'string') {
    res.status(400).json({ message: 'Token cannot be revoked' });
    return;
  }

  revokeTokenJti(tokenId);
  res.status(204).send();
};

export { signupUser, loginUser, verifyUser, logoutUser };
