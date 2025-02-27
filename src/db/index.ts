import mongoose from "mongoose";

const MONGODB_URI: string =
  (process.env.MONGODB_URI as string) ||
  "mongodb+srv://lucaslelieurll:Lukyluk1.72117@tailorhubchallenge.d9tp1.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI)
  .then((x) => {
    const dbName: string = x.connections[0].name;
    console.log(`Connected to Mongo! Database name: "${dbName}"`);
  })
  .catch((err: Error) => {
    console.error("Error connecting to mongo: ", err);
  });
