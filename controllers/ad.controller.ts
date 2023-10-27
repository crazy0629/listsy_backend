import { Request, Response } from "express";
import Ad from "../models/Ad";
import Estate from "../models/Estate";
import Multer from "multer";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

const { getVideoDurationInSeconds } = require("get-video-duration");

/**
 * Upload Video/Audio function
 *
 * @param req
 * @param res
 * @returns
 */

export const uploadAd = async (req: Request, res: Response) => {
  const multerReq = req as Request & { file?: Multer.File };
  if (!multerReq?.file) {
    // No file was uploaded, handle error
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }

  const { filename, originalname } = multerReq.file;

  const newAd = new Ad();
  newAd.fileType = req.body.fileType;
  newAd.adFileName = "/uploads/ads/" + filename;
  newAd.uploadDate = req.body.uploadDate;
  const ad_dir = path.join(__dirname, "../uploads/ads/" + filename);
  newAd.duration = await getVideoDurationInSeconds(ad_dir);
  await newAd.save();

  res.json({
    success: true,
    message: "Ad is uploaded successfully",
    filename,
    originalname,
    model: newAd,
  });
};

/**
 * Upload extra images function
 *
 * @param req
 * @param res
 */

export const uploadImages = async (req: Request, res: Response) => {
  Ad.findById(new mongoose.Types.ObjectId(req.body.adId)).then(
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
        const { filename } = multerReq.files[index];
        imageNames.push("/uploads/images/" + filename);
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

/**
 * Cancel upload function when users press close button
 *
 * @param req
 * @param res
 */

export const cancelUpload = async (req: Request, res: Response) => {
  Ad.findById(new mongoose.Types.ObjectId(req.body.adId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error happened while getting data!",
        });
      }

      const adFilePath = path.join(__dirname, "/.." + model.adFileName);
      fs.unlink(adFilePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
        console.log("File deleted successfully");
      });

      const adObj = await Ad.findByIdAndDelete(
        new mongoose.Types.ObjectId(req.body.adId)
      );

      if (req.body.adType == "estate") {
        const estateObj = await Estate.deleteOne({ adId: req.body.adId });
      }

      return res.json({
        success: true,
        message: "Upload is cancelled successfully",
      });
    }
  );
};
