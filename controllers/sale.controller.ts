import { Request, Response } from "express";
import ForSale from "../models/ForSale";
import mongoose from "mongoose";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  calculateDistance,
  checkItemConditionMatches,
  checkPriceMatches,
  checkSellerRatingMatches,
  generateToken,
} from "../service/helper";

/**
 * This function is called when users upload items for sale ads.
 * This loads detail items for sale ad info and saves on db.
 *
 * @param req
 * @param res
 */

const checkBrandMatches = (filter, obj) => {
  const selectedBrandCondition = filter.brand?.length > 0;
  const brandMatches = selectedBrandCondition
    ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
    : true;
  return brandMatches;
};

const checkScreenSizeMatches = (filter, obj) => {
  const selectedScreenSizeCondition = filter.screenSize?.length > 0;
  const screenSizeMatches = selectedScreenSizeCondition
    ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
    : true;
  return screenSizeMatches;
};

const checkResolutionMatches = (filter, obj) => {
  const selectedResolutionCondition = filter.resolution?.length > 0;
  const resolutionMatches = selectedResolutionCondition
    ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
    : true;
  return resolutionMatches;
};

const checkSmartTVMatches = (filter, obj) => {
  const selectedSmartTVCondition = filter.smartTV?.length > 0;
  const smartTVMatches = selectedSmartTVCondition
    ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
    : true;
  return smartTVMatches;
};

const checkColourMatches = (filter, obj) => {
  const selectedColorCondition = filter.colour?.length > 0;
  const colourMatches = selectedColorCondition
    ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
    : true;
  return colourMatches;
};

const checkBatteryLifeMatches = (filter, obj) => {
  const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
  const batteryLifeMatches = selectedBatteryLifeCondition
    ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
    : true;
  return batteryLifeMatches;
};

const checkOperatingSystemMatches = (filter, obj) => {
  const selectedOperatingSystemCondition = filter.operatingSystem?.length > 0;
  const operatingSystemMatches = selectedOperatingSystemCondition
    ? filter.operatingSystem.includes(
        (obj as any)?.itemDetailInfo.operatingSystem
      )
    : true;
  return operatingSystemMatches;
};

const checkStorageCapacityMatches = (filter, obj) => {
  const selectedStorageCapacityCondition = filter.storageCapacity?.length > 0;
  const storageCapacityMatches = selectedStorageCapacityCondition
    ? filter.storageCapacity.includes(
        (obj as any)?.itemDetailInfo.storageCapacity
      )
    : true;
  return storageCapacityMatches;
};

const checkProcessorMatches = (filter, obj) => {
  const selectedProcessorCondition = filter.processor?.length > 0;
  const processorMatches = selectedProcessorCondition
    ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
    : true;
  return processorMatches;
};

const checkWarrantyInformationMatches = (filter, obj) => {
  const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
  const warrantyInformationMatches = selectedWarrantyCondition
    ? filter.warrantyInformation.includes(
        (obj as any)?.itemDetailInfo.warrantyInformation
      )
    : true;
  return warrantyInformationMatches;
};

const checkRamSizeMatches = (filter, obj) => {
  const selectedRamSizeCondition = filter.ramSize?.length > 0;
  const ramSizeMatches = selectedRamSizeCondition
    ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
    : true;
  return ramSizeMatches;
};

const checkTypeMatches = (filter, obj) => {
  const selectedTypeCondition = filter.type?.length > 0;
  const typeMatches = selectedTypeCondition
    ? filter.type.includes((obj as any)?.itemDetailInfo.type)
    : true;
  return typeMatches;
};

const checkStorageMatches = (filter, obj) => {
  const selectedStorageCondition = filter.storage?.length > 0;
  const storageMatches = selectedStorageCondition
    ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
    : true;
  return storageMatches;
};

const checkMemoryMatches = (filter, obj) => {
  const selectedMemoryCondition = filter.memory?.length > 0;
  const memoryMatches = selectedMemoryCondition
    ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
    : true;
  return memoryMatches;
};

const checkFeaturesMatches = (filter, obj) => {
  const selectedFeaturesCondition = filter.features?.length > 0;

  if (selectedFeaturesCondition) {
    const set = new Set(filter.features);
    for (let element of (obj as any)?.itemDetailInfo.features) {
      if (set.has(element)) {
        return true;
      }
    }
    return false;
  } else {
    return true;
  }
};

const checkConnectivityMatches = (filter, obj) => {
  const selectedConnectivityCondition = filter.connectivity?.length > 0;
  const connectivityMatches = selectedConnectivityCondition
    ? filter.connectivity.includes((obj as any)?.itemDetailInfo.connectivity)
    : true;
  return connectivityMatches;
};

const checkSupportedStandardsMatches = (filter, obj) => {
  const selectedSupportedStandardsCondition =
    filter.supportedStandards?.length > 0;
  const supportedStandardsMatches = selectedSupportedStandardsCondition
    ? filter.supportedStandards.includes(
        (obj as any)?.itemDetailInfo.supportedStandards
      )
    : true;
  return supportedStandardsMatches;
};

const checkMegapixelsMatches = (filter, obj) => {
  const selectedMegapixelsCondition = filter.megapixels?.length > 0;
  const megapixelsMatches = selectedMegapixelsCondition
    ? filter.megapixels.includes((obj as any)?.itemDetailInfo.megapixels)
    : true;
  return megapixelsMatches;
};

const checkWalkieTalkiesTypeMatches = (filter, obj) => {
  const selectedWalkieTalkiesTypeCondition =
    filter.walkieTalkiesType?.length > 0;
  const walkieTalkiesTypeMatches = selectedWalkieTalkiesTypeCondition
    ? filter.walkieTalkiesType.includes(
        (obj as any)?.itemDetailInfo.walkieTalkiesType
      )
    : true;
  return walkieTalkiesTypeMatches;
};

