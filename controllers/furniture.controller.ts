import { Request, Response } from "express";
import mongoose from "mongoose";
import Furniture from "../models/Furniture";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  calculateDistance,
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

export const getAdDetailInfo = async (req: Request, res: Response) => {
  try {
    const furnitureObj = await Furniture.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!furnitureObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    furnitureObj.viewCount = furnitureObj.viewCount + 1;
    await furnitureObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: furnitureObj,
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
    let condition: any = {};
    if (req.body.countryCode != null) {
      condition.countryCode = req.body.countryCode;
    }

    let countList: any = [];
    const furnitureObj = await Furniture.find();
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = furnitureObj?.length;
      else
        count = furnitureObj.filter((obj) => obj.itemCategory == item)?.length;
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

export const getMoreFurnitureAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextFurnitureAds = await Furniture.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextFurnitureAds = locationFilterDistanceAds(req.body, nextFurnitureAds);
    nextFurnitureAds = priceFilterAds(req.body, nextFurnitureAds);
    nextFurnitureAds = sellerRatingFilterAds(req.body, nextFurnitureAds);
    nextFurnitureAds = itemConditionFilterAds(req.body, nextFurnitureAds);
    nextFurnitureAds = sellerTypeFilterAds(req.body, nextFurnitureAds);

    if (req.body.furnitureType && req.body.furnitureType?.length) {
      nextFurnitureAds = nextFurnitureAds.filter(
        (item: any) =>
          req.body.furnitureType.indexOf(
            item.itemDetailInfo.itemSubCategory
          ) !== -1
      );
    }

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextFurnitureAds,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found while loading more furniture ads!",
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
      const musicModelPerCountry = await Furniture.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      musicModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkFurnitureTypeMatches(req.body.filter, obj) &&
            checkItemConditionMatches(req.body.filter, obj) &&
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
    let furnitureObj = await Furniture.find(condition).populate(
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
      furnitureObj = furnitureObj.filter((item) => {
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

    let countPerPrice = await getCountOnMinMaxPrice(req.body, furnitureObj);
    let itemSellerRatingCountList = [];
    let itemFurnitureTypeCountList = [];
    let itemConditionCountList = [];
    let itemSellerTypeCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        furnitureObj
      );
    }

    if (req.body.itemFurnitureType) {
      itemFurnitureTypeCountList = await getCountOnFurnitureType(
        req.body,
        furnitureObj
      );
    }

    if (req.body.itemCondition) {
      itemConditionCountList = await getCountOnCondition(
        req.body,
        furnitureObj
      );
    }

    if (req.body.itemSellerType) {
      itemSellerTypeCountList = await getCountOnSellerType(
        req.body,
        furnitureObj
      );
    }

    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemFurnitureType: itemFurnitureTypeCountList,
      itemCondition: itemConditionCountList,
      itemSellerType: itemSellerTypeCountList,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

const checkFurnitureTypeMatches = (filter, obj) => {
  const selectedFurnitureTypeCondition = filter.furnitureType?.length > 0;
  const furnitureTypeMatches = selectedFurnitureTypeCondition
    ? filter.furnitureType.includes(
        (obj as any)?.itemDetailInfo?.itemSubCategory
      )
    : true;
  return furnitureTypeMatches;
};

const getCountOnMinMaxPrice = async (mainParam, furnitureObj) => {
  let countPerPrice = -1;
  countPerPrice = furnitureObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkFurnitureTypeMatches(mainParam.filter, obj) &&
      checkItemConditionMatches(mainParam.filter, obj) &&
      checkSellerTypeMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, furnitureObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = furnitureObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkFurnitureTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });

  return itemSellerRatingCountList;
};

const getCountOnFurnitureType = async (mainParam, furnitureObj) => {
  let itemFurnitureTypeCountList: any = [];

  mainParam?.itemFurnitureType.map((item: string, index: number) => {
    let count = 0;

    count = furnitureObj.filter((obj) => {
      const isMatchingFurnitureType =
        (obj as any)?.itemDetailInfo?.itemSubCategory == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingFurnitureType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemFurnitureTypeCountList.push({
      itemFurnitureType: item,
      count,
    });
  });
  return itemFurnitureTypeCountList;
};

const getCountOnCondition = async (mainParam, furnitureObj) => {
  let itemConditionCountList: any = [];

  mainParam?.itemCondition.map((item: string, index: number) => {
    let count = 0;

    count = furnitureObj.filter((obj) => {
      const isMatchingCondition =
        (obj as any)?.itemDetailInfo?.itemCondition == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkFurnitureTypeMatches(mainParam.filter, obj) &&
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

const getCountOnSellerType = async (mainParam, furniture) => {
  let itemSellerTypeCountList: any = [];
  mainParam?.itemSellerType.map((item: string, index: number) => {
    let count = 0;
    count = furniture.filter((obj) => {
      const isMatchingSellerType =
        (obj as any)?.itemDetailInfo?.sellerType == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSellerType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkFurnitureTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSellerTypeCountList.push({
      itemSellerType: item,
      count,
    });
  });
  return itemSellerTypeCountList;
};
