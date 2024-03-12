import { Request, Response } from "express";
import mongoose from "mongoose";
import Service from "../models/Service";
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
import UserEmot from "../models/UserEmot";
import { getEmotCount } from "./userEmot.controller";

export const loadServiceInfo = async (req: Request, res: Response) => {
  try {
    const serviceModel = await Service.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (serviceModel.length) {
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

    const newServiceModel = new Service();
    newServiceModel.adId = req.body.adId;
    newServiceModel.userId = req.body.userId;
    newServiceModel.title = req.body.title;
    newServiceModel.subTitle = req.body.subTitle;
    newServiceModel.description = req.body.description;
    newServiceModel.price = req.body.price;
    newServiceModel.priceUnit = req.body.priceUnit;
    newServiceModel.address = req.body.address;
    newServiceModel.lat = req.body.lat;
    newServiceModel.lng = req.body.lng;
    newServiceModel.countryCode = req.body.countryCode;
    newServiceModel.viewCount = 0;
    newServiceModel.itemCategory = req.body.itemCategory;
    newServiceModel.itemDetailInfo = req.body.itemDetailInfo;
    await newServiceModel.save();

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
    const serviceObj = await Service.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!serviceObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    serviceObj.viewCount = serviceObj.viewCount + 1;
    await serviceObj.save();

    const emotCount = await getEmotCount(req.body.adId);

    return res.json({
      success: true,
      message: "Success",
      data: serviceObj,
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
    const serviceModel = await Service.find();
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = serviceModel?.length;
      else
        count = serviceModel.filter((obj) => obj.itemCategory == item)?.length;
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

export const getMoreServiceAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);

    let nextServiceAds = await Service.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextServiceAds = locationFilterDistanceAds(req.body, nextServiceAds);
    nextServiceAds = sellerRatingFilterAds(req.body, nextServiceAds);
    nextServiceAds = priceFilterAds(req.body, nextServiceAds);

    if (req.body.serviceType && req.body.serviceType?.length) {
      nextServiceAds = nextServiceAds.filter(
        (item: any) =>
          req.body.serviceType.indexOf(item.itemDetailInfo.itemSubCategory) !==
          -1
      );
    }
    if (req.body.providerType && req.body.providerType?.length) {
      nextServiceAds = nextServiceAds.filter(
        (item: any) =>
          req.body.providerType.indexOf(item.itemDetailInfo.providerType) !== -1
      );
    }
    if (req.body.cancellationPolicy && req.body.cancellationPolicy?.length) {
      let index = req.body.cancellationPolicy.indexOf("Not Specified");
      req.body.cancellationPolicy[index] = "";

      nextServiceAds = nextServiceAds.filter(
        (item: any) =>
          req.body.cancellationPolicy.indexOf(
            item.itemDetailInfo.cancellationPolicy
          ) !== -1
      );
    }

    if (req.body.licenses && req.body.licenses?.length) {
      nextServiceAds = nextServiceAds.filter((item: any) => {
        const set = new Set(req.body.licenses);
        for (let element of item.itemDetailInfo.licenses) {
          if (set.has(element)) {
            return true;
          }
        }
        return false;
      });
    }

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextServiceAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more service ads",
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
      const serviceModelPerCountry = await Service.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      serviceModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkProviderTypeMatches(req.body.filter, obj) &&
            checkServiceTypeMatches(req.body.filter, obj) &&
            checkCancellationPolicyMatches(req.body.filter, obj) &&
            checkLicensesGroupMatches(req.body.filter, obj)
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
    let serviceObj = await Service.find(condition).populate(
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
      serviceObj = serviceObj.filter((item) => {
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
    let countPerPrice = await getCountOnMinMaxPrice(req.body, serviceObj);
    let itemSellerRatingCountList = [];
    let itemProviderTypeCountList = [];
    let itemServiceTypeCountList = [];
    let itemCancellationPolicyCountList = [];
    let itemLicensesGroupCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        serviceObj
      );
    }

    if (req.body.itemProviderType) {
      itemProviderTypeCountList = await getCountOnProviderType(
        req.body,
        serviceObj
      );
    }

    if (req.body.itemServiceType) {
      itemServiceTypeCountList = await getCountOnServiceType(
        req.body,
        serviceObj
      );
    }

    if (req.body.itemCancellationPolicy) {
      itemCancellationPolicyCountList = await getCountOnCancellationPolicy(
        req.body,
        serviceObj
      );
    }

    if (req.body.itemLicensesGroup) {
      itemLicensesGroupCountList = await getCountOnLicensesGroup(
        req.body,
        serviceObj
      );
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemProviderType: itemProviderTypeCountList,
      itemServiceType: itemServiceTypeCountList,
      itemCancellationPolicy: itemCancellationPolicyCountList,
      itemLicensesGroup: itemLicensesGroupCountList,
    });
  } catch (error) {
    console.log(error);
  }
};

const getCountOnMinMaxPrice = async (mainParam, serviceObj) => {
  let countPerPrice = -1;
  countPerPrice = serviceObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkProviderTypeMatches(mainParam.filter, obj) &&
      checkServiceTypeMatches(mainParam.filter, obj) &&
      checkCancellationPolicyMatches(mainParam.filter, obj) &&
      checkLicensesGroupMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, serviceObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = serviceObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkProviderTypeMatches(mainParam.filter, obj) &&
        checkServiceTypeMatches(mainParam.filter, obj) &&
        checkCancellationPolicyMatches(mainParam.filter, obj) &&
        checkLicensesGroupMatches(mainParam.filter, obj)
      );
    })?.length;
    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });
  return itemSellerRatingCountList;
};