const checkLandLineTypeMatches = (filter, obj) => {
  const selectedLandLineTypeCondition = filter.landLineType?.length > 0;
  const landLineTypeMatches = selectedLandLineTypeCondition
    ? filter.landLineType.includes((obj as any)?.itemDetailInfo.landLineType)
    : true;
  return landLineTypeMatches;
};

const checkAccessoryTypeMatches = (filter, obj) => {
  const selectedAccessoryTypeCondition = filter.accessoryType?.length > 0;
  const accessoryTypeMatches = selectedAccessoryTypeCondition
    ? filter.accessoryType.includes((obj as any)?.itemDetailInfo.accessoryType)
    : true;
  return accessoryTypeMatches;
};

const checkNetworkProviderMatches = (filter, obj) => {
  const selectedNetworkProviderCondition = filter.networkProvider?.length > 0;
  const networkProviderMatches = selectedNetworkProviderCondition
    ? filter.networkProvider.includes(
        (obj as any)?.itemDetailInfo.networkProvider
      )
    : true;
  return networkProviderMatches;
};

const checkScreenSizeRangeMatches = (filter, obj) => {
  const selectedScreenSizeRangeCondition = filter.screenSizeRange?.length > 0;
  const screenSizeRangeMatches = selectedScreenSizeRangeCondition
    ? filter.screenSizeRange.includes(
        (obj as any)?.itemDetailInfo.screenSizeRange
      )
    : true;
  return screenSizeRangeMatches;
};

const checkMemoryCapacityMatches = (filter, obj) => {
  const selectedMemoryCapacityCondition = filter.memoryCapacity?.length > 0;
  const memoryCapacityMatches = selectedMemoryCapacityCondition
    ? filter.memoryCapacity.includes(
        (obj as any)?.itemDetailInfo.memoryCapacity
      )
    : true;
  return memoryCapacityMatches;
};

const checkCameraResolutionMatches = (filter, obj) => {
  const selectedCameraResolutionCondition = filter.cameraResolution?.length > 0;
  const cameraResolutionMatches = selectedCameraResolutionCondition
    ? filter.cameraResolution.includes(
        (obj as any)?.itemDetailInfo.cameraResolution
      )
    : true;
  return cameraResolutionMatches;
};

const checkBatteryCapacityMatches = (filter, obj) => {
  const selectedBatteryCapacityCondition = filter.batteryCapacity?.length > 0;
  const batteryCapacityMatches = selectedBatteryCapacityCondition
    ? filter.batteryCapacity.includes(
        (obj as any)?.itemDetailInfo.batteryCapacity
      )
    : true;
  return batteryCapacityMatches;
};

export const loadForSaleInfo = async (req: Request, res: Response) => {
  ForSale.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model?.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }

      Ad.findById(new mongoose.Types.ObjectId(req.body.adId)).then(
        async (adModel: any) => {
          adModel.address = req.body.address;
          adModel.lng = req.body.lng;
          adModel.lat = req.body.lat;
          adModel.countryCode = req.body.countryCode;
          await adModel.save();
        }
      );

      const newForSale = new ForSale();
      newForSale.adId = req.body.adId;
      newForSale.userId = req.body.userId;
      newForSale.title = req.body.title;
      newForSale.subTitle = req.body.subTitle;
      newForSale.description = req.body.description;
      newForSale.price = req.body.price;
      newForSale.priceUnit = req.body.priceUnit;
      newForSale.address = req.body.address;
      newForSale.lat = req.body.lat;
      newForSale.lng = req.body.lng;
      newForSale.countryCode = req.body.countryCode;
      newForSale.viewCount = 0;
      newForSale.itemCategory = req.body.itemCategory;
      newForSale.itemDetailInfo = req.body.itemDetailInfo;

      await newForSale.save();
    }
  );
  User.findById(new mongoose.Types.ObjectId(req.body.userId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      if (model.telephoneNumber == undefined) {
        model.telephoneNumber = req.body.telephoneNumber;
        model.phoneNumberShare = req.body.phoneNumberShare;
        await model.save();
      }

      return res.json({
        success: true,
        message: "Successfully saved sale media information!",
        data: model,
        token: generateToken(model),
      });
    }
  );
};

