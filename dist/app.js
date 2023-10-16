"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const api_routes_1 = __importDefault(require("./routes/api.routes"));
const app = (0, express_1.default)();
// Settings
app.set("port", process.env.SERVER_PORT);
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static("./client/build"));
app.use(express_1.default.urlencoded({ extended: false }));
// Passport
app.use(passport_1.default.initialize());
// Routes
app.use("/api", api_routes_1.default);
app.get("*", (req, res) => {
    fs_1.default.readFile("./client/build/index.html", { encoding: "utf-8" }, (err, data) => {
        if (!data)
            res.send("Server is running on Port 8000");
        else
            res.send(data);
    });
});
exports.default = app;
