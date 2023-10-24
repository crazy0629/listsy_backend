import { Request, Response } from "express";
import Vehicle from "../models/Vehicle";
import Multer from "multer";
import mongoose from "mongoose";

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
