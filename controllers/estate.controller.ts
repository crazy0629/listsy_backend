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
    if (req.body.tenure && req.body.tenure?.length) {
      let index = req.body.tenure.indexOf("Not Specified");
      req.body.tenure[index] = "";
      nextEstateAds = nextEstateAds.filter(
        (item: any) =>
          req.body.tenure.indexOf(item.itemDetailInfo.tenure) !== -1
      );
    }
    if (req.body.condition && req.body.condition?.length) {
      let index = req.body.condition.indexOf("Not Specified");
      req.body.condition[index] = "";
      nextEstateAds = nextEstateAds.filter(
        (item: any) =>
          req.body.condition.indexOf(item.itemDetailInfo.condition) !== -1
      );
    }
    if (req.body.year && req.body.year?.length) {
      let index = req.body.year.indexOf("Not Specified");
      req.body.year[index] = "";
      nextEstateAds = nextEstateAds.filter(
        (item: any) => req.body.year.indexOf(item.itemDetailInfo.year) !== -1
      );
    }
    if (req.body.energy && req.body.energy?.length) {
      let index = req.body.energy.indexOf("Not Specified");
      req.body.energy[index] = "";
      nextEstateAds = nextEstateAds.filter(
        (item: any) =>
          req.body.energy.indexOf(item.itemDetailInfo.energy) !== -1
      );
    }
    if (req.body.nearest && req.body.nearest?.length) {
      let index = req.body.nearest.indexOf("Not Specified");
      req.body.nearest[index] = "";
      nextEstateAds = nextEstateAds.filter(
        (item: any) =>
          req.body.nearest.indexOf(item.itemDetailInfo.nearest) !== -1
      );
    }
    if (req.body.facilities && req.body.facilities?.length) {
      let index = req.body.facilities.indexOf("Not Specified");
      req.body.facilities[index] = "";
      nextEstateAds = nextEstateAds.filter(
        (item: any) =>
          req.body.facilities.indexOf(item.itemDetailInfo.facilities) !== -1
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
            checkBathroomsMatches(req.body.filter, obj) &&
            checkTenureMatches(req.body.filter, obj) &&
            checkPropertyConditionMatches(req.body.filter, obj) &&
            checkYearMatches(req.body.filter, obj) &&
            checkEnergyMatches(req.body.filter, obj) &&
            checkNearestMatches(req.body.filter, obj) &&
            checkFacilitiesMatches(req.body.filter, obj)
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
    let itemTenureCountList = [];
    let itemPropertyConditionCountList = [];
    let itemYearCountList = [];
    let itemEnegryCountList = [];
    let itemNearestCountList = [];
    let itemFacilitiesCountList = [];

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

    if (req.body.itemTenure) {
      itemTenureCountList = await getCountOnTenure(req.body, estateObj);
    }

    if (req.body.itemPropertyCondition) {
      itemPropertyConditionCountList = await getCountOnPropertyCondition(
        req.body,
        estateObj
      );
    }

    if (req.body.itemYear) {
      itemYearCountList = await getCountOnYear(req.body, estateObj);
    }

    if (req.body.itemEnergy) {
      itemEnegryCountList = await getCountOnEnergy(req.body, estateObj);
    }

    if (req.body.itemNearest) {
      itemNearestCountList = await getCountOnNearest(req.body, estateObj);
    }

    if (req.body.itemFacilities) {
      itemFacilitiesCountList = await getCountOnFacilities(req.body, estateObj);
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemPropertyType: itemPropertyTypeCountList,
      itemBedrooms: itemBedroomsCountList,
      itemBathrooms: itemBathroomsCountList,
      itemTenure: itemTenureCountList,
      itemPropertyCondition: itemPropertyConditionCountList,
      itemYear: itemYearCountList,
      itemEnergy: itemEnegryCountList,
      itemNearest: itemNearestCountList,
      itemFacilities: itemFacilitiesCountList,
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
      checkBathroomsMatches(mainParam.filter, obj) &&
      checkTenureMatches(mainParam.filter, obj) &&
      checkPropertyConditionMatches(mainParam.filter, obj) &&
      checkYearMatches(mainParam.filter, obj) &&
      checkEnergyMatches(mainParam.filter, obj) &&
      checkNearestMatches(mainParam.filter, obj) &&
      checkFacilitiesMatches(mainParam.filter, obj)
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
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
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
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
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
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
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
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
      );
    })?.length;
    itemBathroomsCountList.push({
      itemBathrooms: item,
      count,
    });
  });
  return itemBathroomsCountList;
};

const getCountOnTenure = async (mainParam, estateObj) => {
  let itemTenureCountList: any = [];
  mainParam?.itemTenure.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = estateObj.filter((obj) => {
      const isMatchingTenure = (obj as any)?.itemDetailInfo?.tenure == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingTenure &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
      );
    })?.length;
    itemTenureCountList.push({
      itemTenure: item,
      count,
    });
  });
  return itemTenureCountList;
};