export const getMoreForSaleAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (
      req.body.centerLocationSelected == true &&
      req.body.SearchWithin != ""
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
    let nextForSaleAds = await ForSale.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    //////-----------------------
    if (
      req.body.centerLocationSelected == true &&
      req.body.SearchWithin != "" &&
      req.body.SearchWithin != "Nationwide"
    ) {
      let distance = 0;
      if (req.body.SearchWithin != "Current location")
        distance = parseInt(req.body.SearchWithin.match(/\d+/)[0]);
      nextForSaleAds = nextForSaleAds.filter((item) => {
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

    if (req.body.sellerRating && req.body.sellerRating?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.sellerRating.indexOf(
            Math.floor(item.userId.reviewMark).toString() + "*"
          ) !== -1
      );
    }
    if (req.body.smartTV && req.body.smartTV?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.smartTV.indexOf(item.itemDetailInfo.smartTV) !== -1
      );
    }
    if (req.body.warrantyInformation && req.body.warrantyInformation?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.warrantyInformation.indexOf(
            item.itemDetailInfo.warrantyInformation
          ) !== -1
      );
    }
    if (req.body.colour && req.body.colour?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.colour.indexOf(item.itemDetailInfo.colour) !== -1
      );
    }
    if (req.body.brand && req.body.brand?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) => req.body.brand.indexOf(item.itemDetailInfo.brand) !== -1
      );
    }
    if (req.body.resolution && req.body.resolution?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.resolution.indexOf(item.itemDetailInfo.resolution) !== -1
      );
    }
    if (req.body.screenSize && req.body.screenSize?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.screenSize.indexOf(item.itemDetailInfo.screenSize) !== -1
      );
    }
    if (req.body.itemCondition && req.body.itemCondition?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.itemCondition.indexOf(item.itemDetailInfo.itemCondition) !==
          -1
      );
    }
    if (req.body.batteryLife && req.body.batteryLife?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.batteryLife.indexOf(item.itemDetailInfo.batteryLife) !== -1
      );
    }
    if (req.body.operatingSystem && req.body.operatingSystem?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.operatingSystem.indexOf(
            item.itemDetailInfo.operatingSystem
          ) !== -1
      );
    }
    if (req.body.storageCapacity && req.body.storageCapacity?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.storageCapacity.indexOf(
            item.itemDetailInfo.storageCapacity
          ) !== -1
      );
    }
    if (req.body.processor && req.body.processor?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.processor.indexOf(item.itemDetailInfo.processor) !== -1
      );
    }
    if (req.body.ramSize && req.body.ramSize?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.ramSize.indexOf(item.itemDetailInfo.ramSize) !== -1
      );
    }
    if (req.body.type && req.body.type?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) => req.body.type.indexOf(item.itemDetailInfo.type) !== -1
      );
    }
    if (req.body.storage && req.body.storage?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.storage.indexOf(item.itemDetailInfo.storage) !== -1
      );
    }
    if (req.body.memory && req.body.memory?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.memory.indexOf(item.itemDetailInfo.memory) !== -1
      );
    }
    if (req.body.connectivity && req.body.connectivity?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.connectivity.indexOf(item.itemDetailInfo.connectivity) !== -1
      );
    }
    if (req.body.supportedStandards && req.body.supportedStandards?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.supportedStandards.indexOf(
            item.itemDetailInfo.supportedStandards
          ) !== -1
      );
    }
    if (req.body.megapixels && req.body.megapixels?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.megapixels.indexOf(item.itemDetailInfo.megapixels) !== -1
      );
    }
    if (req.body.walkieTalkiesType && req.body.walkieTalkiesType?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.walkieTalkiesType.indexOf(
            item.itemDetailInfo.walkieTalkiesType
          ) !== -1
      );
    }
    if (req.body.landLineType && req.body.landLineType?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.landLineType.indexOf(item.itemDetailInfo.landLineType) !== -1
      );
    }
    if (req.body.accessoryType && req.body.accessoryType?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.accessoryType.indexOf(item.itemDetailInfo.accessoryType) !==
          -1
      );
    }
    if (req.body.networkProvider && req.body.networkProvider?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.networkProvider.indexOf(
            item.itemDetailInfo.networkProvider
          ) !== -1
      );
    }
    if (req.body.screenSizeRange && req.body.screenSizeRange?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.screenSizeRange.indexOf(
            item.itemDetailInfo.screenSizeRange
          ) !== -1
      );
    }
    if (req.body.cameraResolution && req.body.cameraResolution?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.cameraResolution.indexOf(
            item.itemDetailInfo.cameraResolution
          ) !== -1
      );
    }
    if (req.body.batteryCapacity && req.body.batteryCapacity?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.batteryCapacity.indexOf(
            item.itemDetailInfo.batteryCapacity
          ) !== -1
      );
    }
    if (req.body.memoryCapacity && req.body.memoryCapacity?.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.memoryCapacity.indexOf(
            item.itemDetailInfo.memoryCapacity
          ) !== -1
      );
    }
    if (req.body.features && req.body.features?.length) {
      nextForSaleAds = nextForSaleAds.filter((item: any) => {
        const set = new Set(req.body.features);
        for (let element of item.itemDetailInfo.features) {
          if (set.has(element)) {
            return true;
          }
        }
        return false;
      });
    }
    if (req.body.minPrice && req.body.minPrice != "") {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) => Number(req.body.minPrice) <= item.price
      );
    }
    if (req.body.maxPrice && req.body.maxPrice != "") {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) => Number(req.body.maxPrice) >= item.price
      );
    }

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextForSaleAds,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found while loading more electronics ads",
    });
  }
};

export const getAdDetailInfo = async (req: Request, res: Response) => {
  const saleObj = await ForSale.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!saleObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  saleObj.viewCount = saleObj.viewCount + 1;
  await saleObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: saleObj,
  });
};

const getCountOnWarrantyInformation = async (
  itemWarrantyInformation,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemWarrantyInformationCountList: any = [];
  itemWarrantyInformation.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingWarrantyInformation =
        (obj as any)?.itemDetailInfo?.warrantyInformation == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingWarrantyInformation &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemWarrantyInformationCountList.push({
      itemWarrantyInformation: item,
      count,
    });
  });
  return itemWarrantyInformationCountList;
};

const getCountOnSmartTV = async (
  itemSmartTV,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemSmartTVCountList: any = [];

  itemSmartTV.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingSmart = (obj as any)?.itemDetailInfo?.smartTV == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingSmart &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;

    itemSmartTVCountList.push({
      itemSmartTV: item,
      count,
    });
  });
  return itemSmartTVCountList;
};

const getCountOnSellerRating = async (
  itemSellerRating,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemSellerRatingCountList: any = [];

  itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });

  return itemSellerRatingCountList;
};

