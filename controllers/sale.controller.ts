import { Request, Response } from "express";
import ForSale from "../models/ForSale";
import mongoose from "mongoose";
import Ad from "../models/Ad";

/**
 * This function is called when users upload items for sale ads.
 * This loads detail items for sale ad info and saves on db.
 *
 * @param req
 * @param res
 */

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
      return res.json({
        success: true,
        message: "Successfully saved sale media information!",
      });
    }
  );
};

/**
 * This function is called to return ForSale ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

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
            item.userId.reviewMark.toString() + "*"
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
    return res.json({
      success: false,
      message: "Error found while loading more electronics ads",
    });
  }
};

/**
 * This function is called when users press each ad category.
 * And this returns detail object information.
 *
 * @param req
 * @param res
 * @returns
 */

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

function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadiusMiles = 3958.8; // Earth's radius in miles

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusMiles * c;

  return distance;
}

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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingWarrantyInformation &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingSmart &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        warrantyInformationMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      const isMatchingRating = (obj as any)?.userId.reviewMark == rating;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        warrantyInformationMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingBrand &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        warrantyInformationMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingColour &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        warrantyInformationMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo?.warrantyInformation
          )
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingResolution &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        warrantyInformationMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo?.warrantyInformation
          )
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingScreenSize &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        warrantyInformationMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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

      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo?.warrantyInformation
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingCondition &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        warrantyInformationMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
      );
    })?.length;

    itemConditionCountList.push({
      itemCondition: item,
      count,
    });
  });

  return itemConditionCountList;
};

const getCountOnMinMaxPrice = async (minPrice, maxPrice, filter, saleObj) => {
  let countPerPrice = -1;

  countPerPrice = saleObj.filter((obj) => {
    let minPriceCondition = true,
      maxPriceCondition = true;

    if (minPrice != "") minPriceCondition = obj.price >= Number(minPrice);
    if (maxPrice != "") maxPriceCondition = obj.price <= Number(maxPrice);

    const selectedItemCondition = filter.itemCondition?.length > 0;
    const selectedScreenSizeCondition = filter.screenSize?.length > 0;
    const selectedResolutionCondition = filter.resolution?.length > 0;
    const selectedBrandCondition = filter.brand?.length > 0;
    const selectedSmartTVCondition = filter.smartTV?.length > 0;
    const selectedColorCondition = filter.colour?.length > 0;
    const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
    const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
    const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
    const selectedOperatingSystemCondition = filter.operatingSystem?.length > 0;
    const selectedStorageCapacityCondition = filter.storageCapacity?.length > 0;
    const selectedProcessorCondition = filter.processor?.length > 0;
    const selectedRamSizeCondition = filter.ramSize?.length > 0;
    const selectedTypeCondition = filter.type?.length > 0;
    const selectedStorageCondition = filter.storage?.length > 0;
    const selectedMemoryCondition = filter.memory?.length > 0;

    const itemConditionMatches = selectedItemCondition
      ? filter.itemCondition.includes(
          (obj as any)?.itemDetailInfo?.itemCondition
        )
      : true;
    const screenSizeMatches = selectedScreenSizeCondition
      ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
      : true;
    const resolutionMatches = selectedResolutionCondition
      ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
      : true;
    const brandMatches = selectedBrandCondition
      ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
      : true;
    const smartTVMatches = selectedSmartTVCondition
      ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
      : true;
    const colourMatches = selectedColorCondition
      ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
      : true;
    const warrantyInformationMatches = selectedWarrantyCondition
      ? filter.warrantyInformation.includes(
          (obj as any)?.itemDetailInfo.warrantyInformation
        )
      : true;
    const sellerRatingMatches = selectedSellerRatingCondition
      ? filter.sellerRating.includes(
          parseInt((obj as any)?.userId.reviewMark).toString() + "*"
        )
      : true;
    const batteryLifeMatches = selectedBatteryLifeCondition
      ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
      : true;
    const operatingSystemMatches = selectedOperatingSystemCondition
      ? filter.operatingSystem.includes(
          (obj as any)?.itemDetailInfo.operatingSystem
        )
      : true;
    const storageCapacityMatches = selectedStorageCapacityCondition
      ? filter.storageCapacity.includes(
          (obj as any)?.itemDetailInfo.storageCapacity
        )
      : true;
    const processorMatches = selectedProcessorCondition
      ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
      : true;
    const ramSizeMatches = selectedRamSizeCondition
      ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
      : true;
    const typeMatches = selectedTypeCondition
      ? filter.type.includes((obj as any)?.itemDetailInfo.type)
      : true;
    const storageMatches = selectedStorageCondition
      ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
      : true;
    const memoryMatches = selectedMemoryCondition
      ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
      : true;

    return (
      minPriceCondition &&
      maxPriceCondition &&
      itemConditionMatches &&
      screenSizeMatches &&
      resolutionMatches &&
      brandMatches &&
      smartTVMatches &&
      colourMatches &&
      sellerRatingMatches &&
      warrantyInformationMatches &&
      batteryLifeMatches &&
      operatingSystemMatches &&
      storageCapacityMatches &&
      processorMatches &&
      ramSizeMatches &&
      typeMatches &&
      storageMatches &&
      memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingBatteryLife &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        warrantyInformationMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingOperatingSystem &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        warrantyInformationMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingStorageCapacity &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        warrantyInformationMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingProcessor &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        warrantyInformationMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingRamSize &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        warrantyInformationMatches &&
        typeMatches &&
        storageMatches &&
        memoryMatches
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
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingType &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        warrantyInformationMatches &&
        storageMatches &&
        memoryMatches
      );
    })?.length;
    itemTypeCountList.push({
      itemType: item,
      count,
    });
  });
  return itemTypeCountList;
};

