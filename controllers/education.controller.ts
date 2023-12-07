import { Request, Response } from "express";
import mongoose from "mongoose";
import Education from "../models/Education";

/**
 * This function is called when users upload items for homes and education ads.
 * This loads detail items for home and education ad info and saves on db.
 *
 * @param req
 * @param res
 */

export const loadEducationInfo = async (req: Request, res: Response) => {
  Education.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      const newEducation = new Education();
      newEducation.adId = req.body.adId;
      newEducation.userId = req.body.userId;
      newEducation.title = req.body.title;
      newEducation.subTitle = req.body.subTitle;
      newEducation.description = req.body.description;
      newEducation.price = req.body.price;
      newEducation.priceUnit = req.body.priceUnit;
      newEducation.address = req.body.address;
      newEducation.lat = req.body.lat;
      newEducation.lng = req.body.lng;
      newEducation.viewCount = 0;
      newEducation.itemCategory = req.body.itemCategory;
      newEducation.itemDetailInfo = req.body.itemDetailInfo;

      await newEducation.save();
      return res.json({
        success: true,
        message: "Successfully saved book and education media information!",
      });
    }
  );
};

/**
 * This function is called to return Education ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreEducationAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.itemCategory.length) {
      condition.itemCategory = { $in: req.body.itemCategory };
    }
    if (req.body.itemCondition.length) {
      condition.itemCondition = { $in: req.body.itemCondition };
    }
    const nextEducationAds = await Education.find()
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextEducationAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more homes and education ads",
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
  const educationObj = await Education.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!educationObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  educationObj.viewCount = educationObj.viewCount + 1;
  await educationObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: educationObj,
  });
};
