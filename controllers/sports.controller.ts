import { Request, Response } from "express";
import mongoose from "mongoose";
import Sports from "../models/Sports";
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

export const loadSportsInfo = async (req: Request, res: Response) => {
  try {
    const sportsModel = await Sports.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (sportsModel.length) {
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

    const newSportsModel = new Sports();
    newSportsModel.adId = req.body.adId;
    newSportsModel.userId = req.body.userId;
    newSportsModel.title = req.body.title;
    newSportsModel.subTitle = req.body.subTitle;
    newSportsModel.description = req.body.description;
    newSportsModel.price = req.body.price;
    newSportsModel.priceUnit = req.body.priceUnit;
    newSportsModel.address = req.body.address;
    newSportsModel.lat = req.body.lat;
    newSportsModel.lng = req.body.lng;
    newSportsModel.countryCode = req.body.countryCode;
    newSportsModel.viewCount = 0;
    newSportsModel.itemCategory = req.body.itemCategory;
    newSportsModel.itemDetailInfo = req.body.itemDetailInfo;
    await newSportsModel.save();

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
    const sportsObj = await Sports.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!sportsObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    sportsObj.viewCount = sportsObj.viewCount + 1;
    await sportsObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: sportsObj,
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
    const sportsModel = await Sports.find();
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = sportsModel?.length;
      else
        count = sportsModel.filter((obj) => obj.itemCategory == item)?.length;
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

export const getMoreSportsAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);

    let nextSportsAds = await Sports.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextSportsAds = locationFilterDistanceAds(req.body, nextSportsAds);
    nextSportsAds = priceFilterAds(req.body, nextSportsAds);
    nextSportsAds = sellerRatingFilterAds(req.body, nextSportsAds);
    nextSportsAds = itemConditionFilterAds(req.body, nextSportsAds);
    nextSportsAds = sellerTypeFilterAds(req.body, nextSportsAds);

    if (req.body.equipmentType && req.body.equipmentType?.length) {
      nextSportsAds = nextSportsAds.filter(
        (item: any) =>
          req.body.equipmentType.indexOf(
            item.itemDetailInfo.itemSubCategory
          ) !== -1
      );
    }

    if (req.body.gender && req.body.gender?.length) {
      let index = req.body.gender.indexOf("Not Specified");
      req.body.gender[index] = "";
      nextSportsAds = nextSportsAds.filter(
        (item: any) =>
          req.body.gender.indexOf(item.itemDetailInfo.gender) !== -1
      );
    }

    if (req.body.brand && req.body.brand?.length) {
      let index = req.body.brand.indexOf("Not Specified");
      req.body.brand[index] = "";

      nextSportsAds = nextSportsAds.filter(
        (item: any) => req.body.brand.indexOf(item.itemDetailInfo.brand) !== -1
      );
    }

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextSportsAds,
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

    let itemSearchRangeCountList: any = [];
    let distanceList: any = [];
    if (req.body.centerLocationAvailable == true) {
      condition1.countryCode = req.body.selectedLocation.countryCode;
      condition1.itemCategory = req.body.itemCategory;
      const sportsModelPerCountry = await Sports.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      sportsModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkEquipmentTypeMatches(req.body.filter, obj) &&
            checkItemConditionMatches(req.body.filter, obj) &&
            checkBrandMatches(req.body.filter, obj) &&
            checkGenderMatches(req.body.filter, obj) &&
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
    let sportsModel = await Sports.find(condition).populate(
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
      sportsModel = sportsModel.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, sportsModel);
    let itemSellerRatingCountList = [];
    let itemEquipmentTypeCountList = [];
    let itemConditionCountList = [];
    let itemBrandCountList = [];
    let itemGenderCountList = [];
    let itemSellerTypeCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        sportsModel
      );
    }

    if (req.body.itemEquipmentType) {
      itemEquipmentTypeCountList = await getCountOnEquipmentType(
        req.body,
        sportsModel
      );
    }

    if (req.body.itemCondition) {
      itemConditionCountList = await getCountOnCondition(req.body, sportsModel);
    }

    if (req.body.itemBrand) {
      itemBrandCountList = await getCountOnBrand(req.body, sportsModel);
    }

    if (req.body.itemGender) {
      itemGenderCountList = await getCountOnGender(req.body, sportsModel);
    }

    if (req.body.itemSellerType) {
      itemSellerTypeCountList = await getCountOnSellerType(
        req.body,
        sportsModel
      );
    }

    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemEquipmentType: itemEquipmentTypeCountList,
      itemCondition: itemConditionCountList,
      itemBrand: itemBrandCountList,
      itemGender: itemGenderCountList,
      itemSellerType: itemSellerTypeCountList,
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
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkEquipmentTypeMatches(mainParam.filter, obj) &&
      checkItemConditionMatches(mainParam.filter, obj) &&
      checkBrandMatches(mainParam.filter, obj) &&
      checkGenderMatches(mainParam.filter, obj) &&
      checkSellerTypeMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, sportsObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = sportsObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkEquipmentTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });

  return itemSellerRatingCountList;
};

