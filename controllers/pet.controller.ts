import { Request, Response } from "express";
import Pet from "../models/Pet";
import mongoose from "mongoose";
import Ad from "../models/Ad";
import User from "../models/User";
import { generateToken } from "../service/helper";

export const getMorePetAds = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (
      req.body.centerLocationSelected == true &&
      req.body.SearchWithin != ""
    ) {
      condition.countryCode = req.body.selectedLocation.countryCode;
    } else {
      if (req.body.countryCode != null) {
        if (req.body.countryCode == "") {
          condition.address = req.body.address;
        } else {
          condition.countryCode = req.body.countryCode;
        }
      }
    }
    if (req.body.itemCategory != "All" && req.body.itemCategory != "") {
      condition.itemCategory = req.body.itemCategory;
    }
    let nextPetsAds = await Pet.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);
    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextPetsAds,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found while loading more food ads",
    });
  }
};
export const getCountForEachCategory = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.countryCode != null) {
      if (req.body.countryCode == "") {
        condition.address = req.body.address;
      } else {
        condition.countryCode = req.body.countryCode;
      }
    }

    let countList: any = [];
    const petObj = await Pet.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = petObj?.length;
      else count = petObj.filter((obj) => obj.itemCategory == item)?.length;
      countList.push({ itemCategory: item, count });
    });
    return res.json({
      success: true,
      countList,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

export const loadPetInfo = async (req: Request, res: Response) => {
  Pet.find({ adId: new mongoose.Types.ObjectId(req.body.adId) }).then(
    async (model: any) => {
      if (model?.length) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }

      Ad.findById(new mongoose.Types.ObjectId(req.body.adId)).then(
        async (adModel: any) => {
          adModel.address = req.body.address;
          adModel.lng = req.body.lng;
          adModel.lat = req.body.lat;
          adModel.countryCode = req.body.countryCode;
          await adModel.save();
        }
      );

      const newPet = new Pet();
      newPet.adId = req.body.adId;
      newPet.userId = req.body.userId;
      newPet.title = req.body.title;
      newPet.subTitle = req.body.subTitle;
      newPet.description = req.body.description;
      newPet.price = req.body.price;
      newPet.priceUnit = req.body.priceUnit;
      newPet.address = req.body.address;
      newPet.lat = req.body.lat;
      newPet.lng = req.body.lng;
      newPet.countryCode = req.body.countryCode;
      newPet.viewCount = 0;
      newPet.itemCategory = req.body.itemCategory;
      newPet.itemDetailInfo = req.body.itemDetailInfo;

      await newPet.save();
    }
  );
  User.findById(new mongoose.Types.ObjectId(req.body.userId)).then(
    async (model: any) => {
      if (!model) {
        return res.json({
          success: false,
          message: "Error found!",
        });
      }
      if (model.telephoneNumber == undefined) {
        model.telephoneNumber = req.body.telephoneNumber;
        model.phoneNumberShare = req.body.phoneNumberShare;
        await model.save();
      }

      return res.json({
        success: true,
        message: "Upload Successful!",
        data: model,
        token: generateToken(model),
      });
    }
  );
};

export const getAdDetailInfo = async (req: Request, res: Response) => {
  const petObj = await Pet.findOne({ adId: req.body.adId })
    .populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
    )
    .populate("adId", "adFileName imagesFileName uploadDate duration");

  if (!petObj)
    return res.json({
      success: false,
      message: "Error found while loading deail info!",
    });

  petObj.viewCount = petObj.viewCount + 1;
  await petObj.save();

  return res.json({
    success: true,
    message: "Success",
    data: petObj,
  });
};
