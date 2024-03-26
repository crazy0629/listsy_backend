import { Request, Response } from "express";
import Pet from "../models/Pet";
import mongoose from "mongoose";
import Ad from "../models/Ad";
import User from "../models/User";
import {
  calculateDistance,
  checkPriceMatches,
  generateToken,
  getConditionToCountry,
  locationFilterDistanceAds,
  priceFilterAds,
  sellerRatingFilterAds,
} from "../service/helper";
import { getEmotCount } from "./userEmot.controller";

export const loadPetsInfo = async (req: Request, res: Response) => {
  try {
    const petModel = await Pet.find({
      adId: new mongoose.Types.ObjectId(req.body.adId),
    });
    if (petModel.length) {
      return res.json({
        success: false,
        message: "Ad publishing unsuccessful. Try again or contact support!",
      });
    }
    const adModel = await Ad.findById(
      new mongoose.Types.ObjectId(req.body.adId)
    );
    if (!adModel) {
      return res.json({
        success: false,
        message: "Ad publishing unsuccessful. Try again or contact support!",
      });
    }
    adModel.address = req.body.address;
    adModel.lng = req.body.lng;
    adModel.lat = req.body.lat;
    adModel.countryCode = req.body.countryCode;
    await adModel.save();

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

    const userModel = await User.findById(
      new mongoose.Types.ObjectId(req.body.userId)
    );
    if (!userModel) {
      return res.json({
        success: false,
        message: "Ad publishing unsuccessful. Try again or contact support!",
      });
    }
    if (userModel.telephoneNumber == undefined) {
      userModel.telephoneNumber = req.body.telephoneNumber;
      userModel.phoneNumberShare = req.body.phoneNumberShare;
      await userModel.save();
    }
    return res.json({
      success: true,
      message: "Upload Successful!",
      data: userModel,
      token: generateToken(userModel),
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Ad publishing unsuccessful. Try again or contact support!",
    });
  }
};

export const getAdDetailInfo = async (req: Request, res: Response) => {
  try {
    const petObj = await Pet.findOne({ adId: req.body.adId })
      .populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark telephoneNumber phoneNumberShare"
      )
      .populate("adId", "adFileName imagesFileName uploadDate duration");

    if (!petObj)
      return res.json({
        success: false,
        message: "Error found while loading detail info!",
      });

    petObj.viewCount = petObj.viewCount + 1;
    await petObj.save();

    const emotCount = await getEmotCount(req.body.adId);

    return res.json({
      success: true,
      message: "Success",
      data: petObj,
      count: emotCount,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

export const getMorePetAds = async (req: Request, res: Response) => {
  try {
    let condition = getConditionToCountry(req.body);
    let nextPetAds = await Pet.find(condition)
      .populate("userId", "firstName lastName avatar reviewCount reviewMark")
      .populate("adId", "adFileName imagesFileName uploadDate duration")
      .sort({ postDate: -1 })
      .skip(req.body.index * 50)
      .limit(50);

    nextPetAds = locationFilterDistanceAds(req.body, nextPetAds);
    nextPetAds = priceFilterAds(req.body, nextPetAds);
    nextPetAds = sellerRatingFilterAds(req.body, nextPetAds);

    if (req.body.subCategory != "" && req.body.subCategory != undefined) {
      nextPetAds = nextPetAds.filter(
        (item: any) => req.body.subCategory == item.itemDetailInfo.subcategory
      );
    }

    if (req.body.breed && req.body.breed?.length) {
      let index = req.body.breed.indexOf("Not Specified");
      req.body.breed[index] = "";

      nextPetAds = nextPetAds.filter(
        (item: any) => req.body.breed.indexOf(item.itemDetailInfo.breed) !== -1
      );
    }
    if (req.body.vaccinations && req.body.vaccinations?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.vaccinations.indexOf(item.itemDetailInfo.vaccinations) !== -1
      );
    }
    if (req.body.gender && req.body.gender?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.gender.indexOf(item.itemDetailInfo.gender) !== -1
      );
    }
    if (req.body.age && req.body.age?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) => req.body.age.indexOf(item.itemDetailInfo.age) !== -1
      );
    }

    if (req.body.tankSize && req.body.tankSize?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.tankSize.indexOf(item.itemDetailInfo.tankSize) !== -1
      );
    }

    if (req.body.careLevel && req.body.careLevel?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.careLevel.indexOf(item.itemDetailInfo.careLevel) !== -1
      );
    }

    if (req.body.diet && req.body.diet?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) => req.body.diet.indexOf(item.itemDetailInfo.diet) !== -1
      );
    }

    if (req.body.species && req.body.species?.length) {
      let index = req.body.species.indexOf("Not Specified");
      req.body.species[index] = "";

      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.species.indexOf(item.itemDetailInfo.species) !== -1
      );
    }

    if (req.body.size && req.body.size?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) => req.body.size.indexOf(item.itemDetailInfo.size) !== -1
      );
    }

    if (req.body.type && req.body.type?.length) {
      let index = req.body.type.indexOf("Not Specified");
      req.body.type[index] = "";

      nextPetAds = nextPetAds.filter(
        (item: any) => req.body.type.indexOf(item.itemDetailInfo.type) !== -1
      );
    }

    if (req.body.trainingLevel && req.body.trainingLevel?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.trainingLevel.indexOf(item.itemDetailInfo.trainingLevel) !==
          -1
      );
    }

    if (req.body.healthCertification && req.body.healthCertification?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.healthCertification.indexOf(item.itemDetailInfo.health) !==
          -1
      );
    }

    if (req.body.hoofCare && req.body.hoofCare?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.hoofCare.indexOf(item.itemDetailInfo.hoofCare) !== -1
      );
    }
    if (req.body.insurance && req.body.insurance?.length) {
      nextPetAds = nextPetAds.filter(
        (item: any) =>
          req.body.insurance.indexOf(item.itemDetailInfo.insurance) !== -1
      );
    }

    if (req.body.petType && req.body.petType?.length) {
      nextPetAds = nextPetAds.filter((item: any) => {
        const set = new Set(req.body.petType);
        for (let element of item.itemDetailInfo.type) {
          if (set.has(element)) {
            return true;
          }
        }
        return false;
      });
    }

    return res.json({
      success: true,
      message: "Successfully loaded!",
      data: nextPetAds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error found while loading more fashion ads",
    });
  }
};

