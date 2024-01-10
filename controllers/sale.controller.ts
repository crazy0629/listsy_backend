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
      if (model.length) {
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

    if (req.body.sellerRating && req.body.sellerRating.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.sellerRating.indexOf(
            item.userId.reviewMark.toString() + "*"
          ) !== -1
      );
    }
    if (req.body.smartTV && req.body.smartTV.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.smartTV.indexOf(item.itemDetailInfo.smartTV) !== -1
      );
    }
    if (req.body.warrantyInformation && req.body.warrantyInformation.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.warrantyInformation.indexOf(
            item.itemDetailInfo.warrantyInformation
          ) !== -1
      );
    }
    if (req.body.colour && req.body.colour.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.colour.indexOf(item.itemDetailInfo.colour) !== -1
      );
    }
    if (req.body.brand && req.body.brand.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) => req.body.brand.indexOf(item.itemDetailInfo.brand) !== -1
      );
    }
    if (req.body.resolution && req.body.resolution.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.resolution.indexOf(item.itemDetailInfo.resolution) !== -1
      );
    }
    if (req.body.screenSize && req.body.screenSize.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.screenSize.indexOf(item.itemDetailInfo.screenSize) !== -1
      );
    }
    if (req.body.itemCondition && req.body.itemCondition.length) {
      nextForSaleAds = nextForSaleAds.filter(
        (item: any) =>
          req.body.itemCondition.indexOf(item.itemDetailInfo.itemCondition) !==
          -1
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
    console.log(error);
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

      const selectedItemCondition = filter.itemCondition.length > 0;
      const selectedScreenSizeCondition = filter.screenSize.length > 0;
      const selectedResolutionCondition = filter.resolution.length > 0;
      const selectedBrandCondition = filter.brand.length > 0;
      const selectedSmartTVCondition = filter.smartTV.length > 0;
      const selectedColorCondition = filter.colour.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating.length > 0;

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
        sellerRatingMatches
      );
    }).length;
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

      const selectedItemCondition = filter.itemCondition.length > 0;
      const selectedScreenSizeCondition = filter.screenSize.length > 0;
      const selectedResolutionCondition = filter.resolution.length > 0;
      const selectedBrandCondition = filter.brand.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation.length > 0;
      const selectedColorCondition = filter.colour.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating.length > 0;

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
        sellerRatingMatches
      );
    }).length;

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

      const selectedItemCondition = filter.itemCondition.length > 0;
      const selectedScreenSizeCondition = filter.screenSize.length > 0;
      const selectedResolutionCondition = filter.resolution.length > 0;
      const selectedBrandCondition = filter.brand.length > 0;
      const selectedSmartTVCondition = filter.smartTV.length > 0;
      const selectedColorCondition = filter.colour.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation.length > 0;

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
        warrantyInformationMatches
      );
    }).length;

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

      const selectedItemCondition = filter.itemCondition.length > 0;
      const selectedScreenSizeCondition = filter.screenSize.length > 0;
      const selectedResolutionCondition = filter.resolution.length > 0;
      const selectedSmartTVCondition = filter.smartTV.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation.length > 0;
      const selectedColorCondition = filter.colour.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating.length > 0;

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
        sellerRatingMatches
      );
    }).length;

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

      const selectedItemCondition = filter.itemCondition.length > 0;
      const selectedScreenSizeCondition = filter.screenSize.length > 0;
      const selectedResolutionCondition = filter.resolution.length > 0;
      const selectedBrandCondition = filter.brand.length > 0;
      const selectedSmartTVCondition = filter.smartTV.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating.length > 0;

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
        sellerRatingMatches
      );
    }).length;

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

      const selectedItemCondition = filter.itemCondition.length > 0;
      const selectedScreenSizeCondition = filter.screenSize.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation.length > 0;
      const selectedBrandCondition = filter.brand.length > 0;
      const selectedSmartTVCondition = filter.smartTV.length > 0;
      const selectedColorCondition = filter.colour.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating.length > 0;

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
        sellerRatingMatches
      );
    }).length;

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

      const selectedItemCondition = filter.itemCondition.length > 0;
      const selectedWarrantyCondition = filter.warrantyInformation.length > 0;
      const selectedResolutionCondition = filter.resolution.length > 0;
      const selectedBrandCondition = filter.brand.length > 0;
      const selectedSmartTVCondition = filter.smartTV.length > 0;
      const selectedColorCondition = filter.colour.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating.length > 0;

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
        sellerRatingMatches
      );
    }).length;

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

      const selectedWarrantyCondition = filter.warrantyInformation.length > 0;
      const selectedScreenSizeCondition = filter.screenSize.length > 0;
      const selectedResolutionCondition = filter.resolution.length > 0;
      const selectedBrandCondition = filter.brand.length > 0;
      const selectedSmartTVCondition = filter.smartTV.length > 0;
      const selectedColorCondition = filter.colour.length > 0;
      const selectedSellerRatingCondition = filter.sellerRating.length > 0;

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
        sellerRatingMatches
      );
    }).length;

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

    const selectedItemCondition = filter.itemCondition.length > 0;
    const selectedScreenSizeCondition = filter.screenSize.length > 0;
    const selectedResolutionCondition = filter.resolution.length > 0;
    const selectedBrandCondition = filter.brand.length > 0;
    const selectedSmartTVCondition = filter.smartTV.length > 0;
    const selectedColorCondition = filter.colour.length > 0;
    const selectedSellerRatingCondition = filter.sellerRating.length > 0;
    const selectedWarrantyCondition = filter.warrantyInformation.length > 0;
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
      warrantyInformationMatches
    );
  }).length;

  return countPerPrice;
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
            req.body.filter.itemCondition.length > 0;
          const selectedScreenSizeCondition =
            req.body.filter.screenSize.length > 0;
          const selectedResolutionCondition =
            req.body.filter.resolution.length > 0;
          const selectedBrandCondition = req.body.filter.brand.length > 0;
          const selectedSmartTVCondition = req.body.filter.smartTV.length > 0;
          const selectedColorCondition = req.body.filter.colour.length > 0;
          const selectedSellerRatingCondition =
            req.body.filter.sellerRating.length > 0;
          const selectedWarrantyCondition =
            req.body.filter.warrantyInformation.length > 0;

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
            warrantyInformationMatches
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
            distance: distanceList.length,
          });
        } else {
          itemSearchRangeCountList.push({
            range: item,
            distance: distanceList.filter((dis) => dis <= item).length,
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
      req.body.itemProcessor.map((item: string, index: number) => {
        let count = 0;
        count = saleObj.filter(
          (obj) =>
            (obj as any)?.itemDetailInfo?.processor == item &&
            (obj as any).itemCategory == req.body.itemCategory
        ).length;

        itemProcessorCountList.push({ itemProcessor: item, count });
      });
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
      req.body.itemOperatingSystem.map((item: string, index: number) => {
        let count = 0;
        count = saleObj.filter(
          (obj) =>
            (obj as any)?.itemDetailInfo?.operatingSystem == item &&
            (obj as any).itemCategory == req.body.itemCategory
        ).length;

        itemOperatingSystemCountList.push({ itemOperatingSystem: item, count });
      });
    }

    if (req.body.itemStorageCapacity) {
      req.body.itemStorageCapacity.map((item: string, index: number) => {
        let count = 0;
        count = saleObj.filter(
          (obj) =>
            (obj as any)?.itemDetailInfo?.storageCapacity == item &&
            (obj as any).itemCategory == req.body.itemCategory
        ).length;

        itemStorageCapacityCountList.push({ itemStorageCapacity: item, count });
      });
    }

    if (req.body.itemType) {
      req.body.itemType.map((item: string, index: number) => {
        let count = 0;
        count = saleObj.filter(
          (obj) =>
            (obj as any)?.itemDetailInfo?.type == item &&
            (obj as any).itemCategory == req.body.itemCategory
        ).length;

        itemTypeCountList.push({ itemType: item, count });
      });
    }

    if (req.body.itemBatteryLife) {
      req.body.itemBatteryLife.map((item: string, index: number) => {
        let count = 0;
        count = saleObj.filter(
          (obj) =>
            (obj as any)?.itemDetailInfo?.batteryLife == item &&
            (obj as any).itemCategory == req.body.itemCategory
        ).length;

        itemBatteryLifeCountList.push({
          itemBatteryLife: item,
          count,
        });
      });
    }

    if (req.body.itemRamSize) {
      req.body.itemRamSize.map((item: string, index: number) => {
        let count = 0;
        count = saleObj.filter(
          (obj) =>
            (obj as any)?.itemDetailInfo?.ramSize == item &&
            (obj as any).itemCategory == req.body.itemCategory
        ).length;

        itemRamSizeCountList.push({ itemRamSize: item, count });
      });
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
      if (item == "All") count = saleObj.length;
      else count = saleObj.filter((obj) => obj.itemCategory == item).length;
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
