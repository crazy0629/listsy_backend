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
    if (req.body.countryCode != null) {
      if (req.body.countryCode == "") {
        condition.address = req.body.address;
      } else {
        condition.countryCode = req.body.countryCode;
      }
    }

    if (req.body.itemCategory.length) {
      condition.itemCategory = { $in: req.body.itemCategory };
    }
    const nextForSaleAds = await ForSale.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
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

export const getCountOfEachFilter = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    let condition1: any = {};

    if (req.body.countryCode != null) {
      if (req.body.countryCode == "") {
        condition.address = req.body.address;
      } else {
        condition.countryCode = req.body.countryCode;
      }
    }

    let countryCode: any = "";
    if (req.body.countryCode == "") {
      const obj = await ForSale.findOne({ address: req.body.address });
      countryCode = obj?.countryCode;
    } else {
      countryCode = req.body.countryCode;
    }

    condition1.countryCode = countryCode;
    condition1.itemCategory = req.body.itemCategory;

    const saleObjPerCountry = await ForSale.find(condition1);

    let itemSearchRangeCountList: any = [];
    let distanceList: any = [];
    saleObjPerCountry.map((item: any, index: number) => {
      distanceList.push(
        calculateDistance(item.lat, item.lng, req.body.lat, req.body.lng)
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

    let itemConditionCountList: any = [];
    let itemScreenSizeCountList: any = [];
    let itemResolutionCountList: any = [];
    let itemBrandCountList: any = [];
    let itemSmartTVCountList: any = [];
    let itemColourCountList: any = [];
    let itemWarrantyInformationCountList: any = [];
    let itemSellerRatingCountList: any = [];

    const saleObj = await ForSale.find(condition).populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark"
    );

    let countPerPrice = -1;

    if (req.body.minPrice != "" && req.body.maxPrice != "") {
      countPerPrice = saleObj.filter(
        (item) =>
          item.price >= Number(req.body.minPrice) &&
          item.price <= Number(req.body.maxPrice)
      ).length;
    }
    if (req.body.minPrice == "" && req.body.maxPrice != "") {
      countPerPrice = saleObj.filter(
        (item) => item.price <= Number(req.body.maxPrice)
      ).length;
    }
    if (req.body.minPrice != "" && req.body.maxPrice == "") {
      countPerPrice = saleObj.filter(
        (item) => item.price >= Number(req.body.minPrice)
      ).length;
    }

    req.body.itemSellerRating.map((item: string, index: number) => {
      let rating = Number(item.at(0));
      let count = 0;
      count = saleObj.filter(
        (obj) =>
          (obj as any)?.userId.reviewMark == rating &&
          (obj as any).itemCategory == req.body.itemCategory
      ).length;
      itemSellerRatingCountList.push({ itemSellerRating: item, count });
    });

    req.body.itemCondition.map((item: string, index: number) => {
      let count = 0;
      count = saleObj.filter(
        (obj) =>
          (obj as any)?.itemDetailInfo?.itemCondition == item &&
          (obj as any).itemCategory == req.body.itemCategory
      ).length;

      itemConditionCountList.push({ itemCondition: item, count });
    });

    req.body.itemScreenSize.map((item: string, index: number) => {
      let count = 0;
      count = saleObj.filter(
        (obj) =>
          (obj as any)?.itemDetailInfo?.screenSize == item &&
          (obj as any).itemCategory == req.body.itemCategory
      ).length;

      itemScreenSizeCountList.push({ itemScreenSize: item, count });
    });

    req.body.itemBrand.map((item: string, index: number) => {
      let count = 0;
      count = saleObj.filter(
        (obj) =>
          (obj as any)?.itemDetailInfo?.brand == item &&
          (obj as any).itemCategory == req.body.itemCategory
      ).length;

      itemBrandCountList.push({ itemBrand: item, count });
    });

    req.body.itemResolution.map((item: string, index: number) => {
      let count = 0;
      count = saleObj.filter(
        (obj) =>
          (obj as any)?.itemDetailInfo?.resolution == item &&
          (obj as any).itemCategory == req.body.itemCategory
      ).length;

      itemResolutionCountList.push({ itemResolution: item, count });
    });

    req.body.itemSmartTV.map((item: string, index: number) => {
      let count = 0;
      count = saleObj.filter(
        (obj) =>
          (obj as any)?.itemDetailInfo?.smartTV == item &&
          (obj as any).itemCategory == req.body.itemCategory
      ).length;

      itemSmartTVCountList.push({ itemSmartTV: item, count });
    });

    req.body.itemColour.map((item: string, index: number) => {
      let count = 0;
      count = saleObj.filter(
        (obj) =>
          (obj as any)?.itemDetailInfo?.colour == item &&
          (obj as any).itemCategory == req.body.itemCategory
      ).length;

      itemColourCountList.push({ itemColour: item, count });
    });

    req.body.itemWarrantyInformation.map((item: string, index: number) => {
      let count = 0;
      count = saleObj.filter(
        (obj) =>
          (obj as any)?.itemDetailInfo?.warrantyInformation == item &&
          (obj as any).itemCategory == req.body.itemCategory
      ).length;

      itemWarrantyInformationCountList.push({
        itemWarrantyInformation: item,
        count,
      });
    });

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
      itemPriceRange: countPerPrice,
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
