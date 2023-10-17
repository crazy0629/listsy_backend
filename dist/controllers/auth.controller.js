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
const signupVeriEmail_1 = require("../service/signupVeriEmail");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const crypto = require("crypto");
const fs = require("fs");
const mailgun = require("mailgun-js")({
    apiKey: process.env.Mailgun_API_KEY,
    domain: "spyderreceipts.com",
});
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
    if (user && user.isVerified) {
        return res.json({ success: false, message: "User already exists!" });
    }
    if (user && !user.isVerified) {
        yield sendVerificationEmail(user.token, user.email, user.userName);
        return res.json({
            success: false,
            message: "User already exists but not verified yet, Please check your email inbox and verify your email",
        });
    }
    //Generate Random 20 hex
    const token = crypto.randomBytes(20).toString("hex");
    // Make new user object to the database
    const payload = {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        isVerified: false,
        token,
    };
    const newUser = new User_1.default(payload);
    yield newUser.save();
    yield sendVerificationEmail(token, req.body.email, req.body.userName);
    return res.json({
        success: true,
        message: "Successfully registered, Please check your email inbox and verify your email.",
    });
});
exports.signUp = signUp;
/**
 * User sign in function
 * @param req
 * @param res
 * @returns
 */
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.signIn = signIn;
/**
 * Sends verification email to user's email address
 *  @param      {string}  token - The token info which is included to email verification link
 *  @param      {string}  email - user's email
 *  @param      {string}  userName - user's name
 *  @returns    {boolean}
 */
const sendVerificationEmail = (token, email, userName) => __awaiter(void 0, void 0, void 0, function* () {
    const link = `${process.env.HOST_URL}/verify?token=${token}&email=${email}`;
    const html = (0, signupVeriEmail_1.signUpVerificationEmail)(link, userName);
    const data = {
        from: "Listsy <support@spyderreceipts.com>",
        to: email,
        subject: "Verify your email address",
        html,
    };
    mailgun.messages().send(data, (error, body) => {
        if (error) {
            return false;
        }
        return true;
    });
});
