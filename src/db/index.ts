import mongoose from "mongoose";

const MONGODB_URI: string =
  (process.env.MONGODB_URI_PROD as string) ||
  "mongodb://localhost:27017/TailorChallenge";

mongoose
  .connect(MONGODB_URI)
  .then((x) => {
    const dbName: string = x.connections[0].name;
    console.log(`Connected to Mongo! Database name: "${dbName}"`);
  })
  .catch((err: Error) => {
    console.error("Error connecting to mongo: ", err);
  });
