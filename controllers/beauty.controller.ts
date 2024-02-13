import { Request, Response } from "express";
import mongoose from "mongoose";
import Beauty from "../models/Beauty";
import Ad from "../models/Ad";
import User from "../models/User";
import { generateToken } from "../service/helper";

export const loadBeautyInfo = async (req: Request, res: Response) => {
  try {
    const beautyModel = await Beauty.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (beautyModel.length) {
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

    const newBeauty = new Beauty();
    newBeauty.adId = req.body.adId;
    newBeauty.userId = req.body.userId;
    newBeauty.title = req.body.title;
    newBeauty.subTitle = req.body.subTitle;
    newBeauty.description = req.body.description;
    newBeauty.price = req.body.price;
    newBeauty.priceUnit = req.body.priceUnit;
    newBeauty.address = req.body.address;
    newBeauty.lat = req.body.lat;
    newBeauty.lng = req.body.lng;
    newBeauty.countryCode = req.body.countryCode;
    newBeauty.viewCount = 0;
    newBeauty.itemCategory = req.body.itemCategory;
    newBeauty.itemDetailInfo = req.body.itemDetailInfo;
    await newBeauty.save();

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
    res.json({
      success: false,
      message: "Ad publishing unsuccessful. Try again or contact support!",
    });
  }
};

export const getAdDetailInfo = async (req: Request, res: Response) => {
  try {
    const beautyObj = await Beauty.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!beautyObj)
      return res.json({
        success: false,
        message: "Error found while loading deail info!",
      });

    beautyObj.viewCount = beautyObj.viewCount + 1;
    await beautyObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: beautyObj,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};
