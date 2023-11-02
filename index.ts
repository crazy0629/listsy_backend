import http from "http";
import app from "./app";
import "./database";
import { setupWebSocket } from "./controllers/chat.controller";
/**
 * Starting our application
 */

const server = http.createServer(app);
setupWebSocket(server);
server.listen(app.get("port"), () =>
  console.log(`>> Server is running on ${app.get("port")}`)
);
