"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signIn = exports.signUp = void 0;
const User_1 = __importDefault(require("../models/User"));
const helper_1 = require("../service/helper");
/**
 * User registration function
 * @param req
 * @param res
 * @returns
 */
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if all registration infos are valid
    if (!req.body.email || !req.body.password || !req.body.userName) {
        return res.json({
            success: false,
            message: "Please input your registration data",
        });
    }
    // Check if user already exists
    const user = yield User_1.default.findOne({ email: req.body.email });
    if (user) {
        return res.json({ success: false, message: "User already exists!" });
    }
    // Make new user object to the database
    const payload = {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
    };
    const newUser = new User_1.default(payload);
    yield newUser.save();
    return res.json({
        success: true,
        message: "Successfully registered!",
        token: (0, helper_1.generateToken)(newUser),
    });
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.signIn = signIn;
