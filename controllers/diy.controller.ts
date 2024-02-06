import { Request, Response } from "express";
import Diy from "../models/Diy";
import mongoose from "mongoose";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  calculateDistance,
  checkItemConditionMatches,
  checkPriceMatches,
  checkSellerRatingMatches,
  generateToken,
} from "../service/helper";

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

    if (
      req.body.centerLocationSelected == true &&
      req.body.SearchWithin != "" &&
      req.body.SearchWithin != "Nationwide"
    ) {
      let distance = 0;
      if (req.body.SearchWithin != "Current location")
        distance = parseInt(req.body.SearchWithin.match(/\d+/)[0]);
      nextDiyAds = nextDiyAds.filter((item) => {
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
    if (req.body.sellerRating && req.body.sellerRating?.length) {
      nextDiyAds = nextDiyAds.filter(
        (item: any) =>
          req.body.sellerRating.indexOf(
            Math.floor(item.userId.reviewMark).toString() + "*"
          ) !== -1
      );
    }
    if (req.body.itemCondition && req.body.itemCondition?.length) {
      nextDiyAds = nextDiyAds.filter(
        (item: any) =>
          req.body.itemCondition.indexOf(item.itemDetailInfo.itemCondition) !==
          -1
      );
    }
    if (req.body.sellerType && req.body.sellerType?.length) {
      nextDiyAds = nextDiyAds.filter(
        (item: any) =>
          req.body.sellerType.indexOf(item.itemDetailInfo.sellerType) !== -1
      );
    }
    if (req.body.itemAge && req.body.itemAge?.length) {
      nextDiyAds = nextDiyAds.filter(
        (item: any) =>
          req.body.itemAge.indexOf(item.itemDetailInfo.itemAge) !== -1
      );
    }
    if (req.body.minPrice && req.body.minPrice != "") {
      nextDiyAds = nextDiyAds.filter(
        (item: any) => Number(req.body.minPrice) <= item.price
      );
    }
    if (req.body.maxPrice && req.body.maxPrice != "") {
      nextDiyAds = nextDiyAds.filter(
        (item: any) => Number(req.body.maxPrice) >= item.price
      );
    }
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextDiyAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more diy_craft ads",
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

export const getCountOfEachFilter = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    let condition1: any = {};
    if (
      req.body.centerLocationAvailable == true &&
      req.body.filter.SearchWithin != ""
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

    let itemSearchRangeCountList: any = [];
    let distanceList: any = [];
    if (req.body.centerLocationAvailable == true) {
      condition1.countryCode = req.body.selectedLocation.countryCode;
      condition1.itemCategory = req.body.itemCategory;
      const foodModelPerCountry = await Diy.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      foodModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkItemConditionMatches(req.body.filter, obj) &&
            checkItemAgeMatches(req.body.filter, obj) &&
            checkSellerTypeMatches(req.body.filter, obj)
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

    let diyObj = await Diy.find(condition).populate(
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
      diyObj = diyObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, diyObj);
    let itemSellerRatingCountList = [];
    let itemConditionCountList = [];
    let itemAgeCountList = [];
    let itemSellerTypeCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        diyObj
      );
    }

    if (req.body.itemCondition) {
      itemConditionCountList = await getCountOnItemCondition(req.body, diyObj);
    }
    if (req.body.itemAge) {
      itemAgeCountList = await getCountOnItemAge(req.body, diyObj);
    }
    if (req.body.itemSellerType) {
      itemSellerTypeCountList = await getCountOnItemSellerType(
        req.body,
        diyObj
      );
    }

    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemCondition: itemConditionCountList,
      itemAge: itemAgeCountList,
      itemSellerType: itemSellerTypeCountList,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error!",
    });
  }
};

const checkItemAgeMatches = (filter, obj) => {
  const selectedItemAgeCondition = filter.itemAge?.length > 0;
  const itemAgeMatches = selectedItemAgeCondition
    ? filter.itemAge.includes((obj as any)?.itemDetailInfo?.itemAge)
    : true;
  return itemAgeMatches;
};

const checkSellerTypeMatches = (filter, obj) => {
  const selectedSellerTypeCondition = filter.sellerType?.length > 0;
  const sellerTypeMatches = selectedSellerTypeCondition
    ? filter.sellerType.includes((obj as any)?.itemDetailInfo?.sellerType)
    : true;
  return sellerTypeMatches;
};

const getCountOnMinMaxPrice = async (mainParam, saleObj) => {
  let countPerPrice = -1;
  countPerPrice = saleObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkItemConditionMatches(mainParam.filter, obj) &&
      checkItemAgeMatches(mainParam.filter, obj) &&
      checkSellerTypeMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, diyObj) => {
  let itemSellerRatingCountList: any = [];
  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = diyObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkItemAgeMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });
  return itemSellerRatingCountList;
};

const getCountOnItemCondition = async (mainParam, diyObj) => {
  let itemConditionCountList: any = [];
  mainParam?.itemCondition.map((item: string, index: number) => {
    let count = 0;
    count = diyObj.filter((obj) => {
      const isMatchingItemCondition =
        (obj as any)?.itemDetailInfo?.itemCondition == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingItemCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemAgeMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemConditionCountList.push({
      itemCondition: item,
      count,
    });
  });
  return itemConditionCountList;
};

const getCountOnItemAge = async (mainParam, diyObj) => {
  let itemAgeCountList: any = [];
  mainParam?.itemAge.map((item: string, index: number) => {
    let count = 0;
    count = diyObj.filter((obj) => {
      const isMatchingItemAge = (obj as any)?.itemDetailInfo?.itemAge == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingItemAge &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemAgeCountList.push({
      itemAge: item,
      count,
    });
  });
  return itemAgeCountList;
};

const getCountOnItemSellerType = async (mainParam, diyObj) => {
  let itemSellerTypeCountList: any = [];

  mainParam?.itemSellerType.map((item: string, index: number) => {
    let count = 0;
    count = diyObj.filter((obj) => {
      const isMatchingSellerType =
        (obj as any)?.itemDetailInfo?.sellerType == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSellerType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkItemAgeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSellerTypeCountList.push({
      itemSellerType: item,
      count,
    });
  });
  return itemSellerTypeCountList;
};
