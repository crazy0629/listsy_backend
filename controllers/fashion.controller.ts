import { Request, Response } from "express";
import mongoose from "mongoose";
import Fashion from "../models/Fashion";
import Ad from "../models/Ad";
import User from "../models/User";
import { getEmotCount } from "./userEmot.controller";
import {
  calculateDistance,
  checkPriceMatches,
  checkSellerRatingMatches,
  generateToken,
  getConditionToCountry,
  locationFilterDistanceAds,
  priceFilterAds,
  sellerRatingFilterAds,
} from "../service/helper";

export const loadFashionInfo = async (req: Request, res: Response) => {
  try {
    const fashionModel = await Fashion.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (fashionModel.length) {
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

    const newFashion = new Fashion();
    newFashion.adId = req.body.adId;
    newFashion.userId = req.body.userId;
    newFashion.title = req.body.title;
    newFashion.subTitle = req.body.subTitle;
    newFashion.description = req.body.description;
    newFashion.price = req.body.price;
    newFashion.priceUnit = req.body.priceUnit;
    newFashion.address = req.body.address;
    newFashion.lat = req.body.lat;
    newFashion.lng = req.body.lng;
    newFashion.countryCode = req.body.countryCode;
    newFashion.viewCount = 0;
    newFashion.itemCategory = req.body.itemCategory;
    newFashion.itemDetailInfo = req.body.itemDetailInfo;
    await newFashion.save();

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
    const fashionObj = await Fashion.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!fashionObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    fashionObj.viewCount = fashionObj.viewCount + 1;
    await fashionObj.save();

    const emotCount = await getEmotCount(req.body.adId);

    return res.json({
      success: true,
      message: "Success",
      data: fashionObj,
      count: emotCount,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

export const getMoreFashionAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextFashionAds = await Fashion.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextFashionAds = locationFilterDistanceAds(req.body, nextFashionAds);
    nextFashionAds = sellerRatingFilterAds(req.body, nextFashionAds);
    nextFashionAds = priceFilterAds(req.body, nextFashionAds);

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextFashionAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more fashion ads",
    });
  }
};

export const getCountForEachCategory = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.countryCode != null) {
      condition.countryCode = req.body.countryCode;
    }

    let countList: any = [];
    const fashionModel = await Fashion.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = fashionModel?.length;
      else
        count = fashionModel.filter((obj) => obj.itemCategory == item)?.length;
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

export const getCountOfEachFilter = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    let condition1: any = {};

    condition.countryCode = req.body.countryCode;

    if (req.body.itemCategory != "All" && req.body.itemCategory != "") {
      condition.itemCategory = req.body.itemCategory;
    }

    let itemSearchRangeCountList: any = [];
    let distanceList: any = [];
    if (req.body.centerLocationAvailable == true) {
      condition1.countryCode = req.body.selectedLocation.countryCode;
      condition1.itemCategory = req.body.itemCategory;
      const fashionModelPerCountry = await Fashion.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      fashionModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkGenderMatches(req.body.filter, obj)
          );
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
    let fashionObj = await Fashion.find(condition).populate(
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
      fashionObj = fashionObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, fashionObj);
    let itemSellerRatingCountList = [];
    let itemGenderCountList = [];
    let itemConditionCountList = [];
    let itemColorCountList = [];
    let itemMaterialCountList = [];
    let itemSellerTypeCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        fashionObj
      );
    }

    if (req.body.itemGender) {
      itemGenderCountList = await getCountOnGender(req.body, fashionObj);
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemGender: itemGenderCountList,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

const getCountOnMinMaxPrice = async (mainParam, beautyObj) => {
  let countPerPrice = -1;
  countPerPrice = beautyObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkGenderMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, fashionObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = fashionObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkGenderMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });
  return itemSellerRatingCountList;
};

const getCountOnGender = async (mainParam, fashionObj) => {
  let itemGenderCountList: any = [];

  mainParam?.itemGender.map((item: string, index: number) => {
    let count = 0;

    count = fashionObj.filter((obj) => {
      const isMatchingGender = (obj as any)?.itemDetailInfo?.gender == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingGender &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj)
      );
    })?.length;
    itemGenderCountList.push({
      itemGender: item,
      count,
    });
  });
  return itemGenderCountList;
};

const checkGenderMatches = (filter, obj) => {
  const selectedGenderCondition = filter.gender?.length > 0;
  const genderMatches = selectedGenderCondition
    ? filter.gender.includes((obj as any)?.itemDetailInfo?.gender)
    : true;
  return genderMatches;
};