const getCountOnBrand = async (
  itemBrand,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemBrandCountList: any = [];

  itemBrand.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingBrand = (obj as any)?.itemDetailInfo?.brand == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingBrand &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;

    itemBrandCountList.push({
      itemBrand: item,
      count,
    });
  });
  return itemBrandCountList;
};

const getCountOnColor = async (
  itemColour,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemColourCountList: any = [];

  itemColour.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingColour = (obj as any)?.itemDetailInfo?.colour == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingColour &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;

    itemColourCountList.push({
      itemColour: item,
      count,
    });
  });
  return itemColourCountList;
};

const getCountOnResolution = async (
  itemResolution,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemResolutionCountList: any = [];

  itemResolution.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingResolution =
        (obj as any)?.itemDetailInfo?.resolution == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingResolution &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;

    itemResolutionCountList.push({
      itemResolution: item,
      count,
    });
  });
  return itemResolutionCountList;
};

const getCountOnScreenSize = async (
  itemScreenSize,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemScreenSizeCountList: any = [];

  itemScreenSize.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingScreenSize =
        (obj as any)?.itemDetailInfo?.screenSize == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingScreenSize &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;

    itemScreenSizeCountList.push({
      itemScreenSize: item,
      count,
    });
  });
  return itemScreenSizeCountList;
};

const getCountOnItemCondition = async (
  itemCondition,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemConditionCountList: any = [];
  itemCondition.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingCondition =
        (obj as any)?.itemDetailInfo?.itemCondition == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingCondition &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;

    itemConditionCountList.push({
      itemCondition: item,
      count,
    });
  });

  return itemConditionCountList;
};

const getCountOnMinMaxPrice = async (mainParam, saleObj) => {
  let countPerPrice = -1;
  countPerPrice = saleObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkItemConditionMatches(mainParam.filter, obj) &&
      checkScreenSizeMatches(mainParam.filter, obj) &&
      checkResolutionMatches(mainParam.filter, obj) &&
      checkBrandMatches(mainParam.filter, obj) &&
      checkSmartTVMatches(mainParam.filter, obj) &&
      checkColourMatches(mainParam.filter, obj) &&
      checkSellerRatingMatches(mainParam.filter, obj) &&
      checkWarrantyInformationMatches(mainParam.filter, obj) &&
      checkBatteryLifeMatches(mainParam.filter, obj) &&
      checkOperatingSystemMatches(mainParam.filter, obj) &&
      checkStorageCapacityMatches(mainParam.filter, obj) &&
      checkProcessorMatches(mainParam.filter, obj) &&
      checkRamSizeMatches(mainParam.filter, obj) &&
      checkTypeMatches(mainParam.filter, obj) &&
      checkStorageMatches(mainParam.filter, obj) &&
      checkMemoryMatches(mainParam.filter, obj) &&
      checkFeaturesMatches(mainParam.filter, obj) &&
      checkConnectivityMatches(mainParam.filter, obj) &&
      checkSupportedStandardsMatches(mainParam.filter, obj) &&
      checkMegapixelsMatches(mainParam.filter, obj) &&
      checkWalkieTalkiesTypeMatches(mainParam.filter, obj) &&
      checkLandLineTypeMatches(mainParam.filter, obj) &&
      checkAccessoryTypeMatches(mainParam.filter, obj) &&
      checkNetworkProviderMatches(mainParam.filter, obj) &&
      checkScreenSizeRangeMatches(mainParam.filter, obj) &&
      checkMemoryCapacityMatches(mainParam.filter, obj) &&
      checkCameraResolutionMatches(mainParam.filter, obj) &&
      checkBatteryCapacityMatches(mainParam.filter, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnBatteryLife = async (
  itemBatteryLife,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemBatteryLifeCountList: any = [];

  itemBatteryLife.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingBatteryLife =
        (obj as any)?.itemDetailInfo?.batteryLife == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingBatteryLife &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemBatteryLifeCountList.push({
      itemBatteryLife: item,
      count,
    });
  });
  return itemBatteryLifeCountList;
};

const getCountOnOperatingSystem = async (
  itemOperatingSystem,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemOperatingSystemCountList: any = [];

  itemOperatingSystem.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingOperatingSystem =
        (obj as any)?.itemDetailInfo?.operatingSystem == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingOperatingSystem &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemOperatingSystemCountList.push({
      itemOperatingSystem: item,
      count,
    });
  });
  return itemOperatingSystemCountList;
};

const getCountOnStorageCapacity = async (
  itemStorageCapacity,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemStorageCapacityCountList: any = [];

  itemStorageCapacity.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingStorageCapacity =
        (obj as any)?.itemDetailInfo?.storageCapacity == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingStorageCapacity &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemStorageCapacityCountList.push({
      itemStorageCapacity: item,
      count,
    });
  });
  return itemStorageCapacityCountList;
};

const getCountOnProcessor = async (
  itemProcessor,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemProcessorCountList: any = [];

  itemProcessor.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingProcessor =
        (obj as any)?.itemDetailInfo?.processor == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingProcessor &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemProcessorCountList.push({
      itemProcessor: item,
      count,
    });
  });
  return itemProcessorCountList;
};

const getCountOnRamSize = async (
  itemRamSize,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemRamSizeCountList: any = [];

  itemRamSize.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingRamSize = (obj as any)?.itemDetailInfo?.ramSize == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingRamSize &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemRamSizeCountList.push({
      itemRamSize: item,
      count,
    });
  });
  return itemRamSizeCountList;
};

const getCountOnType = async (
  itemType,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemTypeCountList: any = [];

  itemType.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingType = (obj as any)?.itemDetailInfo?.type == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingType &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemTypeCountList.push({
      itemType: item,
      count,
    });
  });
  return itemTypeCountList;
};

