import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI as string || 'mongodb://localhost:27017/';

mongoose
    .connect(MONGODB_URI)
    .then((x) => {
        const dbName: string = x.connections[0].name;
        console.log(`Connected to Mongo! Database name: "${dbName}"`);
    })
    .catch((err: Error) => {
        console.error("Error connecting to mongo: ", err);
    });