export const getCountForEachCategory = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    if (req.body.countryCode != null) {
      condition.countryCode = req.body.countryCode;
    }

    let countList: any = [];
    const petModel = await Pet.find(condition);
    req.body.itemCategory.map((item: string, index: number) => {
      let count = 0;
      if (item == "All") count = petModel?.length;
      else count = petModel.filter((obj) => obj.itemCategory == item)?.length;
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

export const getCountOfEachFilter = async (req: Request, res: Response) => {
  try {
    let condition: any = {};
    let condition1: any = {};

    condition.countryCode = req.body.countryCode;

    if (req.body.itemCategory != "All" && req.body.itemCategory != "") {
      condition.itemCategory = req.body.itemCategory;
    }

    let itemSearchRangeCountList: any = [];
    let distanceList: any = [];
    if (req.body.centerLocationAvailable == true) {
      condition1.countryCode = req.body.selectedLocation.countryCode;
      condition1.itemCategory = req.body.itemCategory;
      const petModelPerCountry = await Pet.find(condition1).populate(
        "userId",
        "firstName lastName avatar reviewCount reviewMark"
      );
      petModelPerCountry
        .filter((obj) => {
          return (
            checkPriceMatches(req.body.minPrice, req.body.maxPrice, obj) &&
            checkPetSellerRatingMatches(req.body, obj) &&
            checkBreedMatches(req.body, obj) &&
            checkVaccinationsMatches(req.body, obj) &&
            checkGenderMatches(req.body, obj) &&
            checkAgeMatches(req.body, obj) &&
            checkSubCategoryMatches(req.body, obj) &&
            checkTankSizeMatches(req.body, obj) &&
            checkCareLevelMatches(req.body, obj) &&
            checkDietMatches(req.body, obj) &&
            checkSpeciesMatches(req.body, obj) &&
            checkSizeMatches(req.body, obj) &&
            checkTypeMatches(req.body, obj) &&
            checkTraingLevelMatches(req.body, obj) &&
            checkHealthMatches(req.body, obj) &&
            checkHoofCareMatches(req.body, obj) &&
            checkInsuranceMatches(req.body, obj) &&
            checkPetTypeMatches(req.body, obj)
          );
        })
        .map((item: any, index: number) => {
          distanceList.push(
            calculateDistance(
              item.lat,
              item.lng,
              req.body.selectedLocation.lat,
              req.body.selectedLocation.lng
            )
          );
        });
      req.body.itemSearchRange.map((item: number, index: number) => {
        if (item == -1) {
          itemSearchRangeCountList.push({
            range: -1,
            distance: distanceList?.length,
          });
        } else {
          itemSearchRangeCountList.push({
            range: item,
            distance: distanceList.filter((dis) => dis <= item)?.length,
          });
        }
      });
    }
    let petObj = await Pet.find(condition).populate(
      "userId",
      "firstName lastName avatar reviewCount reviewMark"
    );

    if (
      req.body.centerLocationAvailable == true &&
      req.body.filter.SearchWithin != "" &&
      req.body.filter.SearchWithin != "Nationwide"
    ) {
      let distance = 0;
      if (req.body.filter.SearchWithin != "Current location")
        distance = parseInt(req.body.filter.SearchWithin.match(/\d+/)[0]);
      petObj = petObj.filter((item) => {
        return (
          calculateDistance(
            item.lat,
            item.lng,
            req.body.selectedLocation.lat,
            req.body.selectedLocation.lng
          ) <= distance
        );
      });
    }
    let countPerPrice = await getCountOnMinMaxPrice(req.body, petObj);
    let itemSellerRatingCountList = [];
    let itemBreedCountList = [];
    let itemVaccinationsCountList = [];
    let itemGenderCountList = [];
    let itemAgeCountList = [];
    let itemSubCategoryCountList = [];
    let itemTankSizeCountList = [];
    let itemCareLevelCountList = [];
    let itemDietCountList = [];
    let itemSpeciesCountList = [];
    let itemSizeCountList = [];
    let itemTypeCountList = [];
    let itemTrainingLevelCountList = [];
    let itemHealthCountList = [];
    let itemHoofCareCountList = [];
    let itemInsuranceCountList = [];
    let itemPetTypeCountList = [];

    if (req.body.itemSellerRating) {
      itemSellerRatingCountList = await getCountOnSellerRating(
        req.body,
        petObj
      );
    }

    if (req.body.itemBreed) {
      itemBreedCountList = await getCountOnBreed(req.body, petObj);
    }

    if (req.body.itemVaccinations) {
      itemVaccinationsCountList = await getCountOnVaccinations(
        req.body,
        petObj
      );
    }

    if (req.body.itemGender) {
      itemGenderCountList = await getCountOnGender(req.body, petObj);
    }

    if (req.body.itemAge) {
      itemAgeCountList = await getCountOnAge(req.body, petObj);
    }

    if (req.body.itemSubCategory) {
      itemSubCategoryCountList = await getCountOnSubCategory(req.body, petObj);
    }

    if (req.body.itemTankSize) {
      itemTankSizeCountList = await getCountOnTankSize(req.body, petObj);
    }

    if (req.body.itemCareLevel) {
      itemCareLevelCountList = await getCountOnCareLevel(req.body, petObj);
    }

    if (req.body.itemDiet) {
      itemDietCountList = await getCountOnDiet(req.body, petObj);
    }

    if (req.body.itemSpecies) {
      itemSpeciesCountList = await getCountOnSpecies(req.body, petObj);
    }

    if (req.body.itemSize) {
      itemSizeCountList = await getCountOnSize(req.body, petObj);
    }

    if (req.body.itemType) {
      itemTypeCountList = await getCountOnType(req.body, petObj);
    }

    if (req.body.itemTrainingLevel) {
      itemTrainingLevelCountList = await getCountOnTrainingLevel(
        req.body,
        petObj
      );
    }

    if (req.body.itemHealth) {
      itemHealthCountList = await getCountOnHealth(req.body, petObj);
    }

    if (req.body.itemHoofCare) {
      itemHoofCareCountList = await getCountOnHoofCare(req.body, petObj);
    }

    if (req.body.itemInsurance) {
      itemInsuranceCountList = await getCountOnInsurance(req.body, petObj);
    }

    if (req.body.itemPetType) {
      itemPetTypeCountList = await getCountOnPetType(req.body, petObj);
    }
    return res.json({
      success: true,
      itemPriceRange: countPerPrice,
      itemRangeInfo: itemSearchRangeCountList,
      itemSellerRating: itemSellerRatingCountList,
      itemBreed: itemBreedCountList,
      itemVaccinations: itemVaccinationsCountList,
      itemGender: itemGenderCountList,
      itemAge: itemAgeCountList,
      itemSubCategory: itemSubCategoryCountList,
      itemTankSize: itemTankSizeCountList,
      itemCareLevel: itemCareLevelCountList,
      itemDiet: itemDietCountList,
      itemSpecies: itemSpeciesCountList,
      itemSize: itemSizeCountList,
      itemType: itemTypeCountList,
      itemTrainingLevel: itemTrainingLevelCountList,
      itemHealth: itemHealthCountList,
      itemHoofCare: itemHoofCareCountList,
      itemInsurance: itemInsuranceCountList,
      itemPetType: itemPetTypeCountList,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error found!",
    });
  }
};

const getCountOnMinMaxPrice = async (mainParam, petObj) => {
  let countPerPrice = -1;
  countPerPrice = petObj.filter((obj) => {
    return (
      checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
      checkPetSellerRatingMatches(mainParam, obj) &&
      checkBreedMatches(mainParam, obj) &&
      checkVaccinationsMatches(mainParam, obj) &&
      checkGenderMatches(mainParam, obj) &&
      checkAgeMatches(mainParam, obj) &&
      checkSubCategoryMatches(mainParam, obj) &&
      checkTankSizeMatches(mainParam, obj) &&
      checkCareLevelMatches(mainParam, obj) &&
      checkDietMatches(mainParam, obj) &&
      checkSpeciesMatches(mainParam, obj) &&
      checkSizeMatches(mainParam, obj) &&
      checkTypeMatches(mainParam, obj) &&
      checkTraingLevelMatches(mainParam, obj) &&
      checkHealthMatches(mainParam, obj) &&
      checkHoofCareMatches(mainParam, obj) &&
      checkInsuranceMatches(mainParam, obj) &&
      checkPetTypeMatches(mainParam, obj)
    );
  })?.length;
  return countPerPrice;
};

const getCountOnSellerRating = async (mainParam, petObj) => {
  let itemSellerRatingCountList: any = [];

  mainParam?.itemSellerRating.map((item: string, index: number) => {
    let rating = Number(item.at(0));
    let count = 0;
    count = petObj.filter((obj) => {
      const isMatchingRating =
        Math.floor((obj as any)?.userId.reviewMark) == rating;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;

      return (
        isMatchingRating &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;

    itemSellerRatingCountList.push({ itemSellerRating: item, count });
  });
  return itemSellerRatingCountList;
};

const getCountOnBreed = async (mainParam, petObj) => {
  let itemBreedCountList: any = [];

  mainParam?.itemBreed.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = petObj.filter((obj) => {
      const isMatchingBreed = (obj as any)?.itemDetailInfo?.breed == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingBreed &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemBreedCountList.push({
      itemBreed: item,
      count,
    });
  });

  return itemBreedCountList;
};

const getCountOnVaccinations = async (mainParam, petObj) => {
  let itemVaccinationsCountList: any = [];

  mainParam?.itemVaccinations.map((item: string, index: number) => {
    let count = 0;

    count = petObj.filter((obj) => {
      const isMatchingVaccinations =
        (obj as any)?.itemDetailInfo?.vaccinations == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingVaccinations &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemVaccinationsCountList.push({
      itemVaccinations: item,
      count,
    });
  });

  return itemVaccinationsCountList;
};

const getCountOnGender = async (mainParam, petObj) => {
  let itemGenderCountList: any = [];

  mainParam?.itemGender.map((item: string, index: number) => {
    let count = 0;

    count = petObj.filter((obj) => {
      const isMatchingGender = (obj as any)?.itemDetailInfo?.gender == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingGender &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemGenderCountList.push({
      itemGender: item,
      count,
    });
  });

  return itemGenderCountList;
};

const getCountOnAge = async (mainParam, petObj) => {
  let itemAgeCountList: any = [];

  mainParam?.itemAge.map((item: string, index: number) => {
    let count = 0;

    count = petObj.filter((obj) => {
      const isMatchingAge = (obj as any)?.itemDetailInfo?.age == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingAge &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemAgeCountList.push({
      itemAge: item,
      count,
    });
  });

  return itemAgeCountList;
};

const getCountOnSubCategory = async (mainParam, petObj) => {
  let itemSubCategoryCountList: any = [];

  mainParam?.itemSubCategory.map((item: string, index: number) => {
    let count = 0;

    count = petObj.filter((obj) => {
      const isMatchingSubCategory =
        (obj as any)?.itemDetailInfo?.subcategory == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSubCategory &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemSubCategoryCountList.push({
      itemSubCategory: item,
      count,
    });
  });

  return itemSubCategoryCountList;
};

const getCountOnTankSize = async (mainParam, petObj) => {
  let itemTankSizeCountList: any = [];

  mainParam?.itemTankSize.map((item: string, index: number) => {
    let count = 0;

    count = petObj.filter((obj) => {
      const isMatchingTankSize = (obj as any)?.itemDetailInfo?.tankSize == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingTankSize &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemTankSizeCountList.push({
      itemTankSize: item,
      count,
    });
  });

  return itemTankSizeCountList;
};

const getCountOnCareLevel = async (mainParam, petObj) => {
  let itemCareLevelCountList: any = [];

  mainParam?.itemCareLevel.map((item: string, index: number) => {
    let count = 0;

    count = petObj.filter((obj) => {
      const isMatchingCareLevel =
        (obj as any)?.itemDetailInfo?.careLevel == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingCareLevel &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemCareLevelCountList.push({
      itemCareLevel: item,
      count,
    });
  });
  return itemCareLevelCountList;
};

const getCountOnDiet = async (mainParam, petObj) => {
  let itemDietCountList: any = [];

  mainParam?.itemDiet.map((item: string, index: number) => {
    let count = 0;

    count = petObj.filter((obj) => {
      const isMatchingDiet = (obj as any)?.itemDetailInfo?.diet == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingDiet &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemDietCountList.push({
      itemDiet: item,
      count,
    });
  });
  return itemDietCountList;
};

const getCountOnSpecies = async (mainParam, petObj) => {
  let itemSpeciesCountList: any = [];

  mainParam?.itemSpecies.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = petObj.filter((obj) => {
      const isMatchingSpecies = (obj as any)?.itemDetailInfo?.species == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSpecies &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemSpeciesCountList.push({
      itemSpecies: item,
      count,
    });
  });
  return itemSpeciesCountList;
};

const getCountOnSize = async (mainParam, petObj) => {
  let itemSizeCountList: any = [];

  mainParam?.itemSize.map((item: string, index: number) => {
    let count = 0;

    count = petObj.filter((obj) => {
      const isMatchingSize = (obj as any)?.itemDetailInfo?.size == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingSize &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemSizeCountList.push({
      itemSize: item,
      count,
    });
  });
  return itemSizeCountList;
};

const getCountOnType = async (mainParam, petObj) => {
  let itemTypeCountList: any = [];

  mainParam?.itemType.map((item: string, index: number) => {
    let count = 0,
      temp = "";
    if (item != "Not Specified") {
      temp = item;
    }
    count = petObj.filter((obj) => {
      const isMatchingType = (obj as any)?.itemDetailInfo?.type == temp;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemTypeCountList.push({
      itemType: item,
      count,
    });
  });
  return itemTypeCountList;
};

const getCountOnTrainingLevel = async (mainParam, petObj) => {
  let itemTrainingLevelCountList: any = [];

  mainParam?.itemTrainingLevel.map((item: string, index: number) => {
    let count = 0;
    count = petObj.filter((obj) => {
      const isMatchingTrainingLevel =
        (obj as any)?.itemDetailInfo?.trainingLevel == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingTrainingLevel &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemTrainingLevelCountList.push({
      itemTrainingLevel: item,
      count,
    });
  });
  return itemTrainingLevelCountList;
};

const getCountOnHealth = async (mainParam, petObj) => {
  let itemHealthCountList: any = [];

  mainParam?.itemHealth.map((item: string, index: number) => {
    let count = 0;
    count = petObj.filter((obj) => {
      const isMatchingHealth = (obj as any)?.itemDetailInfo?.health == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingHealth &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemHealthCountList.push({
      itemHealth: item,
      count,
    });
  });
  return itemHealthCountList;
};

const getCountOnHoofCare = async (mainParam, petObj) => {
  let itemHoofCareCountList: any = [];

  mainParam?.itemHoofCare.map((item: string, index: number) => {
    let count = 0;
    count = petObj.filter((obj) => {
      const isMatchingHoofCare = (obj as any)?.itemDetailInfo?.hoofCare == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingHoofCare &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemHoofCareCountList.push({
      itemHoofCare: item,
      count,
    });
  });
  return itemHoofCareCountList;
};

const getCountOnInsurance = async (mainParam, petObj) => {
  let itemInsuranceCountList: any = [];

  mainParam?.itemInsurance.map((item: string, index: number) => {
    let count = 0;
    count = petObj.filter((obj) => {
      const isMatchingInsurance =
        (obj as any)?.itemDetailInfo?.insurance == item;
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingInsurance &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkPetTypeMatches(mainParam, obj)
      );
    })?.length;
    itemInsuranceCountList.push({
      itemInsurance: item,
      count,
    });
  });
  return itemInsuranceCountList;
};

const getCountOnPetType = async (mainParam, petObj) => {
  let itemPetTypeCountList: any = [];

  mainParam?.itemPetType.map((item: string, index: number) => {
    let count = 0;
    count = petObj.filter((obj) => {
      const isMatchingPetType = (obj as any)?.itemDetailInfo?.type.includes(
        item
      );
      const isMatchingItemCategory =
        (obj as any).itemCategory == mainParam.itemCategory;
      return (
        isMatchingPetType &&
        isMatchingItemCategory &&
        checkPriceMatches(mainParam.minPrice, mainParam.maxPrice, obj) &&
        checkPetSellerRatingMatches(mainParam, obj) &&
        checkBreedMatches(mainParam, obj) &&
        checkVaccinationsMatches(mainParam, obj) &&
        checkGenderMatches(mainParam, obj) &&
        checkAgeMatches(mainParam, obj) &&
        checkSubCategoryMatches(mainParam, obj) &&
        checkTankSizeMatches(mainParam, obj) &&
        checkCareLevelMatches(mainParam, obj) &&
        checkDietMatches(mainParam, obj) &&
        checkSpeciesMatches(mainParam, obj) &&
        checkSizeMatches(mainParam, obj) &&
        checkTypeMatches(mainParam, obj) &&
        checkTraingLevelMatches(mainParam, obj) &&
        checkHealthMatches(mainParam, obj) &&
        checkHoofCareMatches(mainParam, obj) &&
        checkInsuranceMatches(mainParam, obj)
      );
    })?.length;
    itemPetTypeCountList.push({
      itemPetType: item,
      count,
    });
  });
  return itemPetTypeCountList;
};

const checkPetSellerRatingMatches = (mainParam, obj) => {
  if (
    mainParam.filter.subCategory == "" &&
    mainParam.itemCategory != "Pet Supplies"
  )
    return true;
  const subCategory =
    mainParam.itemCategory == "Pet Supplies"
      ? "supplies"
      : mainParam.filter.subCategory;
  const dataArray = mainParam.filter[subCategory].sellerRating;
  const selectedSellerRatingCondition = dataArray?.length > 0;
  const sellerRatingMatches = selectedSellerRatingCondition
    ? dataArray.includes(
        parseInt((obj as any)?.userId.reviewMark).toString() + "*"
      )
    : true;
  return sellerRatingMatches;
};

const checkBreedMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.breed;
  const selectedBreedCondition = dataArray?.length > 0;
  let index = dataArray?.indexOf("Not Specified");
  if (index > -1) {
    dataArray[index] = "";
  }
  const breedMatches = selectedBreedCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.breed)
    : true;
  return breedMatches;
};

const checkVaccinationsMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray =
    mainParam.filter[mainParam.filter.subCategory]?.vaccinations;
  const selectedVaccinationsCondition = dataArray?.length > 0;

  const vaccinationsMatches = selectedVaccinationsCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.vaccinations)
    : true;
  return vaccinationsMatches;
};

const checkGenderMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.gender;
  const selectedGenderCondition = dataArray?.length > 0;

  const genderMatches = selectedGenderCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.gender)
    : true;
  return genderMatches;
};

const checkAgeMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.age;
  const selectedAgeCondition = dataArray?.length > 0;

  const ageMatches = selectedAgeCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.age)
    : true;
  return ageMatches;
};

const checkSubCategoryMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const subCategoryMatches =
    mainParam.filter.subCategory == obj.itemDetailInfo?.subcategory;
  return subCategoryMatches;
};

const checkTankSizeMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.tankSize;
  const selectedTankSizeCondition = dataArray?.length > 0;

  const tankSizeMatches = selectedTankSizeCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.tankSize)
    : true;
  return tankSizeMatches;
};

const checkCareLevelMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.careLevel;
  const selectedCareLevelCondition = dataArray?.length > 0;

  const careLevelMatches = selectedCareLevelCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.careLevel)
    : true;
  return careLevelMatches;
};

const checkDietMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.diet;
  const selectedDietCondition = dataArray?.length > 0;

  const dietMatches = selectedDietCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.diet)
    : true;
  return dietMatches;
};

const checkSpeciesMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.species;
  const selectedSpeciesCondition = dataArray?.length > 0;
  let index = dataArray?.indexOf("Not Specified");
  if (index > -1) {
    dataArray[index] = "";
  }
  const speciesMatches = selectedSpeciesCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.species)
    : true;
  return speciesMatches;
};

const checkSizeMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.size;
  const selectedSizeCondition = dataArray?.length > 0;
  const sizeMatches = selectedSizeCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.size)
    : true;
  return sizeMatches;
};

const checkTypeMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.type;
  const selectedTypeCondition = dataArray?.length > 0;
  let index = dataArray?.indexOf("Not Specified");
  if (index > -1) {
    dataArray[index] = "";
  }
  const typeMatches = selectedTypeCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.type)
    : true;
  return typeMatches;
};

const checkTraingLevelMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray =
    mainParam.filter[mainParam.filter.subCategory]?.trainingLevel;
  const selectedTrainingLevelCondition = dataArray?.length > 0;

  const trainingLevelMatches = selectedTrainingLevelCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.trainingLevel)
    : true;
  return trainingLevelMatches;
};

const checkHealthMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray =
    mainParam.filter[mainParam.filter.subCategory]?.healthCertification;
  const selectedHealthCondition = dataArray?.length > 0;

  const healthMatches = selectedHealthCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.health)
    : true;
  return healthMatches;
};

const checkHoofCareMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.hoofCare;
  const selectedHoofCareCondition = dataArray?.length > 0;

  const hoofCareMatches = selectedHoofCareCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.hoofCare)
    : true;
  return hoofCareMatches;
};

const checkInsuranceMatches = (mainParam, obj) => {
  if (mainParam.filter.subCategory == "") return true;
  const dataArray = mainParam.filter[mainParam.filter.subCategory]?.insurance;
  const selectedInsuranceCondition = dataArray?.length > 0;

  const insuranceMatches = selectedInsuranceCondition
    ? dataArray.includes((obj as any)?.itemDetailInfo?.insurance)
    : true;
  return insuranceMatches;
};

const checkPetTypeMatches = (mainParam, obj) => {
  if (
    mainParam.filter.subCategory == "" &&
    mainParam.itemCategory != "Pet Supplies"
  )
    return true;
  const subCategory =
    mainParam.itemCategory == "Pet Supplies"
      ? "supplies"
      : mainParam.filter.subCategory;
  const dataArray = mainParam.filter[subCategory].petType;

  const selectedPetTypeCondition = dataArray?.length > 0;

  if (selectedPetTypeCondition) {
    const set = new Set(dataArray);
    for (let element of (obj as any)?.itemDetailInfo.type) {
      if (set.has(element)) {
        return true;
      }
    }
    return false;
  } else {
    return true;
  }
};
