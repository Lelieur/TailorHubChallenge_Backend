import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config({ path: ".env" });
}

import "./db";

import express, { Application } from "express";
const app: Application = express();

import configure from "./config";
configure(app);

import routes from "./routes";
routes(app);

import errorHandling from "./error-handling";
errorHandling(app);

export default app;
