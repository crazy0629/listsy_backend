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

export const getAdDetailInfo = async (req: Request, res: Response) => {
  try {
    const diyObj = await Diy.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!diyObj)
      return res.json({
        success: false,
        message: "Error found while loading deail info!",
      });

    diyObj.viewCount = diyObj.viewCount + 1;
    await diyObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: diyObj,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getMoreDiyAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (
      req.body.centerLocationSelected == true &&
      req.body.SearchWithin != ""
    ) {
      condition.countryCode = req.body.selectedLocation.countryCode;
    } else {
      if (req.body.countryCode != null) {
        if (req.body.countryCode == "") {
          condition.address = req.body.address;
        } else {
          condition.countryCode = req.body.countryCode;
        }
      }
    }
    if (req.body.itemCategory != "All" && req.body.itemCategory != "") {
      condition.itemCategory = req.body.itemCategory;
    }
    let nextDiyAds = await Diy.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextDiyAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more food ads",
    });
  }
};

export const getCountForEachCategory = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.countryCode != null) {
      if (req.body.countryCode == "") {
        condition.address = req.body.address;
      } else {
        condition.countryCode = req.body.countryCode;
      }
    }

    let countList: any = [];
    const diyModel = await Diy.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = diyModel?.length;
      else count = diyModel.filter((obj) => obj.itemCategory == item)?.length;
      countList.push({ itemCategory: item, count });
    });
    return res.json({
      success: true,
      countList,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error happened while getting data!",
    });
  }
};
