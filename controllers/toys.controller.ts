import { Request, Response } from "express";
import mongoose from "mongoose";
import Toy from "../models/toys";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  brandFilterAds,
  calculateDistance,
  checkPriceMatches,
  checkSellerRatingMatches,
  checkSellerTypeMatches,
  generateToken,
  getConditionToCountry,
  itemAgeGroupFilterAds,
  itemBrandFilterAds,
  itemEducationFilterAds,
  itemGenderFilterAds,
  locationFilterDistanceAds,
  priceFilterAds,
  sellerRatingFilterAds,
  sellerTypeFilterAds,
} from "../service/helper";

export const loadToysInfo = async (req: Request, res: Response) => {
  try {
    const toyModel = await Toy.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (toyModel.length) {
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

    const newToy = new Toy();
    newToy.adId = req.body.adId;
    newToy.userId = req.body.userId;
    newToy.title = req.body.title;
    newToy.subTitle = req.body.subTitle;
    newToy.description = req.body.description;
    newToy.price = req.body.price;
    newToy.priceUnit = req.body.priceUnit;
    newToy.address = req.body.address;
    newToy.lat = req.body.lat;
    newToy.lng = req.body.lng;
    newToy.countryCode = req.body.countryCode;
    newToy.viewCount = 0;
    newToy.itemCategory = req.body.itemCategory;
    newToy.itemDetailInfo = req.body.itemDetailInfo;
    await newToy.save();

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
    const toyObj = await Toy.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!toyObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    toyObj.viewCount = toyObj.viewCount + 1;
    await toyObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: toyObj,
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
    const toyModel = await Toy.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = toyModel?.length;
      else count = toyModel.filter((obj) => obj.itemCategory == item)?.length;
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

export const getMoreToysAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextToyAds = await Toy.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextToyAds = locationFilterDistanceAds(req.body, nextToyAds);
    nextToyAds = sellerRatingFilterAds(req.body, nextToyAds);
    nextToyAds = priceFilterAds(req.body, nextToyAds);
    nextToyAds = itemBrandFilterAds(req.body, nextToyAds);
    nextToyAds = itemGenderFilterAds(req.body, nextToyAds);
    nextToyAds = itemEducationFilterAds(req.body, nextToyAds);
    nextToyAds = sellerTypeFilterAds(req.body, nextToyAds);
    nextToyAds = itemAgeGroupFilterAds(req.body, nextToyAds);

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextToyAds,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found while loading more toy ads",
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
      const toyModelPerCountry = await Toy.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      toyModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkAgeGroupMatches(req.body.filter, obj) &&
            checkBrandMatches(req.body.filter, obj) &&
            checkGenderMatches(req.body.filter, obj) &&
            checkEducationMatches(req.body.filter, obj) &&
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
    let toyObj = await Toy.find(condition).populate(
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
      toyObj = toyObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, toyObj);

    let itemSellerRatingCountList = [];
    let itemAgeGroupCountList = [];
    let itemBrandCountList = [];
    let itemGenderCountList = [];
    let itemEducationCountList = [];
    let itemSellerTypeCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        toyObj
      );
    }
    if (req.body.itemAgeGroup) {
      itemAgeGroupCountList = await getCountOnAgeGroup(req.body, toyObj);
    }
    if (req.body.itemBrand) {
      itemBrandCountList = await getCountOnBrand(req.body, toyObj);
    }
    if (req.body.itemGender) {
      itemGenderCountList = await getCountOnGender(req.body, toyObj);
    }
    if (req.body.itemEducation) {
      itemEducationCountList = await getCountOnEducation(req.body, toyObj);
    }
    if (req.body.itemSellerType) {
      itemSellerTypeCountList = await getCountOnSellerType(req.body, toyObj);
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemAgeGroup: itemAgeGroupCountList,
      itemBrand: itemBrandCountList,
      itemGender: itemGenderCountList,
      itemEducation: itemEducationCountList,
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

const getCountOnMinMaxPrice = async (mainParam, toyObj) => {
  let countPerPrice = -1;
  countPerPrice = toyObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkAgeGroupMatches(mainParam.filter, obj) &&
      checkBrandMatches(mainParam.filter, obj) &&
      checkGenderMatches(mainParam.filter, obj) &&
      checkEducationMatches(mainParam.filter, obj) &&
      checkSellerTypeMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, toyObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = toyObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkAgeGroupMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkEducationMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });
  return itemSellerRatingCountList;
};

