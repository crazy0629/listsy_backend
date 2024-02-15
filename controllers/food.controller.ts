import { Request, Response } from "express";
import Food from "../models/Food";
import mongoose from "mongoose";
import Ad from "../models/Ad";
import User from "../models/User";
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

export const loadFoodInfo = async (req: Request, res: Response) => {
  try {
    const foodModel = await Food.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (foodModel.length) {
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

    const newFood = new Food();
    newFood.adId = req.body.adId;
    newFood.userId = req.body.userId;
    newFood.title = req.body.title;
    newFood.subTitle = req.body.subTitle;
    newFood.description = req.body.description;
    newFood.price = req.body.price;
    newFood.priceUnit = req.body.priceUnit;
    newFood.address = req.body.address;
    newFood.lat = req.body.lat;
    newFood.lng = req.body.lng;
    newFood.countryCode = req.body.countryCode;
    newFood.viewCount = 0;
    newFood.itemCategory = req.body.itemCategory;
    newFood.itemDetailInfo = req.body.itemDetailInfo;
    await newFood.save();

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
    const foodObj = await Food.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!foodObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    foodObj.viewCount = foodObj.viewCount + 1;
    await foodObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: foodObj,
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
      if (req.body.countryCode == "") {
        condition.address = req.body.address;
      } else {
        condition.countryCode = req.body.countryCode;
      }
    }

    let countList: any = [];
    const foodModel = await Food.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = foodModel?.length;
      else count = foodModel.filter((obj) => obj.itemCategory == item)?.length;
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

export const getMoreFoodAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextFoodAds = await Food.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextFoodAds = locationFilterDistanceAds(req.body, nextFoodAds);
    nextFoodAds = sellerRatingFilterAds(req.body, nextFoodAds);
    nextFoodAds = priceFilterAds(req.body, nextFoodAds);

    if (req.body.mealType && req.body.mealType?.length) {
      nextFoodAds = nextFoodAds.filter(
        (item: any) =>
          req.body.mealType.indexOf(item.itemDetailInfo.mealType) !== -1
      );
    }
    if (req.body.dietaryPreferences && req.body.dietaryPreferences?.length) {
      let index = req.body.dietaryPreferences.indexOf("Not Specified");
      req.body.dietaryPreferences[index] = "";
      nextFoodAds = nextFoodAds.filter(
        (item: any) =>
          req.body.dietaryPreferences.indexOf(
            item.itemDetailInfo.dietaryPreferences
          ) !== -1
      );
    }
    if (req.body.deliveryOptions && req.body.deliveryOptions?.length) {
      let index = req.body.deliveryOptions.indexOf("Not Specified");
      req.body.deliveryOptions[index] = "";
      nextFoodAds = nextFoodAds.filter(
        (item: any) =>
          req.body.deliveryOptions.indexOf(
            item.itemDetailInfo.deliveryOptions
          ) !== -1
      );
    }

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextFoodAds,
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
      const foodModelPerCountry = await Food.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      foodModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkMealTypeMatches(req.body.filter, obj) &&
            checkDietaryPreferenceMatches(req.body.filter, obj) &&
            checkDeliveryOptionsMatches(req.body.filter, obj) &&
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

    let foodObj = await Food.find(condition).populate(
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
      foodObj = foodObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, foodObj);
    let itemMealTypeCountList = [];
    let itemDietaryPreferencesCountList = [];
    let itemDeliveryOptionsCountList = [];
    let itemSellerRatingCountList = [];

    if (req.body.itemMealType) {
      itemMealTypeCountList = await getCountOnMealType(req.body, foodObj);
    }
    if (req.body.itemDietaryPreferences) {
      itemDietaryPreferencesCountList = await getCountOnDietaryPreferences(
        req.body,
        foodObj
      );
    }
    if (req.body.itemDeliveryOptions) {
      itemDeliveryOptionsCountList = await getCountOnDeliveryOptions(
        req.body,
        foodObj
      );
    }

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        foodObj
      );
    }

    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemMealType: itemMealTypeCountList,
      itemDietaryPreferences: itemDietaryPreferencesCountList,
      itemDeliveryOptions: itemDeliveryOptionsCountList,
      itemSellerRating: itemSellerRatingCountList,
    });
  } catch (error) {
    console.log(error);
  }
};

