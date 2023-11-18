import { Request, Response } from "express";
import mongoose from "mongoose";
import Sports from "../models/sports";

/**
 * This function is called when users upload items for homes and sports ads.
 * This loads detail items for home and sports ad info and saves on db.
 *
 * @param req
 * @param res
 */

export const loadSportsInfo = async (req: Request, res: Response) => {
  Sports.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      const newSports = new Sports();
      newSports.adId = req.body.adId;
      newSports.userId = req.body.userId;
      newSports.title = req.body.title;
      newSports.subTitle = req.body.subTitle;
      newSports.description = req.body.description;
      newSports.price = req.body.price;
      newSports.priceUnit = req.body.priceUnit;
      newSports.addressCity = req.body.addressCity;
      newSports.addressState = req.body.addressState;
      newSports.addressCountry = req.body.addressCountry;
      newSports.viewCount = 0;
      newSports.itemCategory = req.body.itemCategory;
      newSports.itemCondition = req.body.itemCondition;
      newSports.itemColor = req.body.itemColor;
      newSports.dimensionW = req.body.dimensionW;
      newSports.dimensionH = req.body.dimensionH;
      newSports.dimensionUnit = req.body.dimensionUnit;
      newSports.itemWeight = req.body.itemWeight;
      newSports.itemUnit = req.body.itemUnit;
      newSports.brandName = req.body.brandName;
      newSports.manufacturer = req.body.manufacturer;

      await newSports.save();
      return res.json({
        success: true,
        message: "Successfully saved sale media information!",
      });
    }
  );
};

/**
 * This function is called to return Sports ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreSportsAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.itemCategory.length) {
      condition.itemCategory = { $in: req.body.itemCategory };
    }
    if (req.body.itemCondition.length) {
      condition.itemCondition = { $in: req.body.itemCondition };
    }
    const nextSportsAds = await Sports.find()
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextSportsAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more homes and sports ads",
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
  const sportsObj = await Sports.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!sportsObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  sportsObj.viewCount = sportsObj.viewCount + 1;
  await sportsObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: sportsObj,
  });
};