const getCountOnAgeGroup = async (mainParam, toyObj) => {
  let itemAgeGroupCountList: any = [];
  mainParam?.itemAgeGroup.map((item: string, index: number) => {
    let count = 0;
    count = toyObj.filter((obj) => {
      const isMatchingAgeGroup = (
        obj as any
      )?.itemDetailInfo?.ageGroup.includes(item);
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingAgeGroup &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkEducationMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemAgeGroupCountList.push({
      itemAgeGroup: item,
      count,
    });
  });
  return itemAgeGroupCountList;
};

const getCountOnBrand = async (mainParam, toyObj) => {
  let itemBrandCountList: any = [];

  mainParam?.itemBrand.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = toyObj.filter((obj) => {
      const isMatchingBrand = (obj as any)?.itemDetailInfo?.brand == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingBrand &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkAgeGroupMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkEducationMatches(mainParam.filter, obj) &&
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

const getCountOnGender = async (mainParam, toyObj) => {
  let itemGenderCountList: any = [];

  mainParam?.itemGender.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = toyObj.filter((obj) => {
      const isMatchingGender = (obj as any)?.itemDetailInfo?.gender == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingGender &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkAgeGroupMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkEducationMatches(mainParam.filter, obj) &&
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

const getCountOnEducation = async (mainParam, toyObj) => {
  let itemEducationCountList: any = [];
  mainParam?.itemEducation.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = toyObj.filter((obj) => {
      const isMatchingEducation =
        (obj as any)?.itemDetailInfo?.education == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingEducation &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkAgeGroupMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemEducationCountList.push({
      itemEducation: item,
      count,
    });
  });
  return itemEducationCountList;
};

const getCountOnSellerType = async (mainParam, toyObj) => {
  let itemSellerTypeCountList: any = [];
  mainParam?.itemSellerType.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = toyObj.filter((obj) => {
      const isMatchingSellerType =
        (obj as any)?.itemDetailInfo?.sellerType == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSellerType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkAgeGroupMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkEducationMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSellerTypeCountList.push({
      itemSellerType: item,
      count,
    });
  });
  return itemSellerTypeCountList;
};

const checkAgeGroupMatches = (filter, obj) => {
  const selectedAgeGroupCondition = filter.itemAge?.length > 0;

  if (selectedAgeGroupCondition) {
    const set = new Set(filter.itemAge);
    for (let element of (obj as any)?.itemDetailInfo.ageGroup) {
      if (set.has(element)) {
        return true;
      }
    }
    return false;
  } else {
    return true;
  }
};

const checkBrandMatches = (filter, obj) => {
  const selectedBrandCondition = filter.itemBrand?.length > 0;
  let index = filter.itemBrand.indexOf("Not Specified");
  if (index > -1) {
    filter.itemBrand[index] = "";
  }
  const brandMatches = selectedBrandCondition
    ? filter.itemBrand.includes((obj as any)?.itemDetailInfo?.brand)
    : true;
  return brandMatches;
};

const checkGenderMatches = (filter, obj) => {
  const selectedGenderCondition = filter.itemGender?.length > 0;
  let index = filter.itemGender.indexOf("Not Specified");
  if (index > -1) {
    filter.itemGender[index] = "";
  }
  const genderMatches = selectedGenderCondition
    ? filter.itemGender.includes((obj as any)?.itemDetailInfo?.gender)
    : true;
  return genderMatches;
};

const checkEducationMatches = (filter, obj) => {
  const selectedEducationCondition = filter.itemEducation?.length > 0;
  let index = filter.itemEducation.indexOf("Not Specified");
  if (index > -1) {
    filter.itemEducation[index] = "";
  }
  const educationMatches = selectedEducationCondition
    ? filter.itemEducation.includes((obj as any)?.itemDetailInfo?.education)
    : true;
  return educationMatches;
};
