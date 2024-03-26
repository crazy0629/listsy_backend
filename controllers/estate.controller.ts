import { Request, Response } from "express";
import Estate from "../models/Estate";
import mongoose from "mongoose";
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

export const loadEstateInfo = async (req: Request, res: Response) => {
  try {
    const estateModel = await Estate.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (estateModel.length) {
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

    const newEstate = new Estate();
    newEstate.adId = req.body.adId;
    newEstate.userId = req.body.userId;
    newEstate.title = req.body.title;
    newEstate.subTitle = req.body.subTitle;
    newEstate.description = req.body.description;
    newEstate.price = req.body.price;
    newEstate.priceUnit = req.body.priceUnit;
    newEstate.address = req.body.address;
    newEstate.lat = req.body.lat;
    newEstate.lng = req.body.lng;
    newEstate.countryCode = req.body.countryCode;
    newEstate.viewCount = 0;
    newEstate.itemCategory = req.body.itemCategory;
    newEstate.itemDetailInfo = req.body.itemDetailInfo;
    await newEstate.save();

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
    const estateObj = await Estate.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!estateObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    estateObj.viewCount = estateObj.viewCount + 1;
    await estateObj.save();

    const emotCount = await getEmotCount(req.body.adId);

    return res.json({
      success: true,
      message: "Success",
      data: estateObj,
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

export const getMoreEstateAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextEstateAds = await Estate.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextEstateAds = locationFilterDistanceAds(req.body, nextEstateAds);
    nextEstateAds = priceFilterAds(req.body, nextEstateAds);
    nextEstateAds = sellerRatingFilterAds(req.body, nextEstateAds);

    if (req.body.type && req.body.type?.length) {
      nextEstateAds = nextEstateAds.filter(
        (item: any) => req.body.type.indexOf(item.itemDetailInfo.type) !== -1
      );
    }
    if (req.body.bedrooms && req.body.bedrooms?.length) {
      nextEstateAds = nextEstateAds.filter(
        (item: any) =>
          req.body.bedrooms.indexOf(item.itemDetailInfo.bedrooms) !== -1
      );
    }
    if (req.body.bathrooms && req.body.bathrooms?.length) {
      nextEstateAds = nextEstateAds.filter(
        (item: any) =>
          req.body.bathrooms.indexOf(item.itemDetailInfo.bathrooms) !== -1
      );
    }
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextEstateAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more estate ads",
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
    const estateModel = await Estate.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = estateModel?.length;
      else
        count = estateModel.filter((obj) => obj.itemCategory == item)?.length;
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
      const estateModelPerCountry = await Estate.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      estateModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkPropertyTypeMatches(req.body.filter, obj) &&
            checkBedroomsMatches(req.body.filter, obj) &&
            checkBathroomsMatches(req.body.filter, obj)
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
    let estateObj = await Estate.find(condition).populate(
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
      estateObj = estateObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, estateObj);
    let itemSellerRatingCountList = [];
    let itemPropertyTypeCountList = [];
    let itemBedroomsCountList = [];
    let itemBathroomsCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        estateObj
      );
    }

    if (req.body.itemType) {
      itemPropertyTypeCountList = await getCountOnPropertyType(
        req.body,
        estateObj
      );
    }

    if (req.body.itemBedrooms) {
      itemBedroomsCountList = await getCountOnBedrooms(req.body, estateObj);
    }

    if (req.body.itemBathrooms) {
      itemBathroomsCountList = await getCountOnBathrooms(req.body, estateObj);
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemPropertyType: itemPropertyTypeCountList,
      itemBedrooms: itemBedroomsCountList,
      itemBathrooms: itemBathroomsCountList,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

const getCountOnMinMaxPrice = async (mainParam, estateObj) => {
  let countPerPrice = -1;
  countPerPrice = estateObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkPropertyTypeMatches(mainParam.filter, obj) &&
      checkBedroomsMatches(mainParam.filter, obj) &&
      checkBathroomsMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, estateObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = estateObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });
  return itemSellerRatingCountList;
};

const getCountOnPropertyType = async (mainParam, estateObj) => {
  let itemPropertyTypeCountList: any = [];
  mainParam?.itemType.map((item: string, index: number) => {
    let count = 0;
    count = estateObj.filter((obj) => {
      const isMatchingPropertyType = (obj as any)?.itemDetailInfo?.type == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingPropertyType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemPropertyTypeCountList.push({
      itemPropertyType: item,
      count,
    });
  });
  return itemPropertyTypeCountList;
};

const getCountOnBedrooms = async (mainParam, estateObj) => {
  let itemBedroomsCountList: any = [];
  mainParam?.itemBedrooms.map((item: string, index: number) => {
    let count = 0;
    count = estateObj.filter((obj) => {
      const isMatchingBedrooms = (obj as any)?.itemDetailInfo?.bedrooms == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingBedrooms &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemBedroomsCountList.push({
      itemBedrooms: item,
      count,
    });
  });
  return itemBedroomsCountList;
};

const getCountOnBathrooms = async (mainParam, estateObj) => {
  let itemBathroomsCountList: any = [];
  mainParam?.itemBathrooms.map((item: string, index: number) => {
    let count = 0;
    count = estateObj.filter((obj) => {
      const isMatchingBathrooms =
        (obj as any)?.itemDetailInfo?.bathrooms == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingBathrooms &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemBathroomsCountList.push({
      itemBathrooms: item,
      count,
    });
  });
  return itemBathroomsCountList;
};

export const checkPropertyTypeMatches = (filter, obj) => {
  const selectedPropertyTypeCondition = filter.type?.length > 0;
  const propertyTypeMatches = selectedPropertyTypeCondition
    ? filter.type.includes((obj as any)?.itemDetailInfo?.type)
    : true;
  return propertyTypeMatches;
};

export const checkBedroomsMatches = (filter, obj) => {
  const selectedBedroomsCondition = filter.bedrooms?.length > 0;
  const bedroomsMatches = selectedBedroomsCondition
    ? filter.bedrooms.includes((obj as any)?.itemDetailInfo?.bedrooms)
    : true;
  return bedroomsMatches;
};

export const checkBathroomsMatches = (filter, obj) => {
  const selectedBathroomsCondition = filter.bathrooms?.length > 0;
  const bathroomsMatches = selectedBathroomsCondition
    ? filter.bathrooms.includes((obj as any)?.itemDetailInfo?.bathrooms)
    : true;
  return bathroomsMatches;
};
