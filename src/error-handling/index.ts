import { Application, Request, Response } from 'express';

export default (app: Application): void => {
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'This route does not exist' });
  });

  app.use((err: Error, req: Request, res: Response) => {
    if (!res.headersSent) {
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
