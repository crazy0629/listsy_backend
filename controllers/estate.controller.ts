import { Request, Response } from "express";
import Estate from "../models/Estate";
import mongoose from "mongoose";

/**
 * This function is called when users press each ad category.
 * And this returns detail object information.
 *
 * @param req
 * @param res
 * @returns
 */

export const getAdDetailInfo = async (req: Request, res: Response) => {
  const estateObj = await Estate.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!estateObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  estateObj.viewCount = estateObj.viewCount + 1;
  await estateObj.save();
  return res.json({
    success: true,
    message: "Success",
    data: estateObj,
  });
};

/**
 * This function is called to return estate ads objects list when users scroll down.
 * This also enables filter operation.
 *
 * @param req
 * @param res
 * @returns
 */

export const getMoreEstateAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.listingType.length) {
      condition.listingType = { $in: req.body.listingType };
    }
    if (req.body.propertyType.length) {
      condition.propertyType = { $in: req.body.propertyType };
    }
    if (req.body.bedroomCount.length) {
      condition.bedroomCount = { $in: req.body.bedroomCount };
    }
    if (req.body.bathroomCount.length) {
      condition.bathroomCount = { $in: req.body.bathroomCount };
    }
    const nextEstateAds = await Estate.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextEstateAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more estate ads",
    });
  }
};
/**
 * This function is called when users upload estate ads.
 * This loads detail estate ad info and saves on db.
 *
 * @param req
 * @param res
 */

export const loadEstateInfo = async (req: Request, res: Response) => {
  Estate.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      const newEstate = new Estate();
      newEstate.adId = req.body.adId;
      newEstate.userId = req.body.userId;
      newEstate.title = req.body.title;
      newEstate.subTitle = req.body.subTitle;
      newEstate.description = req.body.description;
      newEstate.price = req.body.price;
      newEstate.priceUnit = req.body.priceUnit;
      newEstate.address = req.body.address;
      newEstate.lat = req.body.lat;
      newEstate.lng = req.body.lng;
      newEstate.viewCount = 0;
      newEstate.listingType = req.body.listingType;
      newEstate.propertyType = req.body.propertyType;
      newEstate.bedroomCount = req.body.bedroomCount;
      newEstate.bathroomCount = req.body.bathroomCount;
      newEstate.tenure = req.body.tenure;
      newEstate.propertyCondition = req.body.propertyCondition;
      newEstate.postCode = req.body.postCode;
      newEstate.yearBuilt = req.body.yearBuilt;
      newEstate.builtSurface = req.body.builtSurface;
      newEstate.builtSurfaceUnit = req.body.builtSurfaceUnit;
      newEstate.plotSurface = req.body.plotSurface;
      newEstate.plotSurfaceUnit = req.body.plotSurfaceUnit;
      newEstate.keyFeatures = req.body.keyFeatures;
      newEstate.nearestAttraction = req.body.nearestAttraction;
      newEstate.facilities = req.body.facilities;

      await newEstate.save();
      return res.json({
        success: true,
        message: "Successfully loaded real estate media information!",
      });
    }
  );
};
