import express, { Application } from "express";
import logger from "morgan";
import cors from "cors";

const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.ORIGIN || "https://tailor-challenge-frontend.vercel.app"
    : "http://localhost:5173"; // URL para el entorno local

export default (app: Application): void => {
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: [FRONTEND_URL],
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus: 200,
    })
  );

  app.use(logger("dev"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};
