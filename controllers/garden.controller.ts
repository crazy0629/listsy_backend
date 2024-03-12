import { Request, Response } from "express";
import mongoose from "mongoose";
import Garden from "../models/Garden";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  brandFilterAds,
  calculateDistance,
  checkBrandMatches,
  checkItemConditionMatches,
  checkPriceMatches,
  checkSellerRatingMatches,
  checkSellerTypeMatches,
  generateToken,
  getConditionToCountry,
  itemConditionFilterAds,
  locationFilterDistanceAds,
  priceFilterAds,
  sellerRatingFilterAds,
  sellerTypeFilterAds,
} from "../service/helper";
import { getEmotCount } from "./userEmot.controller";

/**
 * This function is called when users upload items for homes and garden ads.
 * This loads detail items for home and garden ad info and saves on db.
 *
 * @param req
 * @param res
 */
export const loadGardenInfo = async (req: Request, res: Response) => {
  try {
    const gardenModel = await Garden.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (gardenModel.length) {
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

    const newGarden = new Garden();
    newGarden.adId = req.body.adId;
    newGarden.userId = req.body.userId;
    newGarden.title = req.body.title;
    newGarden.subTitle = req.body.subTitle;
    newGarden.description = req.body.description;
    newGarden.price = req.body.price;
    newGarden.priceUnit = req.body.priceUnit;
    newGarden.address = req.body.address;
    newGarden.lat = req.body.lat;
    newGarden.lng = req.body.lng;
    newGarden.countryCode = req.body.countryCode;
    newGarden.viewCount = 0;
    newGarden.itemCategory = req.body.itemCategory;
    newGarden.itemDetailInfo = req.body.itemDetailInfo;
    await newGarden.save();

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

/**
 * This function is called to return Garden ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreGardenAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextGardenAds = await Garden.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextGardenAds = locationFilterDistanceAds(req.body, nextGardenAds);
    nextGardenAds = sellerRatingFilterAds(req.body, nextGardenAds);
    nextGardenAds = priceFilterAds(req.body, nextGardenAds);
    nextGardenAds = itemConditionFilterAds(req.body, nextGardenAds);
    nextGardenAds = sellerTypeFilterAds(req.body, nextGardenAds);
    nextGardenAds = brandFilterAds(req.body, nextGardenAds);

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextGardenAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more garden ads",
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
    const gardenModel = await Garden.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = gardenModel?.length;
      else
        count = gardenModel.filter((obj) => obj.itemCategory == item)?.length;
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

/**
 * This function is called when users press each ad category.
 * And this returns detail object information.
 *
 * @param req
 * @param res
 * @returns
 */

export const getAdDetailInfo = async (req: Request, res: Response) => {
  try {
    const gardenObj = await Garden.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!gardenObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    gardenObj.viewCount = gardenObj.viewCount + 1;
    await gardenObj.save();

    const emotCount = await getEmotCount(req.body.adId);

    return res.json({
      success: true,
      message: "Success",
      data: gardenObj,
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
      const gardenModelPerCountry = await Garden.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      gardenModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkItemConditionMatches(req.body.filter, obj) &&
            checkSellerTypeMatches(req.body.filter, obj) &&
            checkBrandMatches(req.body.filter, obj)
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

    let gardenObj = await Garden.find(condition).populate(
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
      gardenObj = gardenObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, gardenObj);
    let itemSellerRatingCountList = [];
    let itemConditionCountList = [];
    let itemSellerTypeCountList = [];
    let itemBrandCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        gardenObj
      );
    }
    if (req.body.itemCondition) {
      itemConditionCountList = await getCountOnItemCondition(
        req.body,
        gardenObj
      );
    }
    if (req.body.itemSellerType) {
      itemSellerTypeCountList = await getCountOnItemSellerType(
        req.body,
        gardenObj
      );
    }
    if (req.body.itemBrand) {
      itemBrandCountList = await getCountOnBrand(req.body, gardenObj);
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemCondition: itemConditionCountList,
      itemSellerType: itemSellerTypeCountList,
      itemBrand: itemBrandCountList,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

const getCountOnMinMaxPrice = async (mainParam, gardenObj) => {
  let countPerPrice = -1;
  countPerPrice = gardenObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkItemConditionMatches(mainParam.filter, obj) &&
      checkSellerTypeMatches(mainParam.filter, obj) &&
      checkBrandMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, gardenObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = gardenObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });

  return itemSellerRatingCountList;
};

const getCountOnItemCondition = async (mainParam, gardenObj) => {
  let itemConditionCountList: any = [];
  mainParam?.itemCondition.map((item: string, index: number) => {
    let count = 0;
    count = gardenObj.filter((obj) => {
      const isMatchingItemCondition =
        (obj as any)?.itemDetailInfo?.itemCondition == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingItemCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj)
      );
    })?.length;
    itemConditionCountList.push({
      itemCondition: item,
      count,
    });
  });
  return itemConditionCountList;
};

const getCountOnItemSellerType = async (mainParam, gardenObj) => {
  let itemSellerTypeCountList: any = [];

  mainParam?.itemSellerType.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = gardenObj.filter((obj) => {
      const isMatchingSellerType =
        (obj as any)?.itemDetailInfo?.sellerType == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSellerType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSellerTypeCountList.push({
      itemSellerType: item,
      count,
    });
  });
  return itemSellerTypeCountList;
};

const getCountOnBrand = async (mainParam, gardenObj) => {
  let itemBrandCountList: any = [];

  mainParam?.itemBrand.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = gardenObj.filter((obj) => {
      const isMatchingBrand = (obj as any)?.itemDetailInfo?.brand == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingBrand &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemBrandCountList.push({
      itemBrand: item,
      count,
    });
  });
  return itemBrandCountList;
};