const checkDietaryPreferenceMatches = (filter, obj) => {
  const selectedDietaryPreferenceCondition =
    filter.dietaryPreferences?.length > 0;
  let index = filter.dietaryPreferences.indexOf("Not Specified");
  if (index > -1) {
    filter.dietaryPreferences[index] = "";
  }
  const dietaryPreferenceMatches = selectedDietaryPreferenceCondition
    ? filter.dietaryPreferences.includes(
        (obj as any)?.itemDetailInfo?.dietaryPreferences
      )
    : true;
  return dietaryPreferenceMatches;
};

const checkMealTypeMatches = (filter, obj) => {
  const selectedMealTypeCondition = filter.mealType?.length > 0;
  const mealTypeMatches = selectedMealTypeCondition
    ? filter.mealType.includes((obj as any)?.itemDetailInfo?.mealType)
    : true;
  return mealTypeMatches;
};

const checkDeliveryOptionsMatches = (filter, obj) => {
  const selectedDeliveryOptionsCondition = filter.deliveryOptions?.length > 0;
  let index = filter.deliveryOptions.indexOf("Not Specified");
  if (index > -1) {
    filter.deliveryOptions[index] = "";
  }

  const deliveryOptionsMatches = selectedDeliveryOptionsCondition
    ? filter.deliveryOptions.includes(
        (obj as any)?.itemDetailInfo?.deliveryOptions
      )
    : true;
  return deliveryOptionsMatches;
};

const getCountOnMinMaxPrice = async (mainParam, foodObj) => {
  let countPerPrice = -1;
  countPerPrice = foodObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkMealTypeMatches(mainParam.filter, obj) &&
      checkDietaryPreferenceMatches(mainParam.filter, obj) &&
      checkDeliveryOptionsMatches(mainParam.filter, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnDietaryPreferences = async (mainParam, foodObj) => {
  let itemDietaryPreferenceCountList: any = [];

  mainParam?.itemDietaryPreferences.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = foodObj.filter((obj) => {
      const isMatchingDietaryPreference =
        (obj as any)?.itemDetailInfo?.dietaryPreferences == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingDietaryPreference &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkMealTypeMatches(mainParam.filter, obj) &&
        checkDeliveryOptionsMatches(mainParam.filter, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj)
      );
    })?.length;
    itemDietaryPreferenceCountList.push({
      itemDietaryPreferences: item,
      count,
    });
  });
  return itemDietaryPreferenceCountList;
};

const getCountOnMealType = async (mainParam, foodObj) => {
  let itemMealTypeCountList: any = [];

  mainParam?.itemMealType.map((item: string, index: number) => {
    let count = 0;
    count = foodObj.filter((obj) => {
      const isMatchingMealType = (obj as any)?.itemDetailInfo?.mealType == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingMealType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkDietaryPreferenceMatches(mainParam.filter, obj) &&
        checkDeliveryOptionsMatches(mainParam.filter, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj)
      );
    })?.length;
    itemMealTypeCountList.push({
      itemMealType: item,
      count,
    });
  });
  return itemMealTypeCountList;
};

const getCountOnDeliveryOptions = async (mainParam, foodObj) => {
  let itemDeliveryOptionsCountList: any = [];

  mainParam?.itemDeliveryOptions.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = foodObj.filter((obj) => {
      const isMatchingDeliveryOptions =
        (obj as any)?.itemDetailInfo?.deliveryOptions == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingDeliveryOptions &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkDietaryPreferenceMatches(mainParam.filter, obj) &&
        checkMealTypeMatches(mainParam.filter, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj)
      );
    })?.length;
    itemDeliveryOptionsCountList.push({
      itemDeliveryOptions: item,
      count,
    });
  });
  return itemDeliveryOptionsCountList;
};

const getCountOnSellerRating = async (mainParam, foodObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = foodObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkDietaryPreferenceMatches(mainParam.filter, obj) &&
        checkMealTypeMatches(mainParam.filter, obj) &&
        checkDeliveryOptionsMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });

  return itemSellerRatingCountList;
};
