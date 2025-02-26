import express, { Application } from "express";
import logger from "morgan";
import cors from "cors";

const FRONTEND_URL =
  process.env.ORIGIN || "https://tailor-challenge-frontend.vercel.app";

export default (app: Application): void => {
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: [FRONTEND_URL],
    })
  );

  app.use(logger("dev"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};
