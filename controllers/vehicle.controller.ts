import { Request, Response } from "express";
import Vehicle from "../models/Vehicle";
import mongoose from "mongoose";

export const loadVehicleInfo = async (req: Request, res: Response) => {
  Vehicle.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }

      const newVehicle = new Vehicle();
      newVehicle.adId = req.body.adId;
      newVehicle.userId = req.body.userId;
      newVehicle.title = req.body.title;
      newVehicle.subTitle = req.body.subTitle;
      newVehicle.description = req.body.description;
      newVehicle.price = req.body.price;
      newVehicle.priceUnit = req.body.priceUnit;
      newVehicle.addressCity = req.body.addressCity;
      newVehicle.addressState = req.body.addressState;
      newVehicle.addressCountry = req.body.addressCountry;
      newVehicle.viewCount = 0;
      newVehicle.vehicleType = req.body.vehicleType;
      newVehicle.saleType = req.body.saleType;
      newVehicle.condition = req.body.condition;
      newVehicle.vehicleMake = req.body.vehicleMake;
      newVehicle.vehicleModel = req.body.vehicleModel;
      newVehicle.year = req.body.year;
      newVehicle.mileage = req.body.mileage;
      newVehicle.mileageUnit = req.body.mileageUnit;
      newVehicle.gearBox = req.body.gearBox;
      newVehicle.fuelType = req.body.fuelType;
      newVehicle.doors = req.body.doors;
      newVehicle.color = req.body.color;
      newVehicle.bodyType = req.body.bodyType;
      newVehicle.seat = req.body.seat;

      await newVehicle.save();

      return res.json({
        success: true,
        message: "successfully loaded vehicle ads information",
      });
    }
  );
};

export const getMoreVehicleAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.locationFilter.worldWide == false) {
      if (
        req.body.locationFilter.country != "undefined" &&
        req.body.locationFilter.country != ""
      ) {
        condition.addressCountry = req.body.locationFilter.country;
      }
      if (
        req.body.locationFilter.state != "undefined" &&
        req.body.locationFilter.state != ""
      ) {
        condition.addressState = req.body.locationFilter.state;
      }
      if (
        req.body.locationFilter.city != "undefined" &&
        req.body.locationFilter.city != ""
      ) {
        condition.addressCity = req.body.locationFilter.city;
      }
    }

    if (req.body.vehicleType.length) {
      condition.vehicleType = { $in: req.body.vehicleType };
    }
    if (req.body.saleType.length) {
      condition.saleType = { $in: req.body.saleType };
    }
    if (req.body.condition.length) {
      condition.condition = { $in: req.body.condition };
    }
    if (req.body.vehicleMake.length) {
      condition.vehicleMake = { $in: req.body.vehicleMake };
    }
    if (req.body.vehicleModel.length) {
      condition.vehicleModel = { $in: req.body.vehicleModel };
    }
    if (req.body.year.length) {
      condition.year = { $in: req.body.year };
    }
    if (req.body.gearBox.length) {
      condition.gearBox = { $in: req.body.gearBox };
    }
    const nextVehicleAds = await Vehicle.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextVehicleAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more truck ads",
    });
  }
};

export const getAdDetailInfo = async (req: Request, res: Response) => {
  const vehicleObj = await Vehicle.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!vehicleObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  vehicleObj.viewCount = vehicleObj.viewCount + 1;
  await vehicleObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: vehicleObj,
  });
};
