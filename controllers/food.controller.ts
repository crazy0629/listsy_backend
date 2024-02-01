import { Request, Response } from "express";
import Food from "../models/Food";
import mongoose from "mongoose";
import Ad from "../models/Ad";
import User from "../models/User";
import { generateToken } from "../service/helper";

export const loadFoodInfo = async (req: Request, res: Response) => {
  try {
    const foodModel = await Food.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (foodModel.length) {
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

    const newFood = new Food();
    newFood.adId = req.body.adId;
    newFood.userId = req.body.userId;
    newFood.title = req.body.title;
    newFood.subTitle = req.body.subTitle;
    newFood.description = req.body.description;
    newFood.price = req.body.price;
    newFood.priceUnit = req.body.priceUnit;
    newFood.address = req.body.address;
    newFood.lat = req.body.lat;
    newFood.lng = req.body.lng;
    newFood.countryCode = req.body.countryCode;
    newFood.viewCount = 0;
    newFood.itemCategory = req.body.itemCategory;
    newFood.itemDetailInfo = req.body.itemDetailInfo;
    await newFood.save();

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

export const getAdDetailInfo = async (req: Request, res: Response) => {
  try {
    const foodObj = await Food.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!foodObj)
      return res.json({
        success: false,
        message: "Error found while loading deail info!",
      });

    foodObj.viewCount = foodObj.viewCount + 1;
    await foodObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: foodObj,
    });
  } catch (error) {
    console.log(error);
  }
};
