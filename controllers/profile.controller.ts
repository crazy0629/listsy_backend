import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Multer from "multer";
import path from "path";
import fs from "fs";
import { generateToken } from "../service/helper";
import Estate from "../models/Estate";
import Vehicle from "../models/Vehicle";
import Job from "../models/Job";
import ForSale from "../models/ForSale";
import Garden from "../models/Garden";
import Fashion from "../models/Fashion";
import Sports from "../models/Sports";
import Children from "../models/Children";
import Art from "../models/Art";
import Education from "../models/Education";
import Pet from "../models/Pet";
import Food from "../models/Food";
import Diy from "../models/Diy";
import Beauty from "../models/Beauty";
import Toy from "../models/toys";
import Music from "../models/Music";
import Furniture from "../models/Furniture";
import Service from "../models/Service";

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

        if (user.avatar) {
          const prevAvatarPath = path.join(__dirname, "/.." + user.avatar);
          fs.unlink(prevAvatarPath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            }
          });
        }

        // Access the uploaded file using req.file
        const { filename, originalname } = multerReq.file;
        user.avatar = "/uploads/avatar/" + filename;
        await user.save();

        // Process the file as needed (e.g., save the filename to the user's profile)

        res.json({
          success: true,
          message: "Avatar uploaded successfully",
          data: user,
          token: generateToken(user),
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

export const changePhoneNumberShare = async (req: Request, res: Response) => {
  User.findById(new mongoose.Types.ObjectId(req.body.userId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      model.phoneNumberShare = req.body.phoneNumberShare;
      await model.save();

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: model,
        token: generateToken(model),
      });
    }
  );
};

export const editProfile = async (req: Request, res: Response) => {
  User.findById(new mongoose.Types.ObjectId(req.body.userId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      model.firstName = req.body.firstName;
      model.lastName = req.body.lastName;
      model.userName = req.body.userName;
      model.bio = req.body.bio;
      model.telephoneNumber = req.body.telephoneNumber;

      await model.save();

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: model,
        token: generateToken(model),
      });
    }
  );
};

export const deleteAccount = async (req: Request, res: Response) => {
  User.findById(new mongoose.Types.ObjectId(req.body.userId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error happend why deleting your account!",
        });
      }
      const isMatch = await bcrypt.compare(req.body.password, model.password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: "Your password is not correct",
        });
      }
      User.findByIdAndDelete(new mongoose.Types.ObjectId(req.body.userId)).then(
        (model: any) => {
          return res.json({
            success: true,
            message: "Your account is successfully deleted!",
          });
        }
      );
    }
  );
};

export const changePassword = async (req: Request, res: Response) => {
  User.findById(new mongoose.Types.ObjectId(req.body.userId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error found!",
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

/**
 * This function returns user's own posts
 *
 * @param req
 * @param res
 */

export const getPostByUser = async (req: Request, res: Response) => {
  let adCondition = {};
  if (req.body.adState !== "") adCondition = { state: req.body.adState };
  if (req.body.postType == "sale") {
    ForSale.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded electronics ads posted by you!",
        });
      });
  }
  if (req.body.postType == "pet") {
    Pet.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded pet ads posted by you!",
        });
      });
  }
  if (req.body.postType == "food") {
    Food.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded food ads posted by you!",
        });
      });
  }
  if (req.body.postType == "diy") {
    Diy.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded your Diy ads!",
        });
      });
  }
  if (req.body.postType == "garden") {
    Garden.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded estate ads posted by you!",
        });
      });
  }
  if (req.body.postType == "beauty") {
    Beauty.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded beauty ads posted by you!",
        });
      });
  }
  if (req.body.postType == "toys") {
    Toy.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded toy ads posted by you!",
        });
      });
  }
  if (req.body.postType == "music") {
    Music.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded music ads posted by you!",
        });
      });
  }
  if (req.body.postType == "fashion") {
    Fashion.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded estate ads posted by you!",
        });
      });
  }
  if (req.body.postType == "children") {
    Children.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded estate ads posted by you!",
        });
      });
  }
  if (req.body.postType == "art") {
    Art.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded estate ads posted by you!",
        });
      });
  }
  if (req.body.postType == "education") {
    Education.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded education ads posted by you!",
        });
      });
  }
  if (req.body.postType == "sports") {
    Sports.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded sports ads posted by you!",
        });
      });
  }
  if (req.body.postType == "furniture") {
    Furniture.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded furniture ads posted by you!",
        });
      });
  }
  if (req.body.postType == "services") {
    Service.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded service ads posted by you!",
        });
      });
  }
  if (req.body.postType == "estate") {
    Estate.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded estate ads posted by you!",
        });
      });
  }

  if (req.body.postType == "truck") {
    Vehicle.find({ userId: req.body.userId })
      .populate({ path: "adId", match: adCondition })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        const value = model.filter((item) => item.adId !== null);
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: value,
          message: "Successfully loaded vehicle ads posted by you!",
        });
      });
  }

  if (req.body.postType == "job") {
    Job.find({ userId: req.body.userId })
      .populate("userId")
      .skip(req.body.index * 50)
      .limit(50)
      .then((model: any) => {
        if (!model) {
          return res.json({ success: false, message: "Error found!" });
        }
        return res.json({
          success: true,
          data: model,
          message: "Successfully loaded vehicle ads posted by you!",
        });
      });
  }
};
