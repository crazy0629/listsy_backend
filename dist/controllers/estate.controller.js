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
exports.loadEstateInfo = exports.getMoreEstateAds = void 0;
const Estate_1 = __importDefault(require("../models/Estate"));
const mongoose_1 = __importDefault(require("mongoose"));
const getMoreEstateAds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const condition = {
            listingType: { $in: req.body.listingType },
            propertyType: { $in: req.body.propertyType },
            bedroomCount: { $in: req.body.bedroomCount },
            bathroomCount: { $in: req.body.bathroomCount },
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
const loadEstateInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Estate_1.default.find({ adId: new mongoose_1.default.Types.ObjectId(req.body.adId) }).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (model.length) {
            return res.json({
                success: false,
                message: "Error found!",
            });
        }
        const newEstate = new Estate_1.default();
        newEstate.adId = req.body.adId;
        newEstate.userId = req.body.userId;
        newEstate.title = req.body.title;
        newEstate.subTitle = req.body.subTitle;
        newEstate.description = req.body.description;
        newEstate.price = req.body.price;
        newEstate.priceUnit = req.body.priceUnit;
        newEstate.viewCount = 0;
        newEstate.listingType = req.body.listingType;
        newEstate.propertyType = req.body.propertyType;
        newEstate.bedroomCount = req.body.bedroomCount;
        newEstate.bathroomCount = req.body.bathroomCount;
        newEstate.tenure = req.body.tenure;
        newEstate.propertyCondition = req.body.propertyCondition;
        newEstate.postCode = req.body.postCode;
        newEstate.yearBuilt = req.body.yearBuilt;
        newEstate.builtSurface = req.body.builtSurface;
        newEstate.builtSurfaceUnit = req.body.builtSurfaceUnit;
        newEstate.plotSurface = req.body.plotSurface;
        newEstate.plotSurfaceUnit = req.body.plotSurfaceUnit;
        newEstate.keyFeatures = req.body.keyFeatures;
        newEstate.nearestAttraction = req.body.nearestAttraction;
        newEstate.facilities = req.body.facilities;
        yield newEstate.save();
        return res.json({
            success: true,
            message: "Successfully loaded real estate media information!",
        });
    }));
});
exports.loadEstateInfo = loadEstateInfo;
