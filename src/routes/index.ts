import { Application } from "express";
import authRouter from "./auth.routes";
import restaurantRouter from "./restaurant.routes";
import cloudinaryRouter from "./cloudinary.routes";

export default (app: Application): void => {
  app.use("/api", authRouter);
  app.use("/api", restaurantRouter);
  app.use("/api", cloudinaryRouter);
};
