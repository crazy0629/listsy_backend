import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../service/helper";
import { signUpVerificationEmail } from "../service/signupVeriEmail";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

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

export const signUp = async (req: Request, res: Response) => {
  // Check if all registration infos are valid

  if (!req.body.email || !req.body.password || !req.body.userName) {
    return res.json({
      success: false,
      message: "Please input your registration data",
    });
  }

  // Check if user already exists

  const user = await User.findOne({ email: req.body.email });

  if (user && user.isVerified) {
    return res.json({ success: false, message: "User already exists!" });
  }

  if (user && !user.isVerified) {
    await sendVerificationEmail(user.token, user.email, user.userName);

    return res.json({
      success: true,
      message:
        "User already exists but not verified yet, Please check your email inbox and verify your email",
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

  const newUser = new User(payload);
  await newUser.save();

  await sendVerificationEmail(token, req.body.email, req.body.userName);

  return res.json({
    success: true,
    message:
      "Successfully registered, Please check your email inbox and verify your email.",
  });
};

/**
 * User sign in function
 * @param req
 * @param res
 * @returns
 */

export const signIn = async (req: Request, res: Response) => {
  // Check if all the input values

  if (!req.body.email || !req.body.password) {
    return res.json({
      success: false,
      message: "No Input Data!",
    });
  }

  // Check if user not exist

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({
      success: false,
      message: "User does not exists!",
    });
  }

  if (user && !user.isVerified) {
    await sendVerificationEmail(user.token, user.email, user.userName);
    return res.json({
      success: true,
      message: "You need to verify your email, Please check your email inbox",
      isVerified: false,
    });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (isMatch) {
    return res.json({
      success: true,
      message: "Successfully signed!",
      token: generateToken(user),
      isVerified: true,
    });
  }

  return res.json({
    success: false,
    message: "The email or password are incorrect!",
  });
};

/**
 * Email verification resend func
 * @param req
 * @param res
 * @returns
 */

export const resendVeriEmail = async (req: Request, res: Response) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({
      success: false,
      message: "Error happened while resending verification email",
    });
  }
  const token = crypto.randomBytes(20).toString("hex");
  user.token = token;
  await user.save();
  await sendVerificationEmail(user.token, user.email, user.userName);
  return res.json({
    success: true,
    message: "Verification email is successfully resent",
  });
};

/**
 * Sends verification email to user's email address
 *  @param      {string}  token - The token info which is included to email verification link
 *  @param      {string}  email - user's email
 *  @param      {string}  userName - user's name
 *  @returns    {boolean}
 */

const sendVerificationEmail = async (
  token: string,
  email: string,
  userName: string
) => {
  const link = `${process.env.HOST_URL}/verify?token=${token}&email=${email}`;
  const html = signUpVerificationEmail(link, userName);
  const data = {
    from: "Listsy <support@spyderreceipts.com>",
    to: email,
    subject: "Verify your email address",
    html,
  };

  mailgun.messages().send(data, (error: Error, body) => {
    if (error) {
      return false;
    }
    return true;
  });
};