const getCountOnEquipmentType = async (mainParam, sportsObj) => {
  let itemEquipmentTypeCountList: any = [];

  mainParam?.itemEquipmentType.map((item: string, index: number) => {
    let count = 0;

    count = sportsObj.filter((obj) => {
      const isMatchingEquipmentType =
        (obj as any)?.itemDetailInfo?.itemSubCategory == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingEquipmentType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemEquipmentTypeCountList.push({
      itemEquipmentType: item,
      count,
    });
  });
  return itemEquipmentTypeCountList;
};

const getCountOnCondition = async (mainParam, sportsObj) => {
  let itemConditionCountList: any = [];

  mainParam?.itemCondition.map((item: string, index: number) => {
    let count = 0;

    count = sportsObj.filter((obj) => {
      const isMatchingCondition =
        (obj as any)?.itemDetailInfo?.itemCondition == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkEquipmentTypeMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
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

const getCountOnBrand = async (mainParam, sportsObj) => {
  let itemBrandCountList: any = [];
  mainParam?.itemBrand.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = sportsObj.filter((obj) => {
      const isMatchingBrand = (obj as any)?.itemDetailInfo?.brand == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingBrand &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkEquipmentTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
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

const getCountOnGender = async (mainParam, sportsObj) => {
  let itemGenderCountList: any = [];

  mainParam?.itemGender.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = sportsObj.filter((obj) => {
      const isMatchingGender = (obj as any)?.itemDetailInfo?.gender == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingGender &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkEquipmentTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemGenderCountList.push({
      itemGender: item,
      count,
    });
  });
  return itemGenderCountList;
};

const getCountOnSellerType = async (mainParam, sportsObj) => {
  let itemSellerTypeCountList: any = [];
  mainParam?.itemSellerType.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = sportsObj.filter((obj) => {
      const isMatchingSellerType =
        (obj as any)?.itemDetailInfo?.sellerType == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSellerType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkEquipmentTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSellerTypeCountList.push({
      itemSellerType: item,
      count,
    });
  });
  return itemSellerTypeCountList;
};

const checkEquipmentTypeMatches = (filter, obj) => {
  const selectedEquipmentTypeCondition = filter.equipmentType?.length > 0;
  const equipmentTypeMatches = selectedEquipmentTypeCondition
    ? filter.equipmentType.includes(
        (obj as any)?.itemDetailInfo?.itemSubCategory
      )
    : true;
  return equipmentTypeMatches;
};

const checkBrandMatches = (filter, obj) => {
  const selectedBrandCondition = filter.brand?.length > 0;
  let index = filter.brand.indexOf("Not Specified");
  if (index > -1) {
    filter.brand[index] = "";
  }
  const brandMatches = selectedBrandCondition
    ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
    : true;
  return brandMatches;
};

const checkGenderMatches = (filter, obj) => {
  const selectedGenderCondition = filter.gender?.length > 0;
  let index = filter.gender.indexOf("Not Specified");
  if (index > -1) {
    filter.gender[index] = "";
  }
  const genderMatches = selectedGenderCondition
    ? filter.gender.includes((obj as any)?.itemDetailInfo?.gender)
    : true;
  return genderMatches;
};
