import { Application } from 'express';
import authRouter from './auth.routes';
import restaurantRouter from './restaurant.routes';

export default (app: Application): void => {
    app.use('/api', authRouter);
    app.use('/api', restaurantRouter);
}