const getCountOnPropertyCondition = async (mainParam, estateObj) => {
  let itemPropertyConditionCountList: any = [];
  mainParam?.itemPropertyCondition.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = estateObj.filter((obj) => {
      const isMatchingPropertyCondition =
        (obj as any)?.itemDetailInfo?.condition == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingPropertyCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
      );
    })?.length;
    itemPropertyConditionCountList.push({
      itemPropertyCondition: item,
      count,
    });
  });
  return itemPropertyConditionCountList;
};

const getCountOnYear = async (mainParam, estateObj) => {
  let itemYearCountList: any = [];
  mainParam?.itemYear.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = estateObj.filter((obj) => {
      const isMatchingYear = (obj as any)?.itemDetailInfo?.year == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingYear &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
      );
    })?.length;
    itemYearCountList.push({
      itemYear: item,
      count,
    });
  });
  return itemYearCountList;
};

const getCountOnEnergy = async (mainParam, estateObj) => {
  let itemEnergyCountList: any = [];
  mainParam?.itemEnergy.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = estateObj.filter((obj) => {
      const isMatchingEnergy = (obj as any)?.itemDetailInfo?.energy == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingEnergy &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
      );
    })?.length;
    itemEnergyCountList.push({
      itemEnergy: item,
      count,
    });
  });
  return itemEnergyCountList;
};

const getCountOnNearest = async (mainParam, estateObj) => {
  let itemNearestCountList: any = [];
  mainParam?.itemNearest.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = estateObj.filter((obj) => {
      const isMatchingNearest = (obj as any)?.itemDetailInfo?.nearest == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingNearest &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkFacilitiesMatches(mainParam.filter, obj)
      );
    })?.length;
    itemNearestCountList.push({
      itemNearest: item,
      count,
    });
  });
  return itemNearestCountList;
};

const getCountOnFacilities = async (mainParam, estateObj) => {
  let itemFacilitiesCountList: any = [];
  mainParam?.itemFacilities.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = estateObj.filter((obj) => {
      const isMatchingFacilities =
        (obj as any)?.itemDetailInfo?.facilities == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingFacilities &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkPropertyTypeMatches(mainParam.filter, obj) &&
        checkBedroomsMatches(mainParam.filter, obj) &&
        checkBathroomsMatches(mainParam.filter, obj) &&
        checkTenureMatches(mainParam.filter, obj) &&
        checkPropertyConditionMatches(mainParam.filter, obj) &&
        checkYearMatches(mainParam.filter, obj) &&
        checkEnergyMatches(mainParam.filter, obj) &&
        checkNearestMatches(mainParam.filter, obj)
      );
    })?.length;
    itemFacilitiesCountList.push({
      itemFacilities: item,
      count,
    });
  });
  return itemFacilitiesCountList;
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

export const checkTenureMatches = (filter, obj) => {
  const selectedTenureCondition = filter.tenure?.length > 0;
  let index = filter.tenure.indexOf("Not Specified");
  if (index > -1) {
    filter.tenure[index] = "";
  }
  const tenureMatches = selectedTenureCondition
    ? filter.tenure.includes((obj as any)?.itemDetailInfo?.tenure)
    : true;
  return tenureMatches;
};

export const checkPropertyConditionMatches = (filter, obj) => {
  const selectedPropertyConditionCondition = filter.condition?.length > 0;
  let index = filter.condition.indexOf("Not Specified");
  if (index > -1) {
    filter.condition[index] = "";
  }
  const propertyConditionMatches = selectedPropertyConditionCondition
    ? filter.condition.includes((obj as any)?.itemDetailInfo?.condition)
    : true;
  return propertyConditionMatches;
};

export const checkYearMatches = (filter, obj) => {
  const selectedYearCondition = filter.year?.length > 0;
  let index = filter.year.indexOf("Not Specified");
  if (index > -1) {
    filter.year[index] = "";
  }
  const yearMatches = selectedYearCondition
    ? filter.year.includes((obj as any)?.itemDetailInfo?.year)
    : true;
  return yearMatches;
};

export const checkEnergyMatches = (filter, obj) => {
  const selectedEnergyCondition = filter.energy?.length > 0;
  let index = filter.energy.indexOf("Not Specified");
  if (index > -1) {
    filter.energy[index] = "";
  }
  const energyMatches = selectedEnergyCondition
    ? filter.energy.includes((obj as any)?.itemDetailInfo?.energy)
    : true;
  return energyMatches;
};

export const checkNearestMatches = (filter, obj) => {
  const selectedNearestCondition = filter.nearest?.length > 0;
  let index = filter.nearest.indexOf("Not Specified");
  if (index > -1) {
    filter.nearest[index] = "";
  }
  const nearestMatches = selectedNearestCondition
    ? filter.nearest.includes((obj as any)?.itemDetailInfo?.nearest)
    : true;
  return nearestMatches;
};

export const checkFacilitiesMatches = (filter, obj) => {
  const selectedFacilitiesCondition = filter.facilities?.length > 0;
  let index = filter.facilities.indexOf("Not Specified");
  if (index > -1) {
    filter.facilities[index] = "";
  }
  const facilitiesMatches = selectedFacilitiesCondition
    ? filter.facilities.includes((obj as any)?.itemDetailInfo?.facilities)
    : true;
  return facilitiesMatches;
};
