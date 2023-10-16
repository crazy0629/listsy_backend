import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../service/helper";

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
  if (user) {
    return res.json({ success: false, message: "User already exists!" });
  }

  // Make new user object to the database

  const payload = {
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
  };

  const newUser = new User(payload);
  await newUser.save();

  return res.json({
    success: true,
    message: "Successfully registered!",
    token: generateToken(newUser),
  });
};

export const signIn = async (req: Request, res: Response) => {};
