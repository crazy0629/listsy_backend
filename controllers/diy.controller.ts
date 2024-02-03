import { Request, Response } from "express";
import Diy from "../models/Diy";
import mongoose from "mongoose";
import Ad from "../models/Ad";
import User from "../models/User";
import { generateToken } from "../service/helper";

export const loadDiyInfo = async (req: Request, res: Response) => {
  try {
    const diyModel = await Diy.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (diyModel.length) {
      return res.json({
        success: false,
        message: "Error found!",
      });
    }
    const adModel = await Ad.findById(
      new mongoose.Types.ObjectId(req.body.adId)
    );
    if (!adModel) {
      return res.json({
        success: false,
        message: "Error found!",
      });
    }
    adModel.address = req.body.address;
    adModel.lng = req.body.lng;
    adModel.lat = req.body.lat;
    adModel.countryCode = req.body.countryCode;
    await adModel.save();

    const newDiy = new Diy();
    newDiy.adId = req.body.adId;
    newDiy.userId = req.body.userId;
    newDiy.title = req.body.title;
    newDiy.subTitle = req.body.subTitle;
    newDiy.description = req.body.description;
    newDiy.price = req.body.price;
    newDiy.priceUnit = req.body.priceUnit;
    newDiy.address = req.body.address;
    newDiy.lat = req.body.lat;
    newDiy.lng = req.body.lng;
    newDiy.countryCode = req.body.countryCode;
    newDiy.viewCount = 0;
    newDiy.itemCategory = req.body.itemCategory;
    newDiy.itemDetailInfo = req.body.itemDetailInfo;
    await newDiy.save();

    const userModel = await User.findById(
      new mongoose.Types.ObjectId(req.body.userId)
    );
    if (!userModel) {
      return res.json({
        success: false,
        message: "Error found!",
      });
    }
    if (userModel.telephoneNumber == undefined) {
      userModel.telephoneNumber = req.body.telephoneNumber;
      userModel.phoneNumberShare = req.body.phoneNumberShare;
      await userModel.save();
    }
    return res.json({
      success: true,
      message: "Successfully saved pet information!",
      data: userModel,
      token: generateToken(userModel),
    });
  } catch (error) {
    console.log(error);
  }
};