const getCountOnStorage = async (
  itemStorage,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemStorageCountList: any = [];

  itemStorage.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingStorage = (obj as any)?.itemDetailInfo?.storage == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;
      const selectedMemoryCondition = filter.memory?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.warrantyInformation.includes(
            (obj as any)?.itemDetailInfo.warrantyInformation
          )
        : true;
      const memoryMatches = selectedMemoryCondition
        ? filter.memory.includes((obj as any)?.itemDetailInfo.memory)
        : true;

      return (
        isMatchingStorage &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        warrantyInformationMatches &&
        memoryMatches
      );
    })?.length;
    itemStorageCountList.push({
      itemStorage: item,
      count,
    });
  });
  return itemStorageCountList;
};

const getCountOnMemory = async (
  itemMemory,
  filter,
  itemCategory,
  saleObj,
  minPrice,
  maxPrice
) => {
  let itemMemoryCountList: any = [];

  itemMemory.map((item: string, index: number) => {
    let count = 0;
    count = saleObj.filter((obj) => {
      const isMatchingMemory = (obj as any)?.itemDetailInfo?.memory == item;
      const isMatchingItemCategory = (obj as any).itemCategory == itemCategory;
      let minPriceCondition = true;
      let maxPriceCondition = true;

      if (minPrice != "")
        minPriceCondition = (obj as any).price >= Number(minPrice);
      if (maxPrice != "")
        maxPriceCondition = (obj as any).price <= Number(maxPrice);

      const selectedItemCondition = filter.itemCondition?.length > 0;
      const selectedScreenSizeCondition = filter.screenSize?.length > 0;
      const selectedResolutionCondition = filter.resolution?.length > 0;
      const selectedBrandCondition = filter.brand?.length > 0;
      const selectedSmartTVCondition = filter.smartTV?.length > 0;
      const selectedColorCondition = filter.colour?.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
      const selectedBatteryLifeCondition = filter.batteryLife?.length > 0;
      const selectedOperatingSystemCondition =
        filter.operatingSystem?.length > 0;
      const selectedStorageCapacityCondition =
        filter.storageCapacity?.length > 0;
      const selectedProcessorCondition = filter.processor?.length > 0;
      const selectedRamSizeCondition = filter.ramSize?.length > 0;
      const selectedTypeCondition = filter.type?.length > 0;
      const selectedStorageCondition = filter.storage?.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation?.length > 0;

      const itemConditionMatches = selectedItemCondition
        ? filter.itemCondition.includes(
            (obj as any)?.itemDetailInfo?.itemCondition
          )
        : true;
      const screenSizeMatches = selectedScreenSizeCondition
        ? filter.screenSize.includes((obj as any)?.itemDetailInfo?.screenSize)
        : true;
      const resolutionMatches = selectedResolutionCondition
        ? filter.resolution.includes((obj as any)?.itemDetailInfo?.resolution)
        : true;
      const brandMatches = selectedBrandCondition
        ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
        : true;
      const smartTVMatches = selectedSmartTVCondition
        ? filter.smartTV.includes((obj as any)?.itemDetailInfo.smartTV)
        : true;
      const colourMatches = selectedColorCondition
        ? filter.colour.includes((obj as any)?.itemDetailInfo.colour)
        : true;
      const sellerRatingMatches = selectedSellerRatingCondition
        ? filter.sellerRating.includes(
            parseInt((obj as any)?.userId.reviewMark).toString() + "*"
          )
        : true;
      const batteryLifeMatches = selectedBatteryLifeCondition
        ? filter.batteryLife.includes((obj as any)?.itemDetailInfo.batteryLife)
        : true;
      const operatingSystemMatches = selectedOperatingSystemCondition
        ? filter.operatingSystem.includes(
            (obj as any)?.itemDetailInfo.operatingSystem
          )
        : true;
      const storageCapacityMatches = selectedStorageCapacityCondition
        ? filter.storageCapacity.includes(
            (obj as any)?.itemDetailInfo.storageCapacity
          )
        : true;
      const processorMatches = selectedProcessorCondition
        ? filter.processor.includes((obj as any)?.itemDetailInfo.processor)
        : true;
      const ramSizeMatches = selectedRamSizeCondition
        ? filter.ramSize.includes((obj as any)?.itemDetailInfo.ramSize)
        : true;
      const typeMatches = selectedTypeCondition
        ? filter.type.includes((obj as any)?.itemDetailInfo.type)
        : true;
      const storageMatches = selectedStorageCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;
      const warrantyInformationMatches = selectedWarrantyCondition
        ? filter.storage.includes((obj as any)?.itemDetailInfo.storage)
        : true;

      return (
        isMatchingMemory &&
        isMatchingItemCategory &&
        minPriceCondition &&
        maxPriceCondition &&
        itemConditionMatches &&
        screenSizeMatches &&
        resolutionMatches &&
        brandMatches &&
        smartTVMatches &&
        colourMatches &&
        sellerRatingMatches &&
        batteryLifeMatches &&
        operatingSystemMatches &&
        storageCapacityMatches &&
        processorMatches &&
        ramSizeMatches &&
        typeMatches &&
        storageMatches &&
        warrantyInformationMatches
      );
    })?.length;
    itemMemoryCountList.push({
      itemMemory: item,
      count,
    });
  });
  return itemMemoryCountList;
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
      const saleObjPerCountry = await ForSale.find(condition1);
      saleObjPerCountry
        .filter((obj) => {
          let minPriceCondition = true;
          let maxPriceCondition = true;

          if (req.body.minPrice != "")
            minPriceCondition = (obj as any).price >= Number(req.body.minPrice);
          if (req.body.maxPrice != "")
            maxPriceCondition = (obj as any).price <= Number(req.body.maxPrice);

          const selectedItemCondition =
            req.body.filter.itemCondition?.length > 0;
          const selectedScreenSizeCondition =
            req.body.filter.screenSize?.length > 0;
          const selectedResolutionCondition =
            req.body.filter.resolution?.length > 0;
          const selectedBrandCondition = req.body.filter.brand?.length > 0;
          const selectedSmartTVCondition = req.body.filter.smartTV?.length > 0;
          const selectedColorCondition = req.body.filter.colour?.length > 0;
          const selectedSellerRatingCondition =
            req.body.filter.sellerRating?.length > 0;
          const selectedWarrantyCondition =
            req.body.filter.warrantyInformation?.length > 0;
          const selectedBatteryLifeCondition =
            req.body.filter.batteryLife?.length > 0;
          const selectedOperatingSystemCondition =
            req.body.filter.operatingSystem?.length > 0;
          const selectedStorageCapacityCondition =
            req.body.filter.storageCapacity?.length > 0;
          const selectedProcessorCondition =
            req.body.filter.processor?.length > 0;
          const selectedRamSizeCondition = req.body.filter.ramSize?.length > 0;
          const selectedTypeCondition = req.body.filter.type?.length > 0;
          const selectedStorageCondition = req.body.filter.storage?.length > 0;
          const selectedMemoryCondition = req.body.filter.memory?.length > 0;

          const itemConditionMatches = selectedItemCondition
            ? req.body.filter.itemCondition.includes(
                (obj as any)?.itemDetailInfo?.itemCondition
              )
            : true;
          const screenSizeMatches = selectedScreenSizeCondition
            ? req.body.filter.screenSize.includes(
                (obj as any)?.itemDetailInfo?.screenSize
              )
            : true;
          const resolutionMatches = selectedResolutionCondition
            ? req.body.filter.resolution.includes(
                (obj as any)?.itemDetailInfo?.resolution
              )
            : true;
          const brandMatches = selectedBrandCondition
            ? req.body.filter.brand.includes(
                (obj as any)?.itemDetailInfo?.brand
              )
            : true;
          const smartTVMatches = selectedSmartTVCondition
            ? req.body.filter.smartTV.includes(
                (obj as any)?.itemDetailInfo.smartTV
              )
            : true;
          const colourMatches = selectedColorCondition
            ? req.body.filter.colour.includes(
                (obj as any)?.itemDetailInfo.colour
              )
            : true;
          const warrantyInformationMatches = selectedWarrantyCondition
            ? req.body.filter.warrantyInformation.includes(
                (obj as any)?.itemDetailInfo.warrantyInformation
              )
            : true;
          const sellerRatingMatches = selectedSellerRatingCondition
            ? req.body.filter.sellerRating.includes(
                parseInt((obj as any)?.userId.reviewMark).toString() + "*"
              )
            : true;
          const batteryLifeMatches = selectedBatteryLifeCondition
            ? req.body.filter.batteryLife.includes(
                (obj as any)?.itemDetailInfo.batteryLife
              )
            : true;
          const operatingSystemMatches = selectedOperatingSystemCondition
            ? req.body.filter.operatingSystem.includes(
                (obj as any)?.itemDetailInfo.operatingSystem
              )
            : true;
          const storageCapacityMatches = selectedStorageCapacityCondition
            ? req.body.filter.storageCapacity.includes(
                (obj as any)?.itemDetailInfo.storageCapacity
              )
            : true;
          const processorMatches = selectedProcessorCondition
            ? req.body.filter.processor.includes(
                (obj as any)?.itemDetailInfo.processor
              )
            : true;
          const ramSizeMatches = selectedRamSizeCondition
            ? req.body.filter.ramSize.includes(
                (obj as any)?.itemDetailInfo.ramSize
              )
            : true;
          const typeMatches = selectedTypeCondition
            ? req.body.filter.type.includes((obj as any)?.itemDetailInfo.type)
            : true;
          const storageMatches = selectedStorageCondition
            ? req.body.filter.storage.includes(
                (obj as any)?.itemDetailInfo.storage
              )
            : true;
          const memoryMatches = selectedMemoryCondition
            ? req.body.filter.memory.includes(
                (obj as any)?.itemDetailInfo.memory
              )
            : true;

          return (
            minPriceCondition &&
            maxPriceCondition &&
            itemConditionMatches &&
            screenSizeMatches &&
            resolutionMatches &&
            brandMatches &&
            smartTVMatches &&
            colourMatches &&
            sellerRatingMatches &&
            warrantyInformationMatches &&
            batteryLifeMatches &&
            operatingSystemMatches &&
            storageCapacityMatches &&
            processorMatches &&
            ramSizeMatches &&
            typeMatches &&
            storageMatches &&
            memoryMatches
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

    let countPerPrice = await getCountOnMinMaxPrice(
      req.body.minPrice,
      req.body.maxPrice,
      req.body.filter,
      saleObj
    );

    if (req.body.itemStorage) {
      itemStorageCountList = await getCountOnStorage(
        req.body.itemStorage,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
    }

    if (req.body.itemMemory) {
      itemMemoryCountList = await getCountOnMemory(
        req.body.itemMemory,
        req.body.filter,
        req.body.itemCategory,
        saleObj,
        req.body.minPrice,
        req.body.maxPrice
      );
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
      message: "Error happened while getting data!",
    });
  }
};
