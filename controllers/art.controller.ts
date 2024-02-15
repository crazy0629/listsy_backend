import { Request, Response } from "express";
import mongoose from "mongoose";
import Art from "../models/Art";

/**
 * This function is called when users upload items for homes and art ads.
 * This loads detail items for home and art ad info and saves on db.
 *
 * @param req
 * @param res
 */

export const loadArtInfo = async (req: Request, res: Response) => {
  Art.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      const newArt = new Art();
      newArt.adId = req.body.adId;
      newArt.userId = req.body.userId;
      newArt.title = req.body.title;
      newArt.subTitle = req.body.subTitle;
      newArt.description = req.body.description;
      newArt.price = req.body.price;
      newArt.priceUnit = req.body.priceUnit;
      newArt.address = req.body.address;
      newArt.lat = req.body.lat;
      newArt.lng = req.body.lng;
      newArt.viewCount = 0;
      newArt.itemCategory = req.body.itemCategory;
      newArt.itemDetailInfo = req.body.itemDetailInfo;

      await newArt.save();
      return res.json({
        success: true,
        message: "Upload Successful!",
      });
    }
  );
};

/**
 * This function is called to return Art ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreArtAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.itemCategory.length) {
      condition.itemCategory = { $in: req.body.itemCategory };
    }
    if (req.body.itemCondition.length) {
      condition.itemCondition = { $in: req.body.itemCondition };
    }
    const nextArtAds = await Art.find()
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextArtAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more homes and art ads",
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
  const artObj = await Art.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!artObj)
    return res.json({
      success: false,
      message: "Error found while loading detail info!",
    });

  artObj.viewCount = artObj.viewCount + 1;
  await artObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: artObj,
  });
};
