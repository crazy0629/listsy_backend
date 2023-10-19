import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Multer from "multer";
import { generateToken } from "../service/helper";

export const setAvatar = async (req: Request, res: Response) => {
  User.findById(new mongoose.Types.ObjectId(req.body.userId))
    .then(async (user: any) => {
      if (user) {
        const multerReq = req as Request & { file?: Multer.File };

        if (!multerReq?.file) {
          // No file was uploaded, handle error
          res.status(400).json({ success: false, message: "No file uploaded" });
          return;
        }

        // Access the uploaded file using req.file
        const { filename, originalname } = multerReq.file;
        user.avatar = filename;
        await user.save();

        // Process the file as needed (e.g., save the filename to the user's profile)

        res.json({
          success: true,
          message: "Avatar uploaded successfully",
          filename,
          originalname,
        });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    })
    .catch((error: any) => {
      console.error("Database error:", error);
      res.status(500).json({ success: false, message: "An error occurred" });
    });
};

export const editProfile = async (req: Request, res: Response) => {
  User.findById(new mongoose.Types.ObjectId(req.body.userId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error happened while changing setting your profile!",
        });
      }
      model.firstName = req.body.firstName;
      model.lastName = req.body.lastName;
      model.userName = req.body.userName;
      model.bio = req.body.bio;
      model.telephoneNumber = req.body.telephoneNumber;
      // model.addressCity = req.body.addressCity;
      // model.addressCountry = req.body.addressCountry;

      await model.save();

      return res.json({
        success: true,
        message: "Your profile is successfully edited",
        data: model,
        token: generateToken(model),
      });
    }
  );
};

export const deleteAccount = async (req: Request, res: Response) => {
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

export const changePassword = async (req: Request, res: Response) => {
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