const getCountOnProviderType = async (mainParam, serviceObj) => {
  let itemProviderTypeCountList: any = [];

  mainParam?.itemProviderType.map((item: string, index: number) => {
    let count = 0;
    count = serviceObj.filter((obj) => {
      const isMatchingProviderType =
        (obj as any)?.itemDetailInfo?.providerType == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingProviderType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkServiceTypeMatches(mainParam.filter, obj) &&
        checkCancellationPolicyMatches(mainParam.filter, obj) &&
        checkLicensesGroupMatches(mainParam.filter, obj)
      );
    })?.length;
    itemProviderTypeCountList.push({
      itemProviderType: item,
      count,
    });
  });
  return itemProviderTypeCountList;
};

const getCountOnServiceType = async (mainParam, serviceObj) => {
  let itemServiceTypeCountList: any = [];

  mainParam?.itemServiceType.map((item: string, index: number) => {
    let count = 0;

    count = serviceObj.filter((obj) => {
      const isMatchingType =
        (obj as any)?.itemDetailInfo?.itemSubCategory == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkProviderTypeMatches(mainParam.filter, obj) &&
        checkCancellationPolicyMatches(mainParam.filter, obj) &&
        checkLicensesGroupMatches(mainParam.filter, obj)
      );
    })?.length;
    itemServiceTypeCountList.push({
      itemServiceType: item,
      count,
    });
  });
  return itemServiceTypeCountList;
};

const getCountOnCancellationPolicy = async (mainParam, serviceObj) => {
  let itemCancellationPolicyCountList: any = [];

  mainParam?.itemCancellationPolicy.map((item: string, index: number) => {
    let count = 0,
      temp = "";

    if (item != "Not Specified") {
      temp = item;
    }

    count = serviceObj.filter((obj) => {
      const isMatchingPolicy =
        (obj as any)?.itemDetailInfo.cancellationPolicy == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingPolicy &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkProviderTypeMatches(mainParam.filter, obj) &&
        checkServiceTypeMatches(mainParam.filter, obj) &&
        checkLicensesGroupMatches(mainParam.filter, obj)
      );
    })?.length;

    itemCancellationPolicyCountList.push({
      itemCancellationPolicy: item,
      count,
    });
  });

  return itemCancellationPolicyCountList;
};

const getCountOnLicensesGroup = async (mainParam, serviceObj) => {
  let itemLicensesGroupCountList: any = [];
  mainParam?.itemLicensesGroup.map((item: string, index: number) => {
    let count = 0;
    count = serviceObj.filter((obj) => {
      const isMatchingLicenseGroup = (
        obj as any
      )?.itemDetailInfo?.licenses.includes(item);
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingLicenseGroup &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkProviderTypeMatches(mainParam.filter, obj) &&
        checkServiceTypeMatches(mainParam.filter, obj) &&
        checkCancellationPolicyMatches(mainParam.filter, obj)
      );
    })?.length;
    itemLicensesGroupCountList.push({
      itemLicensesGroup: item,
      count,
    });
  });
  return itemLicensesGroupCountList;
};

const checkProviderTypeMatches = (filter, obj) => {
  const selectedProviderTypeCondition = filter.providerType?.length > 0;
  const providerTypeMatches = selectedProviderTypeCondition
    ? filter.providerType.includes((obj as any)?.itemDetailInfo?.providerType)
    : true;
  return providerTypeMatches;
};

const checkServiceTypeMatches = (filter, obj) => {
  const selectedServiceTypeCondition = filter.serviceType?.length > 0;
  const serviceTypeMatches = selectedServiceTypeCondition
    ? filter.serviceType.includes((obj as any)?.itemDetailInfo?.itemSubCategory)
    : true;
  return serviceTypeMatches;
};

const checkCancellationPolicyMatches = (filter, obj) => {
  const selectedCancellationPolicyCondition =
    filter.cancellationPolicy?.length > 0;
  let index = filter.cancellationPolicy.indexOf("Not Specified");
  if (index > -1) {
    filter.cancellationPolicy[index] = "";
  }
  const cancellationPolicyMatches = selectedCancellationPolicyCondition
    ? filter.cancellationPolicy.includes(
        (obj as any)?.itemDetailInfo?.cancellationPolicy
      )
    : true;
  return cancellationPolicyMatches;
};

const checkLicensesGroupMatches = (filter, obj) => {
  const selectedLicenseGroupCondition = filter.license?.length > 0;

  if (selectedLicenseGroupCondition) {
    const set = new Set(filter.license);
    for (let element of (obj as any)?.itemDetailInfo.licenses) {
      if (set.has(element)) {
        return true;
      }
    }
    return false;
  } else {
    return true;
  }
};
