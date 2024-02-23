import { Request, Response } from "express";
import mongoose from "mongoose";
import Furniture from "../models/Furniture";
import Ad from "../models/Ad";
import User from "../models/User";
import { generateToken } from "../service/helper";

export const loadFurnitureInfo = async (req: Request, res: Response) => {
  try {
    const furnitureModel = await Furniture.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (furnitureModel.length) {
      return res.json({
        success: false,
        message: "Ad publishing unsuccessful. Try again or contact support!",
      });
    }
    const adModel = await Ad.findById(
      new mongoose.Types.ObjectId(req.body.adId)
    );
    if (!adModel) {
      return res.json({
        success: false,
        message: "Ad publishing unsuccessful. Try again or contact support!",
      });
    }
    adModel.address = req.body.address;
    adModel.lng = req.body.lng;
    adModel.lat = req.body.lat;
    adModel.countryCode = req.body.countryCode;
    await adModel.save();

    const newFurniture = new Furniture();
    newFurniture.adId = req.body.adId;
    newFurniture.userId = req.body.userId;
    newFurniture.title = req.body.title;
    newFurniture.subTitle = req.body.subTitle;
    newFurniture.description = req.body.description;
    newFurniture.price = req.body.price;
    newFurniture.priceUnit = req.body.priceUnit;
    newFurniture.address = req.body.address;
    newFurniture.lat = req.body.lat;
    newFurniture.lng = req.body.lng;
    newFurniture.countryCode = req.body.countryCode;
    newFurniture.viewCount = 0;
    newFurniture.itemCategory = req.body.itemCategory;
    newFurniture.itemDetailInfo = req.body.itemDetailInfo;
    await newFurniture.save();

    const userModel = await User.findById(
      new mongoose.Types.ObjectId(req.body.userId)
    );
    if (!userModel) {
      return res.json({
        success: false,
        message: "Ad publishing unsuccessful. Try again or contact support!",
      });
    }
    if (userModel.telephoneNumber == undefined) {
      userModel.telephoneNumber = req.body.telephoneNumber;
      userModel.phoneNumberShare = req.body.phoneNumberShare;
      await userModel.save();
    }
    return res.json({
      success: true,
      message: "Upload Successful!",
      data: userModel,
      token: generateToken(userModel),
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Ad publishing unsuccessful. Try again or contact support!",
    });
  }
};
