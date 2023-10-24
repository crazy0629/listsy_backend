"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstateInfo = exports.getMoreEstateAds = void 0;
const Estate_1 = __importDefault(require("../models/Estate"));
const mongoose_1 = __importDefault(require("mongoose"));
const getMoreEstateAds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const nextEstateAds = yield Estate_1.default.find(condition)
            .populate("userId", "avatar reviewCount reviewMark")
            .sort({ postDate: -1 })
            .skip(req.body.index * 50)
            .limit(50);
        return res.json({
            success: true,
            message: "Successfully loaded!",
            data: nextEstateAds,
        });
    }
    catch (error) {
        return res.json({
            success: false,
            message: "Error found while loading more estate ads",
        });
    }
});
exports.getMoreEstateAds = getMoreEstateAds;
const getEstateInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Estate_1.default.find({ adId: new mongoose_1.default.Types.ObjectId(req.body.adId) }).then((model) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield model.save();
        return res.json({
            success: true,
            message: "successfully loaded real estate video information",
        });
    }));
});
exports.getEstateInfo = getEstateInfo;
