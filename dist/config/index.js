"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRET_KEY = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**************************************  Server Consts variables  ***********************************/
exports.SECRET_KEY = process.env.SECRET_KEY || "listsy-backend-node-project";
