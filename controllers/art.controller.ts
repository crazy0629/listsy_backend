import { Request, Response } from "express";
import mongoose from "mongoose";
import Art from "../models/Art";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  calculateDistance,
  checkItemConditionMatches,
  checkPriceMatches,
  checkSellerRatingMatches,
  generateToken,
  getConditionToCountry,
  itemConditionFilterAds,
  locationFilterDistanceAds,
  priceFilterAds,
  sellerRatingFilterAds,
} from "../service/helper";
import { getEmotCount } from "./userEmot.controller";

export const loadArtInfo = async (req: Request, res: Response) => {
  try {
    const artModel = await Art.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (artModel.length) {
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

    const newArtModel = new Art();
    newArtModel.adId = req.body.adId;
    newArtModel.userId = req.body.userId;
    newArtModel.title = req.body.title;
    newArtModel.subTitle = req.body.subTitle;
    newArtModel.description = req.body.description;
    newArtModel.price = req.body.price;
    newArtModel.priceUnit = req.body.priceUnit;
    newArtModel.address = req.body.address;
    newArtModel.lat = req.body.lat;
    newArtModel.lng = req.body.lng;
    newArtModel.countryCode = req.body.countryCode;
    newArtModel.viewCount = 0;
    newArtModel.itemCategory = req.body.itemCategory;
    newArtModel.itemDetailInfo = req.body.itemDetailInfo;
    await newArtModel.save();

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
    const artObj = await Art.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!artObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    artObj.viewCount = artObj.viewCount + 1;
    await artObj.save();

    const emotCount = await getEmotCount(req.body.adId);

    return res.json({
      success: true,
      message: "Success",
      data: artObj,
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

export const getCountForEachCategory = async (req: Request, res: Response) => {
  try {
    let countList: any = [];
    const artModel = await Art.find();
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = artModel?.length;
      else count = artModel.filter((obj) => obj.itemCategory == item)?.length;
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

export const getMoreArtAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);

    let nextArtAds = await Art.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextArtAds = locationFilterDistanceAds(req.body, nextArtAds);
    nextArtAds = priceFilterAds(req.body, nextArtAds);
    nextArtAds = sellerRatingFilterAds(req.body, nextArtAds);
    nextArtAds = itemConditionFilterAds(req.body, nextArtAds);

    if (req.body.artType && req.body.artType?.length) {
      nextArtAds = nextArtAds.filter(
        (item: any) =>
          req.body.artType.indexOf(item.itemDetailInfo.itemSubCategory) !== -1
      );
    }

    if (req.body.authenticity && req.body.authenticity?.length) {
      let index = req.body.authenticity.indexOf("Not Specified");
      req.body.authenticity[index] = "";

      nextArtAds = nextArtAds.filter(
        (item: any) =>
          req.body.authenticity.indexOf(item.itemDetailInfo.authenticity) !== -1
      );
    }

    if (req.body.age && req.body.age?.length) {
      let index = req.body.age.indexOf("Not Specified");
      req.body.age[index] = "";

      nextArtAds = nextArtAds.filter(
        (item: any) => req.body.age.indexOf(item.itemDetailInfo.age) !== -1
      );
    }

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextArtAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more art ads",
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
      const artModelPerCountry = await Art.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      artModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkTypeMatches(req.body.filter, obj) &&
            checkItemConditionMatches(req.body.filter, obj) &&
            checkAuthenticityMatches(req.body.filter, obj) &&
            checkAgeMatches(req.body.filter, obj)
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

    let artObj = await Art.find(condition).populate(
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
      artObj = artObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, artObj);
    let itemSellerRatingCountList = [];
    let itemTypeCountList = [];
    let itemConditionCountList = [];
    let itemAuthenticityCountList = [];
    let itemAgeCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        artObj
      );
    }

    if (req.body.itemType) {
      itemTypeCountList = await getCountOnItemType(req.body, artObj);
    }

    if (req.body.itemCondition) {
      itemConditionCountList = await getCountOnCondition(req.body, artObj);
    }

    if (req.body.itemAuthenticity) {
      itemAuthenticityCountList = await getCountOnAuthenticity(
        req.body,
        artObj
      );
    }

    if (req.body.itemAge) {
      itemAgeCountList = await getCountOnAge(req.body, artObj);
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemType: itemTypeCountList,
      itemCondition: itemConditionCountList,
      itemAuthenticity: itemAuthenticityCountList,
      itemAge: itemAgeCountList,
    });
  } catch (error) {
    console.log(error);
  }
};

const getCountOnMinMaxPrice = async (mainParam, artObj) => {
  let countPerPrice = -1;
  countPerPrice = artObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkTypeMatches(mainParam.filter, obj) &&
      checkItemConditionMatches(mainParam.filter, obj) &&
      checkAuthenticityMatches(mainParam.filter, obj) &&
      checkAgeMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, artObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = artObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkAuthenticityMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });

  return itemSellerRatingCountList;
};

