import { Request, Response } from "express";
import mongoose from "mongoose";
import Art from "../models/Art";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  calculateDistance,
  checkPriceMatches,
  checkSellerRatingMatches,
  generateToken,
  getConditionToCountry,
  itemConditionFilterAds,
  locationFilterDistanceAds,
  priceFilterAds,
  sellerRatingFilterAds,
} from "../service/helper";

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

    return res.json({
      success: true,
      message: "Success",
      data: artObj,
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

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextArtAds,
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
            checkSellerRatingMatches(req.body.filter, obj)
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

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        artObj
      );
    }

    if (req.body.itemType) {
      itemTypeCountList = await getCountOnItemType(req.body, artObj);
    }

    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemType: itemTypeCountList,
    });
  } catch (error) {
    console.log(error);
  }
};

const getCountOnMinMaxPrice = async (mainParam, artObj) => {
  let countPerPrice = -1;
  countPerPrice = artObj.filter((obj) => {
    return checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj);
    // checkSellerRatingMatches(mainParam.filter, obj)
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
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj)
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
        checkSellerRatingMatches(mainParam.filter, obj)
      );
    })?.length;
    itemTypeCountList.push({
      itemInstrumentType: item,
      count,
    });
  });
  return itemTypeCountList;
};
