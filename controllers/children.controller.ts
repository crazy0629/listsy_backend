import { Request, Response } from "express";
import mongoose from "mongoose";
import Children from "../models/Children";

/**
 * This function is called when users upload items for homes and children ads.
 * This loads detail items for home and children ad info and saves on db.
 *
 * @param req
 * @param res
 */

export const loadChildrenInfo = async (req: Request, res: Response) => {
  Children.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      const newChildren = new Children();
      newChildren.adId = req.body.adId;
      newChildren.userId = req.body.userId;
      newChildren.title = req.body.title;
      newChildren.subTitle = req.body.subTitle;
      newChildren.description = req.body.description;
      newChildren.price = req.body.price;
      newChildren.priceUnit = req.body.priceUnit;
      newChildren.addressCity = req.body.addressCity;
      newChildren.addressState = req.body.addressState;
      newChildren.addressCountry = req.body.addressCountry;
      newChildren.viewCount = 0;
      newChildren.itemCategory = req.body.itemCategory;
      newChildren.itemCondition = req.body.itemCondition;
      newChildren.itemColor = req.body.itemColor;
      newChildren.dimensionW = req.body.dimensionW;
      newChildren.dimensionH = req.body.dimensionH;
      newChildren.dimensionUnit = req.body.dimensionUnit;
      newChildren.itemWeight = req.body.itemWeight;
      newChildren.itemUnit = req.body.itemUnit;
      newChildren.brandName = req.body.brandName;
      newChildren.manufacturer = req.body.manufacturer;

      await newChildren.save();
      return res.json({
        success: true,
        message: "Successfully saved sale media information!",
      });
    }
  );
};

/**
 * This function is called to return Children ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreChildrenAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.itemCategory.length) {
      condition.itemCategory = { $in: req.body.itemCategory };
    }
    if (req.body.itemCondition.length) {
      condition.itemCondition = { $in: req.body.itemCondition };
    }
    const nextChildrenAds = await Children.find()
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextChildrenAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more homes and children ads",
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
  const childrenObj = await Children.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!childrenObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  childrenObj.viewCount = childrenObj.viewCount + 1;
  await childrenObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: childrenObj,
  });
};
