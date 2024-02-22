import { Request, Response } from "express";
import mongoose from "mongoose";
import Music from "../models/Music";
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

export const loadMusicInfo = async (req: Request, res: Response) => {
  try {
    const musicModel = await Music.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (musicModel.length) {
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

    const newMusic = new Music();
    newMusic.adId = req.body.adId;
    newMusic.userId = req.body.userId;
    newMusic.title = req.body.title;
    newMusic.subTitle = req.body.subTitle;
    newMusic.description = req.body.description;
    newMusic.price = req.body.price;
    newMusic.priceUnit = req.body.priceUnit;
    newMusic.address = req.body.address;
    newMusic.lat = req.body.lat;
    newMusic.lng = req.body.lng;
    newMusic.countryCode = req.body.countryCode;
    newMusic.viewCount = 0;
    newMusic.itemCategory = req.body.itemCategory;
    newMusic.itemDetailInfo = req.body.itemDetailInfo;
    await newMusic.save();

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
    const musicObj = await Music.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!musicObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    musicObj.viewCount = musicObj.viewCount + 1;
    await musicObj.save();

    return res.json({
      success: true,
      message: "Success",
      data: musicObj,
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
    const music = await Music.find();
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = music?.length;
      else count = music.filter((obj) => obj.itemCategory == item)?.length;
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

export const getMoreMusicAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextMusicAds = await Music.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextMusicAds = locationFilterDistanceAds(req.body, nextMusicAds);
    nextMusicAds = priceFilterAds(req.body, nextMusicAds);
    nextMusicAds = sellerRatingFilterAds(req.body, nextMusicAds);
    nextMusicAds = itemConditionFilterAds(req.body, nextMusicAds);
    nextMusicAds = sellerTypeFilterAds(req.body, nextMusicAds);

    if (req.body.instrumentType && req.body.instrumentType?.length) {
      nextMusicAds = nextMusicAds.filter(
        (item: any) =>
          req.body.instrumentType.indexOf(
            item.itemDetailInfo.itemSubCategory
          ) !== -1
      );
    }

    if (req.body.age && req.body.age?.length) {
      let index = req.body.age.indexOf("Not Specified");
      req.body.age[index] = "";

      nextMusicAds = nextMusicAds.filter(
        (item: any) => req.body.age.indexOf(item.itemDetailInfo.age) !== -1
      );
    }

    if (req.body.brand && req.body.brand?.length) {
      let index = req.body.brand.indexOf("Not Specified");
      req.body.brand[index] = "";

      nextMusicAds = nextMusicAds.filter(
        (item: any) => req.body.brand.indexOf(item.itemDetailInfo.brand) !== -1
      );
    }
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextMusicAds,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found while loading more music ads!",
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
      const musicModelPerCountry = await Music.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      musicModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkInstrumentTypeMatches(req.body.filter, obj) &&
            checkItemConditionMatches(req.body.filter, obj) &&
            checkAgeMatches(req.body.filter, obj) &&
            checkBrandMatches(req.body.filter, obj) &&
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
    let musicObj = await Music.find(condition).populate(
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
      musicObj = musicObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, musicObj);
    let itemSellerRatingCountList = [];
    let itemInstrumentTypeCountList = [];
    let itemConditionCountList = [];
    let itemAgeCountList = [];
    let itemBrandCountList = [];
    let itemSellerTypeCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        musicObj
      );
    }

    if (req.body.itemInstrumentType) {
      itemInstrumentTypeCountList = await getCountOnInstrumentType(
        req.body,
        musicObj
      );
    }

    if (req.body.itemCondition) {
      itemConditionCountList = await getCountOnCondition(req.body, musicObj);
    }

    if (req.body.itemAge) {
      itemAgeCountList = await getCountOnAge(req.body, musicObj);
    }

    if (req.body.itemBrand) {
      itemBrandCountList = await getCountOnBrand(req.body, musicObj);
    }

    if (req.body.itemSellerType) {
      itemSellerTypeCountList = await getCountOnSellerType(req.body, musicObj);
    }

    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemInstrumentType: itemInstrumentTypeCountList,
      itemCondition: itemConditionCountList,
      itemAge: itemAgeCountList,
      itemBrand: itemBrandCountList,
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

const getCountOnMinMaxPrice = async (mainParam, foodObj) => {
  let countPerPrice = -1;
  countPerPrice = foodObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkInstrumentTypeMatches(mainParam.filter, obj) &&
      checkItemConditionMatches(mainParam.filter, obj) &&
      checkAgeMatches(mainParam.filter, obj) &&
      checkBrandMatches(mainParam.filter, obj) &&
      checkSellerTypeMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, musicObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = musicObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkInstrumentTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });

  return itemSellerRatingCountList;
};

const getCountOnInstrumentType = async (mainParam, musicObj) => {
  let itemInstrumentTypeCountList: any = [];

  mainParam?.itemInstrumentType.map((item: string, index: number) => {
    let count = 0;

    count = musicObj.filter((obj) => {
      const isMatchingInstrumentType =
        (obj as any)?.itemDetailInfo?.itemSubCategory == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingInstrumentType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemInstrumentTypeCountList.push({
      itemInstrumentType: item,
      count,
    });
  });
  return itemInstrumentTypeCountList;
};

const getCountOnCondition = async (mainParam, musicObj) => {
  let itemConditionCountList: any = [];

  mainParam?.itemCondition.map((item: string, index: number) => {
    let count = 0;

    count = musicObj.filter((obj) => {
      const isMatchingCondition =
        (obj as any)?.itemDetailInfo?.itemCondition == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkInstrumentTypeMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
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

const getCountOnAge = async (mainParam, musicObj) => {
  let itemAgeCountList: any = [];

  mainParam?.itemAge.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = musicObj.filter((obj) => {
      const isMatchingAge = (obj as any)?.itemDetailInfo?.age == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingAge &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkInstrumentTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkSellerTypeMatches(mainParam.filter, obj)
      );
    })?.length;
    itemAgeCountList.push({
      itemAge: item,
      count,
    });
  });
  return itemAgeCountList;
};

const getCountOnBrand = async (mainParam, musicObj) => {
  let itemBrandCountList: any = [];
  mainParam?.itemBrand.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = musicObj.filter((obj) => {
      const isMatchingBrand = (obj as any)?.itemDetailInfo?.brand == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingBrand &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkInstrumentTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj) &&
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

const getCountOnSellerType = async (mainParam, musicObj) => {
  let itemSellerTypeCountList: any = [];
  mainParam?.itemSellerType.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = musicObj.filter((obj) => {
      const isMatchingSellerType =
        (obj as any)?.itemDetailInfo?.sellerType == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSellerType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkInstrumentTypeMatches(mainParam.filter, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkAgeMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSellerTypeCountList.push({
      itemSellerType: item,
      count,
    });
  });
  return itemSellerTypeCountList;
};

const checkInstrumentTypeMatches = (filter, obj) => {
  const selectedInstrumentTypeCondition = filter.instrumentType?.length > 0;
  const instrumentTypeMatches = selectedInstrumentTypeCondition
    ? filter.instrumentType.includes(
        (obj as any)?.itemDetailInfo?.itemSubCategory
      )
    : true;
  return instrumentTypeMatches;
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
