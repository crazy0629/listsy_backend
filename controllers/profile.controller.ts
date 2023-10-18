import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const deleteAccount = (req: Request, res: Response) => {
  User.findByIdAndDelete(new mongoose.Types.ObjectId(req.body.userId)).then(
    (model: any) => {
      if (!model)
        return res.json({
          success: false,
          message: "Error happend why deleting your account!",
        });
      res.json({ success: true, model });
    }
  );
};

export const changePassword = (req: Request, res: Response) => {
  User.findById(new mongoose.Types.ObjectId(req.body.userId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error happened while changing your password!",
        });
      }
      const isMatch = await bcrypt.compare(
        req.body.prevPassword,
        model.password
      );
      if (!isMatch) {
        return res.json({
          success: false,
          message: "Your previous password is not correct",
        });
      }
      model.password = req.body.newPassword;
      await model.save();
      return res.json({
        success: true,
        message: "Password is successfully changed",
      });
    }
  );
};
