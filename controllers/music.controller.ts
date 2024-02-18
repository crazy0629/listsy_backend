import { Request, Response } from "express";
import mongoose from "mongoose";
import Music from "../models/Music";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  calculateDistance,
  checkPriceMatches,
  generateToken,
  getConditionToCountry,
} from "../service/helper";

export const loadMusicInfo = async (req: Request, res: Response) => {
  try {
    const musicModel = await Music.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (musicModel.length) {
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

    const newMusic = new Music();
    newMusic.adId = req.body.adId;
    newMusic.userId = req.body.userId;
    newMusic.title = req.body.title;
    newMusic.subTitle = req.body.subTitle;
    newMusic.description = req.body.description;
    newMusic.price = req.body.price;
    newMusic.priceUnit = req.body.priceUnit;
    newMusic.address = req.body.address;
    newMusic.lat = req.body.lat;
    newMusic.lng = req.body.lng;
    newMusic.countryCode = req.body.countryCode;
    newMusic.viewCount = 0;
    newMusic.itemCategory = req.body.itemCategory;
    newMusic.itemDetailInfo = req.body.itemDetailInfo;
    await newMusic.save();

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
    const musicObj = await Music.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!musicObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    musicObj.viewCount = musicObj.viewCount + 1;
    await musicObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: musicObj,
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
    const music = await Music.find();
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = music?.length;
      else count = music.filter((obj) => obj.itemCategory == item)?.length;
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

export const getSubCountForEachCategory = async (
  req: Request,
  res: Response
) => {
  try {
    let countList: any = [];
    const musicObj: any = await Music.find({
      itemCategory: req.body.itemCategory,
    });
    req.body.itemSubCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = musicObj?.length;
      count = musicObj.filter(
        (obj) => obj.itemDetailInfo?.itemSubCategory == item
      )?.length;
      countList.push({ itemSubCategory: item, count });
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

export const getMoreMusicAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextMusicAds = await Music.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextMusicAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more food ads",
    });
  }
};

export const getCountOfEachFilter = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    let condition1: any = {};

    if (req.body.itemCategory != "All" && req.body.itemCategory != "") {
      condition.itemCategory = req.body.itemCategory;
    }
    if (req.body.itemSubCategory != "All" && req.body.itemSubCategory != "") {
      condition.itemDetailInfo.itemSubCategory = req.body.itemSubCategory;
    }
    let itemSearchRangeCountList: any = [];
    let distanceList: any = [];
    if (req.body.centerLocationAvailable == true) {
      condition1.countryCode = req.body.selectedLocation.countryCode;
      condition1.itemCategory = req.body.itemCategory;
      condition1.itemDetailInfo.itemSubCategory = req.body.itemSubCategory;
      const musicModelPerCountry = await Music.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      musicModelPerCountry
        .filter((obj) => {
          return checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj);
        })
        .map((item: any, index: number) => {
          distanceList.push(
            calculateDistance(
              item.lat,
              item.lng,
              req.body.selectedLocation.lat,
              req.body.selectedLocation.lng
            )
          );
        });
      req.body.itemSearchRange.map((item: number, index: number) => {
        if (item == -1) {
          itemSearchRangeCountList.push({
            range: -1,
            distance: distanceList?.length,
          });
        } else {
          itemSearchRangeCountList.push({
            range: item,
            distance: distanceList.filter((dis) => dis <= item)?.length,
          });
        }
      });
    }
    let musicObj = await Music.find(condition).populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark"
    );
    if (
      req.body.centerLocationAvailable == true &&
      req.body.filter.SearchWithin != "" &&
      req.body.filter.SearchWithin != "Nationwide"
    ) {
      let distance = 0;
      if (req.body.filter.SearchWithin != "Current location")
        distance = parseInt(req.body.filter.SearchWithin.match(/\d+/)[0]);
      musicObj = musicObj.filter((item) => {
        return (
          calculateDistance(
            item.lat,
            item.lng,
            req.body.selectedLocation.lat,
            req.body.selectedLocation.lng
          ) <= distance
        );
      });
    }
    let countPerPrice = await getCountOnMinMaxPrice(req.body, musicObj);
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

const getCountOnMinMaxPrice = async (mainParam, foodObj) => {
  let countPerPrice = -1;
  countPerPrice = foodObj.filter((obj) => {
    return checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj);
  })?.length;
  return countPerPrice;
};