const getCountOnStorage = async (mainParam, saleObj) => {
  let itemStorageCountList: any = [];

  mainParam.itemStorage.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingStorage = (obj as any)?.itemDetailInfo?.storage == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingStorage &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkScreenSizeMatches(mainParam.filter, obj) &&
        checkResolutionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkSmartTVMatches(mainParam.filter, obj) &&
        checkColourMatches(mainParam.filter, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkBatteryLifeMatches(mainParam.filter, obj) &&
        checkOperatingSystemMatches(mainParam.filter, obj) &&
        checkStorageCapacityMatches(mainParam.filter, obj) &&
        checkProcessorMatches(mainParam.filter, obj) &&
        checkRamSizeMatches(mainParam.filter, obj) &&
        checkTypeMatches(mainParam.filter, obj) &&
        checkWarrantyInformationMatches(mainParam.filter, obj) &&
        checkMemoryMatches(mainParam.filter, obj) &&
        checkFeaturesMatches(mainParam.filter, obj) &&
        checkConnectivityMatches(mainParam.filter, obj) &&
        checkSupportedStandardsMatches(mainParam.filter, obj) &&
        checkMegapixelsMatches(mainParam.filter, obj) &&
        checkWalkieTalkiesTypeMatches(mainParam.filter, obj) &&
        checkLandLineTypeMatches(mainParam.filter, obj) &&
        checkAccessoryTypeMatches(mainParam.filter, obj) &&
        checkNetworkProviderMatches(mainParam.filter, obj) &&
        checkScreenSizeRangeMatches(mainParam.filter, obj) &&
        checkMemoryCapacityMatches(mainParam.filter, obj) &&
        checkCameraResolutionMatches(mainParam.filter, obj) &&
        checkBatteryCapacityMatches(mainParam.filter, obj)
      );
    })?.length;
    itemStorageCountList.push({
      itemStorage: item,
      count,
    });
  });
  return itemStorageCountList;
};

const getCountOnMemory = async (mainParam, saleObj) => {
  let itemMemoryCountList: any = [];

  mainParam.itemMemory.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingMemory = (obj as any)?.itemDetailInfo?.memory == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingMemory &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkScreenSizeMatches(mainParam.filter, obj) &&
        checkResolutionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkSmartTVMatches(mainParam.filter, obj) &&
        checkColourMatches(mainParam.filter, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkBatteryLifeMatches(mainParam.filter, obj) &&
        checkOperatingSystemMatches(mainParam.filter, obj) &&
        checkStorageCapacityMatches(mainParam.filter, obj) &&
        checkProcessorMatches(mainParam.filter, obj) &&
        checkRamSizeMatches(mainParam.filter, obj) &&
        checkTypeMatches(mainParam.filter, obj) &&
        checkStorageMatches(mainParam.filter, obj) &&
        checkWarrantyInformationMatches(mainParam.filter, obj) &&
        checkFeaturesMatches(mainParam.filter, obj) &&
        checkConnectivityMatches(mainParam.filter, obj) &&
        checkSupportedStandardsMatches(mainParam.filter, obj) &&
        checkMegapixelsMatches(mainParam.filter, obj) &&
        checkWalkieTalkiesTypeMatches(mainParam.filter, obj) &&
        checkLandLineTypeMatches(mainParam.filter, obj) &&
        checkAccessoryTypeMatches(mainParam.filter, obj) &&
        checkNetworkProviderMatches(mainParam.filter, obj) &&
        checkScreenSizeRangeMatches(mainParam.filter, obj) &&
        checkMemoryCapacityMatches(mainParam.filter, obj) &&
        checkCameraResolutionMatches(mainParam.filter, obj) &&
        checkBatteryCapacityMatches(mainParam.filter, obj)
      );
    })?.length;
    itemMemoryCountList.push({
      itemMemory: item,
      count,
    });
  });
  return itemMemoryCountList;
};

const getCountOnFeatures = async (mainParam, saleObj) => {
  let itemFeaturesCountList: any = [];

  mainParam.itemFeatures.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingFeatures = (
        obj as any
      )?.itemDetailInfo?.features.includes(item);
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingFeatures &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkItemConditionMatches(mainParam.filter, obj) &&
        checkScreenSizeMatches(mainParam.filter, obj) &&
        checkResolutionMatches(mainParam.filter, obj) &&
        checkBrandMatches(mainParam.filter, obj) &&
        checkSmartTVMatches(mainParam.filter, obj) &&
        checkColourMatches(mainParam.filter, obj) &&
        checkSellerRatingMatches(mainParam.filter, obj) &&
        checkBatteryLifeMatches(mainParam.filter, obj) &&
        checkOperatingSystemMatches(mainParam.filter, obj) &&
        checkStorageCapacityMatches(mainParam.filter, obj) &&
        checkProcessorMatches(mainParam.filter, obj) &&
        checkRamSizeMatches(mainParam.filter, obj) &&
        checkTypeMatches(mainParam.filter, obj) &&
        checkStorageMatches(mainParam.filter, obj) &&
        checkMemoryMatches(mainParam.filter, obj) &&
        checkWarrantyInformationMatches(mainParam.filter, obj) &&
        checkFeaturesMatches(mainParam.filter, obj) &&
        checkConnectivityMatches(mainParam.filter, obj) &&
        checkSupportedStandardsMatches(mainParam.filter, obj) &&
        checkMegapixelsMatches(mainParam.filter, obj) &&
        checkWalkieTalkiesTypeMatches(mainParam.filter, obj) &&
        checkLandLineTypeMatches(mainParam.filter, obj) &&
        checkAccessoryTypeMatches(mainParam.filter, obj) &&
        checkNetworkProviderMatches(mainParam.filter, obj) &&
        checkScreenSizeRangeMatches(mainParam.filter, obj) &&
        checkMemoryCapacityMatches(mainParam.filter, obj) &&
        checkCameraResolutionMatches(mainParam.filter, obj) &&
        checkBatteryCapacityMatches(mainParam.filter, obj)
      );
    })?.length;
    itemFeaturesCountList.push({
      itemFeatures: item,
      count,
    });
  });
  return itemFeaturesCountList;
};

