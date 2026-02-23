"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = process.env.MONGODB_URI ||
    "mongodb+srv://lucaslelieurll:Lukyluk1.72117@tailorhubchallenge.d9tp1.mongodb.net/?retryWrites=true&w=majority";
mongoose_1.default
    .connect(MONGODB_URI)
    .then((x) => {
    const dbName = x.connections[0].name;
    console.log(`Connected to Mongo! Database name: "${dbName}"`);
})
    .catch((err) => {
    console.error("Error connecting to mongo: ", err);
});
