import { Request, Response } from "express";
import mongoose from "mongoose";
import Garden from "../models/Garden";

/**
 * This function is called when users upload items for homes and garden ads.
 * This loads detail items for home and garden ad info and saves on db.
 *
 * @param req
 * @param res
 */

export const loadGardenInfo = async (req: Request, res: Response) => {
  Garden.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      const newGarden = new Garden();
      newGarden.adId = req.body.adId;
      newGarden.userId = req.body.userId;
      newGarden.title = req.body.title;
      newGarden.subTitle = req.body.subTitle;
      newGarden.description = req.body.description;
      newGarden.price = req.body.price;
      newGarden.priceUnit = req.body.priceUnit;
      newGarden.address = req.body.address;
      newGarden.lat = req.body.lat;
      newGarden.lng = req.body.lng;
      newGarden.viewCount = 0;
      newGarden.itemCategory = req.body.itemCategory;
      newGarden.itemCondition = req.body.itemCondition;
      newGarden.itemColor = req.body.itemColor;
      newGarden.dimensionW = req.body.dimensionW;
      newGarden.dimensionH = req.body.dimensionH;
      newGarden.dimensionUnit = req.body.dimensionUnit;
      newGarden.itemWeight = req.body.itemWeight;
      newGarden.itemUnit = req.body.itemUnit;
      newGarden.brandName = req.body.brandName;
      newGarden.manufacturer = req.body.manufacturer;

      await newGarden.save();
      return res.json({
        success: true,
        message: "Successfully saved sale media information!",
      });
    }
  );
};

/**
 * This function is called to return Garden ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreGardenAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.itemCategory.length) {
      condition.itemCategory = { $in: req.body.itemCategory };
    }
    if (req.body.itemCondition.length) {
      condition.itemCondition = { $in: req.body.itemCondition };
    }
    const nextGardenAds = await Garden.find()
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextGardenAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more homes and garden ads",
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
  const gardenObj = await Garden.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!gardenObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  gardenObj.viewCount = gardenObj.viewCount + 1;
  await gardenObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: gardenObj,
  });
};
