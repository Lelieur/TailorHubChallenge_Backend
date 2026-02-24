import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isTokenJtiRevoked } from '../services/token-revocation';

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    res.status(401).json({ message: 'Authorization header is required' });
    return;
  }

  if (!authorizationHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization header must use Bearer token' });
    return;
  }

  const bearerToken = authorizationHeader.slice('Bearer '.length).trim();

  if (!bearerToken) {
    res.status(401).json({ message: 'Bearer token is required' });
    return;
  }

  if (!process.env.TOKEN_SECRET) {
    res.status(500).json({ message: 'TOKEN_SECRET not configured' });
    return;
  }

  try {
    const decodedToken = jwt.verify(bearerToken, process.env.TOKEN_SECRET);

    if (typeof decodedToken === 'string') {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    if (!decodedToken.id || typeof decodedToken.id !== 'string') {
      res.status(401).json({ message: 'Token missing user id' });
      return;
    }

    if (decodedToken.jti && typeof decodedToken.jti === 'string' && isTokenJtiRevoked(decodedToken.jti)) {
      res.status(401).json({ message: 'Token has been revoked' });
      return;
    }

    req.payload = decodedToken;
    req.authToken = bearerToken;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized user' });
  }
};

export default verifyToken;
