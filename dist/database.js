"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Connection to DB
 * Using Mongoose
 * MongoClientOptions
 */
mongoose_1.default.connect(process.env.MONGO_URI);
const connection = mongoose_1.default.connection;
connection.once("open", () => {
    console.log(">> MongoDB is Connected!");
});
connection.on("error", (err) => {
    console.log(err);
});
