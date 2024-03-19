import { Request, Response } from "express";
import Pet from "../models/Pet";
import mongoose from "mongoose";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  calculateDistance,
  checkPriceMatches,
  generateToken,
  getConditionToCountry,
  locationFilterDistanceAds,
  priceFilterAds,
  sellerRatingFilterAds,
} from "../service/helper";
import { getEmotCount } from "./userEmot.controller";

export const loadPetsInfo = async (req: Request, res: Response) => {
  try {
    const petModel = await Pet.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (petModel.length) {
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

    const newPet = new Pet();
    newPet.adId = req.body.adId;
    newPet.userId = req.body.userId;
    newPet.title = req.body.title;
    newPet.subTitle = req.body.subTitle;
    newPet.description = req.body.description;
    newPet.price = req.body.price;
    newPet.priceUnit = req.body.priceUnit;
    newPet.address = req.body.address;
    newPet.lat = req.body.lat;
    newPet.lng = req.body.lng;
    newPet.countryCode = req.body.countryCode;
    newPet.viewCount = 0;
    newPet.itemCategory = req.body.itemCategory;
    newPet.itemDetailInfo = req.body.itemDetailInfo;
    await newPet.save();

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
    const petObj = await Pet.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!petObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    petObj.viewCount = petObj.viewCount + 1;
    await petObj.save();

    const emotCount = await getEmotCount(req.body.adId);

    return res.json({
      success: true,
      message: "Success",
      data: petObj,
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

export const getMorePetAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextPetAds = await Pet.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextPetAds = locationFilterDistanceAds(req.body, nextPetAds);
    nextPetAds = sellerRatingFilterAds(req.body, nextPetAds);
    nextPetAds = priceFilterAds(req.body, nextPetAds);

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextPetAds,
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
    const petModel = await Pet.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = petModel?.length;
      else count = petModel.filter((obj) => obj.itemCategory == item)?.length;
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
      const petModelPerCountry = await Pet.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      petModelPerCountry
        .filter((obj) => {
          return checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj);
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
    let petObj = await Pet.find(condition).populate(
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
      petObj = petObj.filter((item) => {
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

    let countPerPrice = await getCountOnMinMaxPrice(req.body, petObj);
    /*
    let itemSellerRatingCountList = [];
    let itemGenderCountList = [];
    let itemSubCategoryCountList = [];
    let itemSizeCountList = [];
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
  */
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
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
    return checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj);
  })?.length;
  return countPerPrice;
};