const getCountOnConnectivity = async (
  itemConnectivity,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemConnectivityCountList: any = [];

  itemConnectivity.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingConnectivity =
        (obj as any)?.itemDetailInfo?.connectivity == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingConnectivity &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemConnectivityCountList.push({
      itemConnectivity: item,
      count,
    });
  });
  return itemConnectivityCountList;
};

const getCountOnSupportedStandards = async (
  itemSupportedStandards,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemSupportedStandardsCountList: any = [];

  itemSupportedStandards.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingSuppportedStandards =
        (obj as any)?.itemDetailInfo?.supportedStandards == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingSuppportedStandards &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemSupportedStandardsCountList.push({
      itemSupportedStandards: item,
      count,
    });
  });
  return itemSupportedStandardsCountList;
};

const getCountOnMegapixels = async (
  itemMegapixels,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemMegapixelsCountList: any = [];

  itemMegapixels.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingMegapixels =
        (obj as any)?.itemDetailInfo?.megapixels == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingMegapixels &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemMegapixelsCountList.push({
      itemMegapixels: item,
      count,
    });
  });
  return itemMegapixelsCountList;
};

const getCountOnWalkieTalkiesType = async (
  itemWalkieTalkiesType,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemWalkieTalkiesTypeCountList: any = [];

  itemWalkieTalkiesType.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingWalkieTalkiesType =
        (obj as any)?.itemDetailInfo?.walkieTalkiesType == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingWalkieTalkiesType &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemWalkieTalkiesTypeCountList.push({
      itemWalkieTalkiesType: item,
      count,
    });
  });
  return itemWalkieTalkiesTypeCountList;
};

const getCountOnLandLineType = async (
  itemLandlineType,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemLandLineTypeCountList: any = [];

  itemLandlineType.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingLandLineType =
        (obj as any)?.itemDetailInfo?.landLineType == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingLandLineType &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemLandLineTypeCountList.push({
      itemLandLineType: item,
      count,
    });
  });
  return itemLandLineTypeCountList;
};

const getCountOnAccessoryType = async (
  itemAccessoryType,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemAccessoryTypeCountList: any = [];

  itemAccessoryType.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingAccessoryType =
        (obj as any)?.itemDetailInfo?.accessoryType == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingAccessoryType &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemAccessoryTypeCountList.push({
      itemAccessoryType: item,
      count,
    });
  });
  return itemAccessoryTypeCountList;
};

const getCountOnNetworkProvider = async (
  itemNetworkProvider,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemNetworkProviderCountList: any = [];

  itemNetworkProvider.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingNetworkProvider =
        (obj as any)?.itemDetailInfo?.networkProvider == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingNetworkProvider &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemNetworkProviderCountList.push({
      itemNetworkProvider: item,
      count,
    });
  });
  return itemNetworkProviderCountList;
};

const getCountOnScreenSizeRange = async (
  itemScreenSizeRange,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemScreenSizeRangeCountList: any = [];

  itemScreenSizeRange.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingScreenSizeRange =
        (obj as any)?.itemDetailInfo?.screenSizeRange == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingScreenSizeRange &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemScreenSizeRangeCountList.push({
      itemScreenSizeRange: item,
      count,
    });
  });
  return itemScreenSizeRangeCountList;
};

const getCountOnMemoryCapacity = async (
  itemMemoryCapacity,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemMemoryCapacityCountList: any = [];

  itemMemoryCapacity.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingMemoryCapacity =
        (obj as any)?.itemDetailInfo?.memoryCapacity == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingMemoryCapacity &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemMemoryCapacityCountList.push({
      itemMemoryCapacity: item,
      count,
    });
  });
  return itemMemoryCapacityCountList;
};

const getCountOnCameraResolution = async (
  itemCameraResolution,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemCameraResolutionCountList: any = [];

  itemCameraResolution.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingCameraResolution =
        (obj as any)?.itemDetailInfo?.cameraResolution == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingCameraResolution &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkBatteryCapacityMatches(filter, obj)
      );
    })?.length;
    itemCameraResolutionCountList.push({
      itemCameraResolution: item,
      count,
    });
  });
  return itemCameraResolutionCountList;
};

