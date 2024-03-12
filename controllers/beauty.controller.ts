import { Request, Response } from "express";
import mongoose from "mongoose";
import Beauty from "../models/Beauty";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  brandFilterAds,
  calculateDistance,
  certificationsFilterAds,
  checkBrandMatches,
  checkItemConditionMatches,
  checkPriceMatches,
  checkSellerRatingMatches,
  genderFilterAds,
  generateToken,
  getConditionToCountry,
  ingredientsFilterAds,
  itemConditionFilterAds,
  locationFilterDistanceAds,
  priceFilterAds,
  sellerRatingFilterAds,
  sizeFilterAds,
  skinFilterAds,
} from "../service/helper";
import { getEmotCount } from "./userEmot.controller";

export const loadBeautyInfo = async (req: Request, res: Response) => {
  try {
    const beautyModel = await Beauty.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (beautyModel.length) {
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

    const newBeauty = new Beauty();
    newBeauty.adId = req.body.adId;
    newBeauty.userId = req.body.userId;
    newBeauty.title = req.body.title;
    newBeauty.subTitle = req.body.subTitle;
    newBeauty.description = req.body.description;
    newBeauty.price = req.body.price;
    newBeauty.priceUnit = req.body.priceUnit;
    newBeauty.address = req.body.address;
    newBeauty.lat = req.body.lat;
    newBeauty.lng = req.body.lng;
    newBeauty.countryCode = req.body.countryCode;
    newBeauty.viewCount = 0;
    newBeauty.itemCategory = req.body.itemCategory;
    newBeauty.itemDetailInfo = req.body.itemDetailInfo;
    await newBeauty.save();

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
    const beautyObj = await Beauty.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!beautyObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    beautyObj.viewCount = beautyObj.viewCount + 1;
    await beautyObj.save();

    const emotCount = await getEmotCount(req.body.adId);

    return res.json({
      success: true,
      message: "Success",
      data: beautyObj,
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

export const getMoreBeautyAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextBeautyAds = await Beauty.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextBeautyAds = locationFilterDistanceAds(req.body, nextBeautyAds);
    nextBeautyAds = sellerRatingFilterAds(req.body, nextBeautyAds);
    nextBeautyAds = priceFilterAds(req.body, nextBeautyAds);
    nextBeautyAds = itemConditionFilterAds(req.body, nextBeautyAds);
    nextBeautyAds = brandFilterAds(req.body, nextBeautyAds);
    nextBeautyAds = genderFilterAds(req.body, nextBeautyAds);
    nextBeautyAds = skinFilterAds(req.body, nextBeautyAds);
    nextBeautyAds = ingredientsFilterAds(req.body, nextBeautyAds);
    nextBeautyAds = sizeFilterAds(req.body, nextBeautyAds);
    nextBeautyAds = certificationsFilterAds(req.body, nextBeautyAds);

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextBeautyAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more beauty ads",
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
    const beautyModel = await Beauty.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = beautyModel?.length;
      else
        count = beautyModel.filter((obj) => obj.itemCategory == item)?.length;
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
      const beautyModelPerCountry = await Beauty.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      beautyModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkItemConditionMatches(req.body.filter, obj) &&
            checkBrandMatches(req.body.filter, obj) &&
            checkGenderMatches(req.body.filter, obj) &&
            checkSkinMatches(req.body.filter, obj) &&
            checkIngredientsMatches(req.body.filter, obj) &&
            checkItemSizeMatches(req.body.filter, obj) &&
            checkCertificationsMatches(req.body.filter, obj)
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
    let beautyObj = await Beauty.find(condition).populate(
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
      beautyObj = beautyObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, beautyObj);

    let itemSellerRatingCountList = [];
    let itemConditionCountList = [];
    let itemBrandCountList = [];
    let itemGenderCountList = [];
    let itemSkinCountList = [];
    let itemIngredientsCountList = [];
    let itemSizeCountList = [];
    let itemCertificationsCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        beautyObj
      );
    }
    if (req.body.itemCondition) {
      itemConditionCountList = await getCountOnItemCondition(
        req.body,
        beautyObj
      );
    }
    if (req.body.itemBrand) {
      itemBrandCountList = await getCountOnBrand(req.body, beautyObj);
    }
    if (req.body.itemGender) {
      itemGenderCountList = await getCountOnGender(req.body, beautyObj);
    }
    if (req.body.itemSkin) {
      itemSkinCountList = await getCountOnSkin(req.body, beautyObj);
    }
    if (req.body.itemIngredients) {
      itemIngredientsCountList = await getCountOnIngredients(
        req.body,
        beautyObj
      );
    }
    if (req.body.itemSize) {
      itemSizeCountList = await getCountOnSize(req.body, beautyObj);
    }
    if (req.body.itemCertifications) {
      itemCertificationsCountList = await getCountOnCertifications(
        req.body,
        beautyObj
      );
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemCondition: itemConditionCountList,
      itemBrand: itemBrandCountList,
      itemGender: itemGenderCountList,
      itemSkin: itemSkinCountList,
      itemIngredients: itemIngredientsCountList,
      itemSize: itemSizeCountList,
      itemCertifications: itemCertificationsCountList,
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
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkItemConditionMatches(mainParam.filter, obj) &&
      checkBrandMatches(mainParam.filter, obj) &&
      checkGenderMatches(mainParam.filter, obj) &&
      checkSkinMatches(mainParam.filter, obj) &&
      checkIngredientsMatches(mainParam.filter, obj) &&
      checkItemSizeMatches(mainParam.filter, obj) &&
      checkCertificationsMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, beautyObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = beautyObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSkinMatches(mainParam.filter, obj) &&
        checkIngredientsMatches(mainParam.filter, obj) &&
        checkItemSizeMatches(mainParam.filter, obj) &&
        checkCertificationsMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });
  return itemSellerRatingCountList;
};

const getCountOnItemCondition = async (mainParam, beautyObj) => {
  let itemConditionCountList: any = [];
  mainParam?.itemCondition.map((item: string, index: number) => {
    let count = 0;
    count = beautyObj.filter((obj) => {
      const isMatchingItemCondition =
        (obj as any)?.itemDetailInfo?.itemCondition == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingItemCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSkinMatches(mainParam.filter, obj) &&
        checkIngredientsMatches(mainParam.filter, obj) &&
        checkItemSizeMatches(mainParam.filter, obj) &&
        checkCertificationsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemConditionCountList.push({
      itemCondition: item,
      count,
    });
  });
  return itemConditionCountList;
};

const getCountOnBrand = async (mainParam, beautyObj) => {
  let itemBrandCountList: any = [];

  mainParam?.itemBrand.map((item: string, index: number) => {
    let count = 0;

    count = beautyObj.filter((obj) => {
      const isMatchingBrand = (obj as any)?.itemDetailInfo?.brand == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingBrand &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSkinMatches(mainParam.filter, obj) &&
        checkIngredientsMatches(mainParam.filter, obj) &&
        checkItemSizeMatches(mainParam.filter, obj) &&
        checkCertificationsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemBrandCountList.push({
      itemBrand: item,
      count,
    });
  });
  return itemBrandCountList;
};

const getCountOnGender = async (mainParam, beautyObj) => {
  let itemGenderCountList: any = [];

  mainParam?.itemGender.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = beautyObj.filter((obj) => {
      const isMatchingGender = (obj as any)?.itemDetailInfo?.gender == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingGender &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkSkinMatches(mainParam.filter, obj) &&
        checkIngredientsMatches(mainParam.filter, obj) &&
        checkItemSizeMatches(mainParam.filter, obj) &&
        checkCertificationsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemGenderCountList.push({
      itemGender: item,
      count,
    });
  });
  return itemGenderCountList;
};

const getCountOnSkin = async (mainParam, beautyObj) => {
  let itemSkinCountList: any = [];

  mainParam?.itemSkin.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = beautyObj.filter((obj) => {
      const isMatchingSkin = (obj as any)?.itemDetailInfo?.skinHairType == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSkin &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkIngredientsMatches(mainParam.filter, obj) &&
        checkItemSizeMatches(mainParam.filter, obj) &&
        checkCertificationsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSkinCountList.push({
      itemSkin: item,
      count,
    });
  });
  return itemSkinCountList;
};

const getCountOnIngredients = async (mainParam, beautyObj) => {
  let itemIngredientsCountList: any = [];

  mainParam?.itemIngredients.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = beautyObj.filter((obj) => {
      const isMatchingIngredients =
        (obj as any)?.itemDetailInfo?.ingredients == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingIngredients &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSkinMatches(mainParam.filter, obj) &&
        checkItemSizeMatches(mainParam.filter, obj) &&
        checkCertificationsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemIngredientsCountList.push({
      itemIngredients: item,
      count,
    });
  });
  return itemIngredientsCountList;
};

const getCountOnSize = async (mainParam, beautyObj) => {
  let itemSizeCountList: any = [];

  mainParam?.itemSize.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = beautyObj.filter((obj) => {
      const isMatchingSize = (obj as any)?.itemDetailInfo?.sizeVolume == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSize &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSkinMatches(mainParam.filter, obj) &&
        checkIngredientsMatches(mainParam.filter, obj) &&
        checkCertificationsMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSizeCountList.push({
      itemSize: item,
      count,
    });
  });
  return itemSizeCountList;
};

const getCountOnCertifications = async (mainParam, beautyObj) => {
  let itemCertificationsCountList: any = [];

  mainParam?.itemCertifications.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = beautyObj.filter((obj) => {
      const isMatchingCertifications =
        (obj as any)?.itemDetailInfo?.certifications == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingCertifications &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkGenderMatches(mainParam.filter, obj) &&
        checkSkinMatches(mainParam.filter, obj) &&
        checkIngredientsMatches(mainParam.filter, obj) &&
        checkItemSizeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemCertificationsCountList.push({
      itemCertifications: item,
      count,
    });
  });
  return itemCertificationsCountList;
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

const checkSkinMatches = (filter, obj) => {
  const selectedSkinCondition = filter.skin?.length > 0;
  let index = filter.skin.indexOf("Not Specified");
  if (index > -1) {
    filter.skin[index] = "";
  }
  const skinMatches = selectedSkinCondition
    ? filter.skin.includes((obj as any)?.itemDetailInfo?.skinHairType)
    : true;
  return skinMatches;
};

const checkIngredientsMatches = (filter, obj) => {
  const selectedIngredientsCondition = filter.ingredients?.length > 0;

  let index = filter.ingredients.indexOf("Not Specified");
  if (index > -1) {
    filter.ingredients[index] = "";
  }
  const ingredientsMatches = selectedIngredientsCondition
    ? filter.ingredients.includes((obj as any)?.itemDetailInfo?.ingredients)
    : true;
  return ingredientsMatches;
};

const checkItemSizeMatches = (filter, obj) => {
  const selectedItemSizeCondition = filter.size?.length > 0;
  let index = filter.size.indexOf("Not Specified");
  if (index > -1) {
    filter.size[index] = "";
  }
  const itemSizeMatches = selectedItemSizeCondition
    ? filter.size.includes((obj as any)?.itemDetailInfo?.sizeVolume)
    : true;
  return itemSizeMatches;
};

const checkCertificationsMatches = (filter, obj) => {
  const selectedCertificationsCondition = filter.certifications?.length > 0;
  let index = filter.certifications.indexOf("Not Specified");
  if (index > -1) {
    filter.certifications[index] = "";
  }
  const itemCertificationsMatches = selectedCertificationsCondition
    ? filter.certifications.includes(
        (obj as any)?.itemDetailInfo?.certifications
      )
    : true;
  return itemCertificationsMatches;
};
