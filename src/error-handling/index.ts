import { Application, Request, Response } from 'express';
import HttpError from '../errors/http-error';

type PrismaErrorLike = {
  code?: string;
  message?: string;
};

export default (app: Application): void => {
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'This route does not exist' });
  });

  app.use((err: Error | HttpError | PrismaErrorLike, req: Request, res: Response) => {
    if (!res.headersSent) {
      if (err instanceof HttpError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }

      if (
        typeof err === 'object' &&
        err &&
        'code' in err &&
        (err as PrismaErrorLike).code === 'P2025'
      ) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }

      if (!err.message) {
        res.status(500).json({
          message: 'Internal server error. Check the server console',
        });
      } else {
        res.status(500).json({
          message: err.message,
        });
      }
    }
  });
};
