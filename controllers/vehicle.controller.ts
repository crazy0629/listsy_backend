import { Request, Response } from "express";
import Vehicle from "../models/Vehicle";
import Multer from "multer";
import mongoose from "mongoose";

export const uploadVideo = async (req: Request, res: Response) => {
  const multerReq = req as Request & { file?: Multer.File };

  if (!multerReq?.file) {
    // No file was uploaded, handle error
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }

  const { filename, originalname } = multerReq.file;

  const newVehicle = new Vehicle();
  newVehicle.userId = req.body.userId;
  newVehicle.isVideoAds = req.body.isVideo;
  newVehicle.videoFileName = filename;
  newVehicle.uploadDate = new Date();

  await newVehicle.save();
  res.json({
    success: true,
    message: "Video uploaded successfully",
    filename,
    originalname,
    model: newVehicle,
  });
};

export const getVehicleInfo = async (req: Request, res: Response) => {
  Vehicle.findById(new mongoose.Types.ObjectId(req.body.videoId)).then(
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
      model.vehicleType = req.body.vehicleType;
      model.saleType = req.body.saleType;
      model.condition = req.body.condition;
      model.vehicleMake = req.body.vehicleMake;
      model.vehicleModel = req.body.vehicleModel;
      model.year = req.body.year;
      model.mileage = req.body.mileage;
      model.mileageUnit = req.body.mileageUnit;
      model.gearbox = req.body.gearbox;
      model.fuelType = req.body.fuelType;
      model.doors = req.body.doors;
      model.color = req.body.color;
      model.bodyType = req.body.bodyType;
      model.seat = req.body.seat;

      await model.save();
      return res.json({
        success: true,
        message: "successfully loaded vehicle ads information",
      });
    }
  );
};

export const uploadImages = async (req: Request, res: Response) => {
  Vehicle.findById(new mongoose.Types.ObjectId(req.body.videoId)).then(
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
