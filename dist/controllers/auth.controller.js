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
exports.checkSignUpVerificationToken = exports.resetPassword = exports.forgetPassword = exports.resendVeriEmail = exports.signIn = exports.signUp = void 0;
const User_1 = __importDefault(require("../models/User"));
const helper_1 = require("../service/helper");
const signupVeriEmail_1 = require("../service/signupVeriEmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const passResetVeriEmail_1 = require("../service/passResetVeriEmail");
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
    // Check if all registration infos are
    if (!req.body.email ||
        !req.body.password ||
        !req.body.firstName ||
        !req.body.lastName) {
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
        yield sendVerificationEmail(user.token, user.email, user.firstName);
        return res.json({
            success: true,
            message: "User already exists but not verified yet, Please check your email inbox and verify your email",
        });
    }
    //Generate Random hex
    const token = crypto.randomBytes(20).toString("hex");
    const passwordToken = crypto.randomBytes(30).toString("hex");
    // Make new user object to the database
    const payload = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        isVerified: false,
        token,
        passwordToken,
        reviewCount: 0,
        reviewMark: 0,
    };
    const newUser = new User_1.default(payload);
    yield newUser.save();
    yield sendVerificationEmail(token, req.body.email, req.body.firstName);
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
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if all the input values
    if (!req.body.email || !req.body.password) {
        return res.json({
            success: false,
            message: "No Input Data!",
        });
    }
    // Check if user not exist
    const user = yield User_1.default.findOne({ email: req.body.email });
    if (!user) {
        return res.json({
            success: false,
            message: "User does not exists!",
        });
    }
    if (user && !user.isVerified) {
        yield sendVerificationEmail(user.token, user.email, user.firstName);
        return res.json({
            success: true,
            message: "You need to verify your email, Please check your email inbox",
            isVerified: false,
        });
    }
    const isMatch = yield bcrypt_1.default.compare(req.body.password, user.password);
    if (isMatch) {
        return res.json({
            success: true,
            message: "Successfully signed!",
            token: (0, helper_1.generateToken)(user),
            isVerified: true,
        });
    }
    return res.json({
        success: false,
        message: "The email or password are incorrect!",
    });
});
exports.signIn = signIn;
/**
 * Email verification resend func
 * @param req
 * @param res
 * @returns
 */
const resendVeriEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield User_1.default.findOne({ email: req.body.email });
    if (!user) {
        return res.json({
            success: false,
            message: "Error happened while resending verification email",
        });
    }
    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    yield user.save();
    yield sendVerificationEmail(user.token, user.email, user.firstName);
    return res.json({
        success: true,
        message: "Verification email is successfully resent",
    });
});
exports.resendVeriEmail = resendVeriEmail;
/**
 * forgetPassword Email Verification send function
 *
 *  @param req
 *  @param res
 *  @returns
 */
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield User_1.default.findOne({ email: req.body.email });
    if (!user) {
        return res.json({
            success: false,
            message: "Your email is not registered",
        });
    }
    yield sendForgetPasswordVerificationEmail(req.body.email, user.passwordToken, user.firstName);
    return res.json({
        success: true,
        message: "Verification email is successfully sent to your email, please check your inbox and follow instructions to reset password",
    });
});
exports.forgetPassword = forgetPassword;
/**
 *  Password Reset function
 *
 *  @param req
 *  @param res
 *  @returns
 */
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield User_1.default.findOne({
        email: req.body.email,
        passwordToken: req.body.token,
    });
    if (!user) {
        return res.json({
            success: false,
            message: "Your email verification link is not correct!",
        });
    }
    user.password = req.body.password;
    yield user.save();
    return res.json({
        success: true,
        message: "Password reset is successfully done",
    });
});
exports.resetPassword = resetPassword;
/**
 *  Check signup verification link is correct
 *
 *  @param req
 *  @param res
 *  @returns
 */
const checkSignUpVerificationToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield User_1.default.findOne({
        email: req.body.email,
        token: req.body.token,
    });
    if (!user) {
        return res.json({
            success: false,
            message: "Error happened while doing verification your email",
        });
    }
    user.isVerified = true;
    yield user.save();
    return res.json({
        success: true,
        message: "Your email is successfully verified",
    });
});
exports.checkSignUpVerificationToken = checkSignUpVerificationToken;
/**
 * Sends verification email to user's email address
 *  @param      {string}  token - The token info which is included to email verification link
 *  @param      {string}  email - user's email
 *  @param      {string}  userName - user's name
 *  @returns    {boolean}
 */
const sendVerificationEmail = (token, email, userName) => __awaiter(void 0, void 0, void 0, function* () {
    const link = `${process.env.HOST_URL}/auth/verify?token=${token}&email=${email}`;
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
/**
 * Sends forget password verification email to user's email address
 *  @param      {string}  token - The token info which is included to email verification link
 *  @param      {string}  email - user's email
 *  @returns    {boolean}
 */
const sendForgetPasswordVerificationEmail = (email, token, userName) => __awaiter(void 0, void 0, void 0, function* () {
    const link = `${process.env.HOST_URL}/auth/reset-password?token=${token}&email=${email}`;
    const html = (0, passResetVeriEmail_1.passwordResetVerificationEmail)(link, userName);
    const data = {
        from: "Listsy <support@spyderreceipts.com>",
        to: email,
        subject: "Verify your email address to reset your password",
        html,
    };
    mailgun.messages().send(data, (error, body) => {
        if (error) {
            return false;
        }
        return true;
    });
});