const getCountOnItemType = async (mainParam, artObj) => {
  let itemTypeCountList: any = [];

  mainParam?.itemType.map((item: string, index: number) => {
    let count = 0;

    count = artObj.filter((obj) => {
      const isMatchingType =
        (obj as any)?.itemDetailInfo?.itemSubCategory == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkAuthenticityMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemTypeCountList.push({
      itemType: item,
      count,
    });
  });
  return itemTypeCountList;
};

const getCountOnCondition = async (mainParam, artObj) => {
  let itemConditionCountList: any = [];

  mainParam?.itemCondition.map((item: string, index: number) => {
    let count = 0;

    count = artObj.filter((obj) => {
      const isMatchingCondition =
        (obj as any)?.itemDetailInfo?.itemCondition == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkTypeMatches(mainParam.filter, obj) &&
        checkAuthenticityMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemConditionCountList.push({
      itemCondition: item,
      count,
    });
  });
  return itemConditionCountList;
};

const getCountOnAuthenticity = async (mainParam, artObj) => {
  let itemAuthenticityCountList: any = [];

  mainParam?.itemAuthenticity.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = artObj.filter((obj) => {
      const isMatchingAuthenticity =
        (obj as any)?.itemDetailInfo?.authenticity == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingAuthenticity &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemAuthenticityCountList.push({
      itemAuthenticity: item,
      count,
    });
  });
  return itemAuthenticityCountList;
};

const getCountOnAge = async (mainParam, artObj) => {
  let itemAgeCountList: any = [];

  mainParam?.itemAge.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = artObj.filter((obj) => {
      const isMatchingAge = (obj as any)?.itemDetailInfo?.age == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingAge &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkAuthenticityMatches(mainParam.filter, obj)
      );
    })?.length;
    itemAgeCountList.push({
      itemAge: item,
      count,
    });
  });
  return itemAgeCountList;
};

const checkTypeMatches = (filter, obj) => {
  const selectedTypeCondition = filter.artType?.length > 0;
  const typeMatches = selectedTypeCondition
    ? filter.artType.includes((obj as any)?.itemDetailInfo?.itemSubCategory)
    : true;
  return typeMatches;
};

const checkAuthenticityMatches = (filter, obj) => {
  const selectedAuthenticityCondition = filter.authenticity?.length > 0;
  let index = filter.authenticity.indexOf("Not Specified");
  if (index > -1) {
    filter.authenticity[index] = "";
  }
  const authenticityMatches = selectedAuthenticityCondition
    ? filter.authenticity.includes((obj as any)?.itemDetailInfo?.authenticity)
    : true;
  return authenticityMatches;
};

const checkAgeMatches = (filter, obj) => {
  const selectedAgeCondition = filter.age?.length > 0;
  let index = filter.age.indexOf("Not Specified");
  if (index > -1) {
    filter.age[index] = "";
  }
  const ageMatches = selectedAgeCondition
    ? filter.age.includes((obj as any)?.itemDetailInfo?.age)
    : true;
  return ageMatches;
};
