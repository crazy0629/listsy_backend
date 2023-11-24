import { Request, Response } from "express";
import mongoose from "mongoose";
import Fashion from "../models/Fashion";

/**
 * This function is called when users upload items for homes and fashion ads.
 * This loads detail items for home and fashion ad info and saves on db.
 *
 * @param req
 * @param res
 */

export const loadFashionInfo = async (req: Request, res: Response) => {
  Fashion.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      const newFashion = new Fashion();
      newFashion.adId = req.body.adId;
      newFashion.userId = req.body.userId;
      newFashion.title = req.body.title;
      newFashion.subTitle = req.body.subTitle;
      newFashion.description = req.body.description;
      newFashion.price = req.body.price;
      newFashion.priceUnit = req.body.priceUnit;
      newFashion.address = req.body.address;
      newFashion.lat = req.body.lat;
      newFashion.lng = req.body.lng;
      newFashion.viewCount = 0;
      newFashion.itemCategory = req.body.itemCategory;
      newFashion.itemCondition = req.body.itemCondition;
      newFashion.itemColor = req.body.itemColor;
      newFashion.dimensionW = req.body.dimensionW;
      newFashion.dimensionH = req.body.dimensionH;
      newFashion.dimensionUnit = req.body.dimensionUnit;
      newFashion.itemWeight = req.body.itemWeight;
      newFashion.itemUnit = req.body.itemUnit;
      newFashion.brandName = req.body.brandName;
      newFashion.manufacturer = req.body.manufacturer;

      await newFashion.save();
      return res.json({
        success: true,
        message: "Successfully saved sale media information!",
      });
    }
  );
};

/**
 * This function is called to return Fashion ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreFashionAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.itemCategory.length) {
      condition.itemCategory = { $in: req.body.itemCategory };
    }
    if (req.body.itemCondition.length) {
      condition.itemCondition = { $in: req.body.itemCondition };
    }
    const nextFashionAds = await Fashion.find()
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextFashionAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message:
        "Error found while loading more homes and beauty and fashion ads",
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
  const fashionObj = await Fashion.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!fashionObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  fashionObj.viewCount = fashionObj.viewCount + 1;
  await fashionObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: fashionObj,
  });
};
