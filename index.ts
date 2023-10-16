import http from "http";
import app from "./app";
import "./database";

/**
 * Starting our application
 */

const server = http.createServer(app);

server.listen(app.get("port"), () =>
  console.log(`>> Server is running on ${app.get("port")}`)
);
