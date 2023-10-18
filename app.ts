import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();

import apiRoutes from "./routes/api.routes";
const app = express();

// Settings
app.set("port", process.env.SERVER_PORT);

// Middlewares
app.use(cors());

app.use(express.json());
app.use(express.static("./client/build"));
app.use(express.urlencoded({ extended: false }));

// Passport
app.use(passport.initialize());

// Routes
app.use("/api", apiRoutes);
app.use(
  "/uploadsAvatar",
  express.static(path.join(__dirname, "uploadsAvatar"))
);

app.get("*", (req, res) => {
  fs.readFile(
    "./client/build/index.html",
    { encoding: "utf-8" },
    (err, data) => {
      if (!data) res.send("Server is running on Port 8000");
      else res.send(data);
    }
  );
});

export default app;
