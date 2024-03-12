import { Request, Response } from "express";
import mongoose from "mongoose";
import Service from "../models/Service";
import Ad from "../models/Ad";
import User from "../models/User";
import { generateToken, getConditionToCountry } from "../service/helper";

export const loadServiceInfo = async (req: Request, res: Response) => {
  try {
    const serviceModel = await Service.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (serviceModel.length) {
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

    const newServiceModel = new Service();
    newServiceModel.adId = req.body.adId;
    newServiceModel.userId = req.body.userId;
    newServiceModel.title = req.body.title;
    newServiceModel.subTitle = req.body.subTitle;
    newServiceModel.description = req.body.description;
    newServiceModel.price = req.body.price;
    newServiceModel.priceUnit = req.body.priceUnit;
    newServiceModel.address = req.body.address;
    newServiceModel.lat = req.body.lat;
    newServiceModel.lng = req.body.lng;
    newServiceModel.countryCode = req.body.countryCode;
    newServiceModel.viewCount = 0;
    newServiceModel.itemCategory = req.body.itemCategory;
    newServiceModel.itemDetailInfo = req.body.itemDetailInfo;
    await newServiceModel.save();

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
    const serviceObj = await Service.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!serviceObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    serviceObj.viewCount = serviceObj.viewCount + 1;
    await serviceObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: serviceObj,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

export const getCountForEachCategory = async (req: Request, res: Response) => {
  try {
    let countList: any = [];
    const serviceModel = await Service.find();
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = serviceModel?.length;
      else
        count = serviceModel.filter((obj) => obj.itemCategory == item)?.length;
      countList.push({ itemCategory: item, count });
    });
    return res.json({
      success: true,
      countList,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

export const getMoreServiceAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);

    let nextServiceAds = await Service.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextServiceAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more service ads",
    });
  }
};