const getCountOnBatteryCapacity = async (
  itemBatteryCapacity,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemBatteryCapacityCountList: any = [];

  itemBatteryCapacity.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingBatteryCapacity =
        (obj as any)?.itemDetailInfo?.batteryCapacity == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;

      return (
        isMatchingBatteryCapacity &&
        isMatchingItemCategory &&
        checkPriceMatches(minPrice, maxPrice, obj) &&
        checkItemConditionMatches(filter, obj) &&
        checkScreenSizeMatches(filter, obj) &&
        checkResolutionMatches(filter, obj) &&
        checkBrandMatches(filter, obj) &&
        checkSmartTVMatches(filter, obj) &&
        checkColourMatches(filter, obj) &&
        checkSellerRatingMatches(filter, obj) &&
        checkBatteryLifeMatches(filter, obj) &&
        checkOperatingSystemMatches(filter, obj) &&
        checkStorageCapacityMatches(filter, obj) &&
        checkProcessorMatches(filter, obj) &&
        checkRamSizeMatches(filter, obj) &&
        checkTypeMatches(filter, obj) &&
        checkStorageMatches(filter, obj) &&
        checkMemoryMatches(filter, obj) &&
        checkFeaturesMatches(filter, obj) &&
        checkConnectivityMatches(filter, obj) &&
        checkWarrantyInformationMatches(filter, obj) &&
        checkSupportedStandardsMatches(filter, obj) &&
        checkMegapixelsMatches(filter, obj) &&
        checkWalkieTalkiesTypeMatches(filter, obj) &&
        checkLandLineTypeMatches(filter, obj) &&
        checkAccessoryTypeMatches(filter, obj) &&
        checkNetworkProviderMatches(filter, obj) &&
        checkScreenSizeRangeMatches(filter, obj) &&
        checkMemoryCapacityMatches(filter, obj) &&
        checkCameraResolutionMatches(filter, obj)
      );
    })?.length;
    itemBatteryCapacityCountList.push({
      itemBatteryCapacity: item,
      count,
    });
  });
  return itemBatteryCapacityCountList;
};

