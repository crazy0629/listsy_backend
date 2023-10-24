import { Request, Response } from "express";
import Ad from "../models/Ad";
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

  const newAd = new Ad();
  newAd.fileType = req.body.fileType;
  newAd.adFileName = "/uploads/ads/" + filename;
  newAd.uploadDate = new Date();

  await newAd.save();

  res.json({
    success: true,
    message: "Ad is uploaded successfully",
    filename,
    originalname,
    model: newAd,
  });
};

export const uploadImages = async (req: Request, res: Response) => {
  Ad.findById(new mongoose.Types.ObjectId(req.body.videoId)).then(
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

export const cancelUpload = async (req: Request, res: Response) => {
  Ad.findById(new mongoose.Types.ObjectId(req.body.videoId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error happened while getting data!",
        });
      }
      const adObj = await Ad.deleteOne({ id: req.body.videoId });

      if (!adObj) {
        return res.json({ success: false, message: "Ad not exist" });
      }

      if (req.body.adType == "estate") {
        const estateObj = await Estate.deleteOne({ adId: req.body.videoId });
        if (!estateObj) {
          return res.json({
            success: false,
            message: "Erro found while canceling upload!",
          });
        }
      }

      return res.json({
        success: true,
        message: "Upload is cancelled successfully",
      });
    }
  );
};
