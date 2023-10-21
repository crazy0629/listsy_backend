import { Request, Response } from "express";
import Estate from "../models/Estate";
import Multer from "multer";
import mongoose from "mongoose";

export const uploadAd = async (req: Request, res: Response) => {
  const multerReq = req as Request & { file?: Multer.File };

  if (!multerReq?.file) {
    // No file was uploaded, handle error
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }

  const { filename, originalname } = multerReq.file;

  const newEstate = new Estate();
  newEstate.userId = req.body.userId;
  newEstate.isVideoAds = req.body.isVideo;
  newEstate.adFileName = filename;
  newEstate.uploadDate = new Date();

  await newEstate.save();
  res.json({
    success: true,
    message: "Ad is uploaded successfully",
    filename,
    originalname,
    model: newEstate,
  });
};

export const getEstateInfo = async (req: Request, res: Response) => {
  Estate.findById(new mongoose.Types.ObjectId(req.body.videoId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error happened while loading data!",
        });
      }

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

export const uploadImages = async (req: Request, res: Response) => {
  Estate.findById(new mongoose.Types.ObjectId(req.body.videoId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error happened while loading data!",
        });
      }

      const multerReq = req as Request & { files?: Multer.Files };

      let imageNames: any = [];
      for (let index = 0; index < multerReq.files.length; index++) {
        const { fileName, originalname } = multerReq.files[index];
        imageNames.push(fileName);
      }
      model.imagesFileName = imageNames;
      await model.save();

      return res.json({
        success: true,
        message: "Images are successfully uploaded",
      });
    }
  );
};

export const getEstateAds = async (req: Request, res: Response) => {
  const condition = {
    listingType: { $in: req.body.listingType },
    propertyType: { $in: req.body.propertyType },
  };
  Estate.find(condition).then(async (model: any) => {
    const filterData = model.filter(
      (item) =>
        item.bedroomCount == req.body.bedroomCount &&
        item.bathroomCount == req.body.bathroomCount
    );
  });
};