export const getCountOfEachFilter = async (req: Request, res: Response) => {
  try {
    let filterObj: any = {};
    if (req.body.itemCategory == "Phones") {
      filterObj = {
        SearchWithin: req.body.filter.SearchWithin,
        type: req.body.filter.type,
        centerLocationSelected: req.body.filter.centerLocationSelected,
        selectedLocation: req.body.filter.selectedLocation,
      };
      if (req.body.filter.type == "Cell Phones") {
        filterObj = {
          ...filterObj,
          ...req.body.filter.cellPhone,
        };
      } else if (req.body.filter.type == "Cell Phone Accessories") {
        filterObj = {
          ...filterObj,
          ...req.body.filter.cellPhoneAccessories,
        };
      } else if (req.body.filter.type == "Landlines") {
        filterObj = {
          ...filterObj,
          ...req.body.filter.landLine,
        };
      } else if (req.body.filter.type == "Walkie Talkies") {
        filterObj = {
          ...filterObj,
          ...req.body.filter.walkieTalkies,
        };
      }
      req.body.filter = filterObj;
    }

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
      const saleObjPerCountry = await ForSale.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );

      saleObjPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkItemConditionMatches(req.body.filter, obj) &&
            checkScreenSizeMatches(req.body.filter, obj) &&
            checkResolutionMatches(req.body.filter, obj) &&
            checkBrandMatches(req.body.filter, obj) &&
            checkSmartTVMatches(req.body.filter, obj) &&
            checkColourMatches(req.body.filter, obj) &&
            checkSellerRatingMatches(req.body.filter, obj) &&
            checkWarrantyInformationMatches(req.body.filter, obj) &&
            checkBatteryLifeMatches(req.body.filter, obj) &&
            checkOperatingSystemMatches(req.body.filter, obj) &&
            checkStorageCapacityMatches(req.body.filter, obj) &&
            checkProcessorMatches(req.body.filter, obj) &&
            checkRamSizeMatches(req.body.filter, obj) &&
            checkTypeMatches(req.body.filter, obj) &&
            checkStorageMatches(req.body.filter, obj) &&
            checkMemoryMatches(req.body.filter, obj) &&
            checkFeaturesMatches(req.body.filter, obj) &&
            checkConnectivityMatches(req.body.filter, obj) &&
            checkSupportedStandardsMatches(req.body.filter, obj) &&
            checkMegapixelsMatches(req.body.filter, obj) &&
            checkWalkieTalkiesTypeMatches(req.body.filter, obj) &&
            checkLandLineTypeMatches(req.body.filter, obj) &&
            checkAccessoryTypeMatches(req.body.filter, obj) &&
            checkNetworkProviderMatches(req.body.filter, obj) &&
            checkScreenSizeRangeMatches(req.body.filter, obj) &&
            checkMemoryCapacityMatches(req.body.filter, obj) &&
            checkCameraResolutionMatches(req.body.filter, obj) &&
            checkBatteryCapacityMatches(req.body.filter, obj)
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

    let itemTypeCountList: any = [];
    let itemConditionCountList: any = [];
    let itemScreenSizeCountList: any = [];
    let itemResolutionCountList: any = [];
    let itemBrandCountList: any = [];
    let itemSmartTVCountList: any = [];
    let itemColourCountList: any = [];
    let itemWarrantyInformationCountList: any = [];
    let itemSellerRatingCountList: any = [];
    let itemBatteryLifeCountList: any = [];
    let itemOperatingSystemCountList: any = [];
    let itemStorageCapacityCountList: any = [];
    let itemProcessorCountList: any = [];
    let itemRamSizeCountList: any = [];
    let itemStorageCountList: any = [];
    let itemMemoryCountList: any = [];
    let itemFeaturesCountList: any = [];
    let itemConnectivityCountList: any = [];
    let itemSupportedStandardsCountList: any = [];
    let itemMegapixelsCountList: any = [];
    let itemWalkieTalkiesTypeCountList: any = [];
    let itemLandLineTypeCountList: any = [];
    let itemAccessoryTypeCountList: any = [];
    let itemNetworkProviderCountList: any = [];
    let itemScreenSizeRangeCountList: any = [];
    let itemMemoryCapacityCountList: any = [];
    let itemCameraResolutionCountList: any = [];
    let itemBatteryCapacityCountList: any = [];

    let saleObj = await ForSale.find(condition).populate(
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
      saleObj = saleObj.filter((item) => {
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

    let countPerPrice = await getCountOnMinMaxPrice(req.body, saleObj);

    if (req.body.itemStorage) {
      itemStorageCountList = await getCountOnStorage(req.body, saleObj);
    }

    if (req.body.itemMemory) {
      itemMemoryCountList = await getCountOnMemory(req.body, saleObj);
    }

    if (req.body.itemFeatures) {
      itemFeaturesCountList = await getCountOnFeatures(req.body, saleObj);
    }

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body.itemSellerRating,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemCondition) {
      itemConditionCountList = await getCountOnItemCondition(
        req.body.itemCondition,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemProcessor) {
      itemProcessorCountList = await getCountOnProcessor(
        req.body.itemProcessor,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    if (req.body.itemScreenSize) {
      itemScreenSizeCountList = await getCountOnScreenSize(
        req.body.itemScreenSize,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemBrand) {
      itemBrandCountList = await getCountOnBrand(
        req.body.itemBrand,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemResolution) {
      itemResolutionCountList = await getCountOnResolution(
        req.body.itemResolution,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemSmartTV) {
      itemSmartTVCountList = await getCountOnSmartTV(
        req.body.itemSmartTV,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemOperatingSystem) {
      itemOperatingSystemCountList = await getCountOnOperatingSystem(
        req.body.itemOperatingSystem,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemStorageCapacity) {
      itemStorageCapacityCountList = await getCountOnStorageCapacity(
        req.body.itemStorageCapacity,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemType) {
      itemTypeCountList = await getCountOnType(
        req.body.itemType,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemBatteryLife) {
      itemBatteryLifeCountList = await getCountOnBatteryLife(
        req.body.itemBatteryLife,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemRamSize) {
      itemRamSizeCountList = await getCountOnRamSize(
        req.body.itemRamSize,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemColour) {
      itemColourCountList = await getCountOnColor(
        req.body.itemColour,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemWarrantyInformation) {
      itemWarrantyInformationCountList = await getCountOnWarrantyInformation(
        req.body.itemWarrantyInformation,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemConnectivity) {
      itemConnectivityCountList = await getCountOnConnectivity(
        req.body.itemConnectivity,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemSupportedStandards) {
      itemSupportedStandardsCountList = await getCountOnSupportedStandards(
        req.body.itemSupportedStandards,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemMegapixels) {
      itemMegapixelsCountList = await getCountOnMegapixels(
        req.body.itemMegapixels,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemWalkieTalkiesType) {
      itemWalkieTalkiesTypeCountList = await getCountOnWalkieTalkiesType(
        req.body.itemWalkieTalkiesType,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemLandLineType) {
      itemLandLineTypeCountList = await getCountOnLandLineType(
        req.body.itemLandLineType,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    if (req.body.itemAccessoryType) {
      itemAccessoryTypeCountList = await getCountOnAccessoryType(
        req.body.itemAccessoryType,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    if (req.body.itemNetworkProvider) {
      itemNetworkProviderCountList = await getCountOnNetworkProvider(
        req.body.itemNetworkProvider,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    if (req.body.itemNetworkProvider) {
      itemNetworkProviderCountList = await getCountOnNetworkProvider(
        req.body.itemNetworkProvider,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    if (req.body.itemScreenSizeRange) {
      itemScreenSizeRangeCountList = await getCountOnScreenSizeRange(
        req.body.itemScreenSizeRange,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    if (req.body.itemMemoryCapacity) {
      itemMemoryCapacityCountList = await getCountOnMemoryCapacity(
        req.body.itemMemoryCapacity,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    if (req.body.itemCameraResolution) {
      itemCameraResolutionCountList = await getCountOnCameraResolution(
        req.body.itemCameraResolution,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    if (req.body.itemBatteryCapacity) {
      itemBatteryCapacityCountList = await getCountOnBatteryCapacity(
        req.body.itemBatteryCapacity,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }
    return res.json({
      success: true,
      itemCondition: itemConditionCountList,
      itemResolution: itemResolutionCountList,
      screenSize: itemScreenSizeCountList,
      itemBrand: itemBrandCountList,
      itemSmartTV: itemSmartTVCountList,
      itemColour: itemColourCountList,
      itemWarrantyInformation: itemWarrantyInformationCountList,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemBatteryLife: itemBatteryLifeCountList,
      itemPriceRange: countPerPrice,
      itemOperatingSystem: itemOperatingSystemCountList,
      itemStorageCapacity: itemStorageCapacityCountList,
      itemProcessor: itemProcessorCountList,
      itemRamSize: itemRamSizeCountList,
      itemType: itemTypeCountList,
      itemStorage: itemStorageCountList,
      itemMemory: itemMemoryCountList,
      itemFeatures: itemFeaturesCountList,
      itemConnectivity: itemConnectivityCountList,
      itemSupportedStandards: itemSupportedStandardsCountList,
      itemMegapixels: itemMegapixelsCountList,
      itemWalkieTalkiesType: itemWalkieTalkiesTypeCountList,
      itemLandLineType: itemLandLineTypeCountList,
      itemAccessoryType: itemAccessoryTypeCountList,
      itemNetworkProvider: itemNetworkProviderCountList,
      itemScreenSizeRange: itemScreenSizeRangeCountList,
      itemMemoryCapacity: itemMemoryCapacityCountList,
      itemCameraResolution: itemCameraResolutionCountList,
      itemBatteryCapacity: itemBatteryCapacityCountList,
    });
  } catch (error) {
    res.json({ success: false, message: "Error happpend while getting data!" });
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
    const saleObj = await ForSale.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = saleObj?.length;
      else count = saleObj.filter((obj) => obj.itemCategory == item)?.length;
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
