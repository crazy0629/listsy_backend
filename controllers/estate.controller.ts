import { Request, Response } from "express";
import Estate from "../models/Estate";
import Multer from "multer";
import mongoose from "mongoose";

export const getMoreEstateAds = async (req: Request, res: Response) => {
  try {
    const condition = {
      listingType: { $in: req.body.listingType },
      propertyType: { $in: req.body.propertyType },
      bedroomCount: {
        $gte: req.body.minBedroomCount,
        $lte: req.body.maxBedroomCount,
      },
      bathroomCount: {
        $gte: req.body.minBathroomCount,
        $lte: req.body.maxBathroomCount,
      },
      price: {
        $gte: req.body.minPrice,
        $lte: req.body.maxPrice,
      },
    };
    const nextEstateAds = await Estate.find(condition)
      .populate("userId", "avatar reviewCount reviewMark")
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

export const getEstateInfo = async (req: Request, res: Response) => {
  Estate.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      model.adId = req.body.adId;
      model.userId = req.body.userId;
      model.title = req.body.title;
      model.subTitle = req.body.subTitle;
      model.description = req.body.description;
      model.price = req.body.price;
      model.priceUnit = req.body.priceUnit;
      model.viewCount = 0;
      model.listingType = req.body.listingType;
      model.propertyType = req.body.propertyType;
      model.bedroomCount = req.body.bedroomCount;
      model.bathroomCount = req.body.bathroomCount;
      model.tenure = req.body.tenure;
      model.propertyCondition = req.body.propertyCondition;
      model.postCode = req.body.postCode;
      model.yearBuilt = req.body.yearBuilt;
      model.builtSurface = req.body.builtSurface;
      model.builtSurfaceUnit = req.body.builtSurfaceUnit;
      model.plotSurface = req.body.plotSurface;
      model.plotSurfaceUnit = req.body.plotSurfaceUnit;
      model.keyFeatures = req.body.keyFeatures;
      model.nearestAttraction = req.body.nearestAttraction;
      model.facilities = req.body.facilities;

      await model.save();
      return res.json({
        success: true,
        message: "successfully loaded real estate video information",
      });
    }
  );
};
